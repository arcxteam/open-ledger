# A Complete Guide - Run OpenLedger Node as Provided Model Roles

What is **OpenLedger**? OpenLedger's data Blockchain AI network providing a decentralized system to create and train specialized language models (SLMs). It uses "Datanets" to gather and organize data, enabling the development of AI (Agents) tools like DeSci, chatbots, copilots, and other model applications.

## Here We Go...GAS 

**`Is there incentivized?` ![Confirm](https://img.shields.io/badge/confirm-yes-brightgreen)**

> [!IMPORTANT]
> **Disclaimer:**: This rewards structure is subject to change at any time. The entire point system and associated benefits may be revamped depending on testnet developments. Openledger reserves all rights to modify or update these terms as necessary to ensure optimal network growth and functionality. [Docs](https://openledger.gitbook.io/openledger/testnet/early-node-runner-benefits)

---

![openledger-Blockchain-for-AI-01-13-2025_11_36_PM](https://github.com/user-attachments/assets/a8edd348-ab71-438b-85b5-983173dd17e0)
![Desktop-screenshot-01-13-2025_11_26_PM](https://github.com/user-attachments/assets/99e86b82-ec52-41c7-a1ab-a6ba7a6967cb)

## 1. Preparation/Prerequisites
**1. Hardware Requirements (optional)**

> [!NOTE]
> This optional for run with VPS or anything resources

| Requirement                      | Details                                   |
|----------------------------------|-------------------------------------------|
| RAM/Memory                       | 4 GB - Up                                    |
| CPU/vCPU                         | 2 Cores - Up                                |
| Storage Space                    | 50 GB - Up                                   |
| Supported OS Linux               | Ubuntu 18, 20, 22 and 24 or Debian          |

**2. Software Requirements (required)**

| Requirement                      | Details                        |
|----------------------------------|--------------------------------|
| Node.Js                        | versions >20 - up              |
| Npm (Node Package Manager)       | versions >10 - Up              |
| Pm2 (Process Manager)            | versions >5 - Up               |
| Proxy services                   | stable residential proxy       |

**3. Supported Tools**

| Requirement                      | Details                    |
|----------------------------------|----------------------------|
| Accounts Google                  | for emails                 |
| Twitter,Telegram & Discord       | for binding                |
| Proxy services                   | free or buying (recommend) |

### Features Codes

- **Auto Send Heartbeat**
- **Auto Connect/Reconnect Nodes**
- **Auto Claim Daily Rewards**
- **Support Multiple Accounts**
- **Support Proxy Usage (HTTP-HTTPS-Socks4-5)**

> **thx for wak Hendra @ZLKCyber**

## 2. Setup Installation - Run OpenLedger Node
**1. Proxies Accounts (residentials)**

- I appreciate you, `So I'M NOT PROMO, COZ I USED IT NOW` If you need a proxy, 2captcha is a good one. There was promoted 50% off starting with 1GB for $3, many accepts crypto without fees & uses low-bandwitch + setup rotating IP locations under your generated IP addresses. [TRY SIGN UP HERE TO USED VOUCHERS](https://2captcha.com/?from=24919769)

![image](https://github.com/user-attachments/assets/ac433d24-f082-4ade-9269-a1dea2a71695)

**2. OpenLedger Dashboard Accounts**

- Signup/Login into Dashboard [https://testnet.openledger.xyz](https://testnet.openledger.xyz/?referral_code=jzs25u2tsm)
- Get address wallets from **open-ledger account**: how to get ? Go To dashboard/setting and copy your wallet, look at image below:
  ![image](https://github.com/user-attachments/assets/0403f6fb-57b4-4cce-b14e-0985370f4e32)

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
3. Copy paste for the wallet from **open-ledger account** to cmd `nano wallets.txt` 1 address per line
   ```bash
   nano wallets.txt
   ```

4. Copy paste for the proxy file. *1 proxy per line*
- It is recommended to use a proxy if you are running multiple accounts 
- Cmd `nano proxy.txt` the format proxies are `https://user:password@ip:port` | `socks5://user:password@ip:port` | `http://user:password@ip:port` I used **socks5**

  ```bash
  nano proxy.txt
  ```
5. Run this JavaScript with **Pm2 (Process Manager 2)**
   ```bash
   pm2 start npm --name open-ledger -- start
   ```
6. After run **save it**
   ```bash
   pm2 save
   pm2 startup
   ```

7. Check logs **Pm2 (Process Manager 2)**
   ```bash
   pm2 logs open-ledger
   ```

## 3. Usefull any Command

- For install Pm2 

```
npm install -g pm2
```

- For any logs

```
pm2 monit
```

```
pm2 stop open-ledger
```

```
pm2 -v
```

## ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

This project is licensed under the [MIT License](LICENSE).
