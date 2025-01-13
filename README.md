# OPEN LEDGER BOT 

![banner](image.png)


- Dashboard Web [https://testnet.openledger.xyz](https://testnet.openledger.xyz/?referral_code=jzs25u2tsm)
- Twitter [@OpenledgerHQ](https://x.com/OpenledgerHQ)


## Features

- **Auto Send Heartbeat**
- **Auto Connect/Reconnect Nodes**
- **Auto Claim Daily Rewards**
- **Support Multiple Accounts**
- **Support Proxy Usage (http/socks)**

## Requirements

- **Node.js**: Ensure you have Node.js installed.
- **npm**: Ensure you have npm installed.
- **Proxies**: `IM NOT PROMO, COZ I USED IT NOW` If you need a proxy, 2captcha is a good one. It was promoted with 50% off on 1GB for $3, it accepts crypto without fees and uses low-bandwitch + has rotating IP locations under your generated IP addresses. [TRY SIGN UP HERE TO USED VOUCHERS](https://2captcha.com/?from=24919769)

![image](https://github.com/user-attachments/assets/ac433d24-f082-4ade-9269-a1dea2a71695)


- **Wallets from open-ledger account**: how to get ???
- **Go To dashboard** [https://testnet.openledger.xyz](https://testnet.openledger.xyz/?referral_code=jzs25u2tsm) and copy your wallet, look at image below:

   ![wallet](image-1.png)

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/arcxteam/open-ledger.git
   cd open-ledger
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup: paste you wallet to `wallets.txt` file 1 address per line.
   ```bash
   nano wallets.txt
   ```

4. Optionally use proxy: paste proxy in the proxy.txt file. 1 proxy per line.
- "It is recommended to use a proxy if you are running multiple accounts."
    ```bash
    nano proxy.txt
    ```
    format : `protocol://user:password@ip:port`   | or | `protocol://ip:port`


5. Run The Script:
   ```bash
   npm run start
   ```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
