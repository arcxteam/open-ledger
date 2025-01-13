import axios from 'axios';
import axiosRetry from 'axios-retry';
import WebSocket from 'ws';
import crypto from 'crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import fs from 'fs';
import banner from './utils/banner.js';
import log from './utils/logger.js';



const headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A_Brand";v="24"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
}

function readFile(pathFile) {
    try {
        const datas = fs.readFileSync(pathFile, 'utf8')
            .split('\n')
            .map(data => data.trim())
            .filter(data => data.length > 0);
        return datas;
    } catch (error) {
        log.error(`Error reading file: ${error.message}`);
        return [];
    }
}

const newAgent = (proxy = null) => {
    if (proxy && proxy.startsWith('http://')) {
        return new HttpsProxyAgent(proxy);
    } else if (proxy && proxy.startsWith('https://')) {
        return new HttpsProxyAgent(proxy);
    } else if (proxy && (proxy.startsWith('socks4://') || proxy.startsWith('socks5://'))) {
        return new SocksProxyAgent(proxy);
    }
    return null;
};

class WebSocketClient {
    constructor(authToken, address, proxy, index) {
        this.url = `wss://apitn.openledger.xyz/ws/v1/orch?authToken=${authToken}`;
        this.ws = null;
        this.reconnect = true
        this.index = index
        this.intervalId = null
        this.registered = false;
        this.proxy = proxy;
        this.address = address;
        this.identity = btoa(address);
        this.capacity = generateRandomCapacity();
        this.id = crypto.randomUUID();
        this.heartbeat = {
            "message": {
                "Worker": {
                    "Identity": this.identity,
                    "ownerAddress": this.address,
                    "type": "LWEXT",
                    "Host": "chrome-extension://ekbbplmjjgoobhdlffmgeokalelnmjjc"
                },
                Capacity: this.capacity
            },
            "msgType": "HEARTBEAT",
            "workerType": "LWEXT",
            "workerID": this.identity
        };

        this.regWorkerID = {
            "workerID": this.identity,
            "msgType": "REGISTER",
            "workerType": "LWEXT",
            "message": {
                "id": this.id,
                "type": "REGISTER",
                "worker": {
                    "host": "chrome-extension://ekbbplmjjgoobhdlffmgeokalelnmjjc",
                    "identity": this.identity,
                    "ownerAddress": this.address,
                    "type": "LWEXT"
                }
            }
        };
    }

    loadJobData = async (event) => {
        if (event && event.data) {
            const message = JSON.parse(event.data);

            if (message?.MsgType == "JOB") {
                this.ws.send(
                    JSON.stringify({
                        workerID: this.identity,
                        msgType: "JOB_ASSIGNED",
                        workerType: "LWEXT",
                        message: {
                            Status: true,
                            Ref: message?.UUID,
                        },
                    })
                );
            }
        }
    };

    connect() {
        const agent = newAgent(this.proxy);
        const options = agent ? { agent } : {};
        this.ws = new WebSocket(this.url, options);

        this.ws.on('open', (type) => {
            log.info(`WebSocket connection established for account ${this.index}`);
            // this.ws.send(JSON.stringify({
            //     type: "WEBSOCKET_CONNECTED",
            //     message: type,
            // }))
            // this.sendMessage({
            //     type: "ALREADY_CONNECTED",
            // });
            if (!this.registered) {
                log.info(`Trying to register worker ID for account ${this.index}...`);
                this.sendMessage(this.regWorkerID);
                this.registered = true;
            }
            this.intervalId = setInterval(() => {
                log.info(`Sending heartbeat for account ${this.index}...`);
                this.sendMessage(this.heartbeat)
            }, 30 * 1000);
        });

        this.ws.on('message', (event) => {
            const message = JSON.parse(event);
            log.info(`Account ${this.index} Received message:`, message);
            if (message && message.data) {
                if (message?.data?.MsgType !== "JOB") {
                    this.sendMessage({
                        type: "WEBSOCKET_RESPONSE",
                        data: message.data,
                    });
                } else {
                    this.loadJobData(message);
                }
            }
        });

        this.ws.on('error', (error) => {
            log.error(`WebSocket error for Account ${this.index}:`, error.message || error);
        });

        this.ws.on('close', () => {
            clearInterval(this.intervalId);
            if (this.reconnect) {
                log.warn(`WebSocket connection closed for Account ${this.index}, reconnecting...`);
                setTimeout(() => this.connect("reconnect"), 5000); // Reconnect after 5 seconds
            } else {
                log.warn(`WebSocket connection closed for Account ${this.index}`);
            }
        });
    }

    sendMessage(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            log.error(`WebSocket connection is not open for Account ${this.index}, cannot send message.`);
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.reconnect = false
        }
    }
}

axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 1000,
    retryCondition: (error) => error.response?.status >= 400 || error.code === 'ECONNABORTED'
});

async function generateToken(data, proxy) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.post('https://apitn.openledger.xyz/api/v1/auth/generate_token', data, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
            httpAgent: agent
        });
        return response.data.data;
    } catch (error) {
        return null;
    }
}

async function getUserInfo(token, proxy, index) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://rewardstn.openledger.xyz/api/v1/reward_realtime', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });
        const { total_heartbeats } = response?.data?.data[0] || { total_heartbeats: '0' };
        log.info(`Account ${index} has gained points today:`, { PointsToday: total_heartbeats });

        return response.data.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            log.error('Unauthorized, token is invalid or expired');
            return 'unauthorized';
        };

        log.error('Error fetching user info:', error.message || error);
        return null;
    }
}

async function getClaimDetails(token, proxy, index) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://rewardstn.openledger.xyz/api/v1/claim_details', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });
        const { tier, dailyPoint, claimed, nextClaim = 'Not Claimed' } = response?.data?.data || {};
        log.info(`Details for Account ${index}:`, { tier, dailyPoint, claimed, nextClaim });
        return response.data.data;
    } catch (error) {
        log.error('Error fetching claim info:', error.message || error);
        return null;
    }
}

async function claimRewards(token, proxy, index) {
    const agent = newAgent(proxy);
    try {
        const response = await axios.get('https://rewardstn.openledger.xyz/api/v1/claim_reward', {
            headers: {
                ...headers,
                'Authorization': 'Bearer ' + token
            },
            httpsAgent: agent,
            httpAgent: agent
        });
        log.info(`Daily Rewards Claimed for Account ${index}:`, response.data.data);
        return response.data.data;
    } catch (error) {
        log.error('Error claiming daily reward:', error.message || error);
        return null;
    }
}

function generateRandomCapacity() {
    function getRandomFloat(min, max, decimals = 2) {
        return (Math.random() * (max - min) + min).toFixed(decimals);
    }

    return {
        AvailableMemory: parseFloat(getRandomFloat(10, 64)),
        AvailableStorage: getRandomFloat(10, 500),
        AvailableGPU: '',
        AvailableModels: []
    };
}

// Main function
const main = async () => {
    log.info(banner);
    const wallets = readFile("wallets.txt")

    if (wallets.length === 0) {
        log.error('No wallets found in wallets.txt');
        return;
    }

    const proxies = readFile("proxy.txt");

    log.info(`Starting Program for all accounts:`, wallets.length);

    const accountsProcessing = wallets.map(async (address, index) => {
        const proxy = proxies[index % proxies.length];
        let isConnected = false;


        log.info(`Processing Account ${index + 1} with proxy: ${proxy || 'No proxy'}`);

        let claimDetailsInterval;
        let userInfoInterval;


        while (!isConnected) {
            try {
                let response = await generateToken({ address }, proxy);
                while (!response || !response.token) {
                    log.error(`Failed to generate token for account ${index} retrying...`)
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    response = await generateToken({ address }, proxy);
                }

                const token = response.token;

                log.info(`login success for Account ${index + 1}:`, token.slice(0, 36) + "-" + token.slice(-24));
                log.info(`Getting user info and claim details for account ${index + 1}...`);
                const claimDaily = await getClaimDetails(token, proxy, index + 1);
                if (claimDaily && !claimDaily.claimed) {
                    log.info(`Trying to Claim Daily rewards for Account ${index + 1}...`);
                    await claimRewards(token, proxy, index + 1);
                }
                await getUserInfo(token, proxy, index + 1)

                const socket = new WebSocketClient(token, address, proxy, index + 1);
                socket.connect();
                isConnected = true;

                userInfoInterval = setInterval(async () => {
                    log.info(`Fetching total points gained today for account ${index + 1}...`);
                    const user = await getUserInfo(token, proxy, index + 1);

                    if (user === 'unauthorized') {
                        log.info(`Unauthorized: Token is invalid or expired for account ${index + 1}, reconnecting...`);

                        isConnected = false;
                        socket.close();
                        clearInterval(userInfoInterval);
                        clearInterval(claimDetailsInterval);
                    }
                }, 9 * 60 * 1000); // change to 9 minutes to prevent error 429 when claim daily reward.

                claimDetailsInterval = setInterval(async () => {
                    try {
                        log.info(`Checking Daily Rewards for Account ${index + 1}...`)
                        const claimDetails = await getClaimDetails(token, proxy, index + 1);

                        if (claimDetails && !claimDetails.claimed) {
                            log.info(`Trying to Claim Daily rewards for Account ${index + 1}...`);
                            await claimRewards(token, proxy, index + 1);
                        }
                    } catch (error) {
                        log.error(`Error fetching claim details for Account ${index + 1}: ${error.message || 'unknown error'}`);
                    }
                }, 60 * 60 * 1000); // Fetch claim details every 60 minutes

            } catch (error) {
                log.error(`Failed to start WebSocket client for Account ${index + 1}:`, error.message || 'unknown error');
                isConnected = false;

                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        process.on('SIGINT', () => {
            log.warn(`Process received SIGINT, cleaning up and exiting program...`);
            clearInterval(claimDetailsInterval);
            clearInterval(userInfoInterval);
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            log.warn(`Process received SIGTERM, cleaning up and exiting program...`);
            clearInterval(claimDetailsInterval);
            clearInterval(userInfoInterval);
            process.exit(0);
        });

    });

    await Promise.all(accountsProcessing);
};

//run
main();
