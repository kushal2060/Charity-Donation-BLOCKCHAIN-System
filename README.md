# ChariBlock - Decentralized Blockchain Charity Platform 

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Django](https://img.shields.io/badge/Django-4.2-green)
![Ethereum](https://img.shields.io/badge/Ethereum-Smart%20Contracts-purple)
![Web3](https://img.shields.io/badge/Web3-Enabled-orange)

**A transparent, secure, and decentralized charity donation platform powered by blockchain technology**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## Overview

**ChariBlock** is a blockchain-based charity platform that brings **transparency**, **security**, and **trust** to charitable donations. Built on Ethereum, ChariBlock ensures every donation is tracked on-chain, providing donors with complete visibility and accountability.


## Features

### For Donors 
- **MetaMask Wallet Integration** - Connect and donate with Web3 wallets
- **Browse Verified Charities** - Explore KYC-verified charity campaigns
- **Instant Donations** - Make secure cryptocurrency donations
- **Donation Receipts** - Get blockchain transaction hashes as proof
- **Donation History** - Track all your charitable contributions

### For Charity Organizations 
- **Create Charity Campaigns** - Launch fundraising campaigns on-chain
- **KYC Verification** - Submit documents for legitimacy verification
- **IPFS Document Storage** - Secure, decentralized document management
- **Direct Fund Receipt** - Receive donations directly to your wallet

### For Platform Admins 
- **Charity Verification System** - Review and approve charity applications
- **Document Verification** - Access uploaded KYC documents
- **Platform Controls** - Manage platform fee and emergency controls
- **Analytics Dashboard** - Monitor platform activity and statistics

---

## Demo

### MetaMask Wallet Connection
<img width="1466" height="712" alt="Metamask login" src="https://github.com/user-attachments/assets/e7bdb906-1a82-4d7c-a2c0-8fd0bb75ad9f" />

### On-Chain Charity Creation
<img width="841" height="570" alt="On-chain charity" src="https://github.com/user-attachments/assets/7dc72239-76f3-47e6-8955-e1b73683ed8e" />

### Admin Verification Dashboard
<img width="1389" height="690" alt="Verifyonchain" src="https://github.com/user-attachments/assets/97ab6d42-14a2-4c5a-8bae-05152446f692" />

### Donation Interface
<img width="1004" height="653" alt="Donate" src="https://github.com/user-attachments/assets/d1a23974-1a04-4302-ac1c-c3db551e6e49" />

### Blockchain Transaction Hash
<img width="618" height="279" alt="Donationhash" src="https://github.com/user-attachments/assets/13b47768-5509-422b-a306-d46e4cfa6289" />

---

## Tech Stack

### Frontend
- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Web3.js / Ethers.js** - Ethereum blockchain interaction
- **MetaMask SDK** - Wallet connection

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - RESTful API
- **SQLite/PostgreSQL** - Database
- **Pinata** - IPFS file storage
- **CORS** - Cross-origin resource sharing

### Blockchain
- **Solidity** - Smart contract programming
- **Hardhat** - Ethereum development environment
- **OpenZeppelin** - Secure smart contract library
- **Sepolia Testnet** - Ethereum test network
- **Etherscan** - Blockchain explorer integration

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/chariblock-ry.git
cd chariblock-ry
```

### 2. Frontend Setup (Next.js)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables in .env.local
# NEXT_PUBLIC_BACKEND_API=http://localhost:8000/api
# NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
# NEXT_PUBLIC_CHAIN_ID=11155111 # Sepolia testnet

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 3. Backend Setup (Django)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### 4. Smart Contract Setup (Hardhat)

```bash
cd contracts

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure .env with your settings:
# PRIVATE_KEY=your_wallet_private_key
# SEPOLIA_RPC_URL=your_alchemy_or_infura_url
# ETHERSCAN_API_KEY=your_etherscan_api_key

# Compile contracts
npx hardhat compile

# Run tests
npm run test

# Deploy to local network
npx hardhat node  # In separate terminal
npm run deploy:local

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

---

## Security Features

- **ReentrancyGuard** - Prevents reentrancy attacks
- **Pausable Contracts** - Emergency stop mechanism
- **Access Control** - Role-based permissions
- **Input Validation** - Comprehensive parameter checks
- **Direct Transfers** - Funds sent directly to charity wallets
- **IPFS Storage** - Decentralized document storage
- **KYC Verification** - Admin approval required

---

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_API=http://localhost:8000/api
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret
```

### Contracts (.env)
```env
PRIVATE_KEY=your-wallet-private-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your-etherscan-api-key
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**


## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Show Your Support

If you find this project useful, please consider giving it a star on GitHub! It helps others discover the project and motivates us to continue improving it.

---

## Keywords

blockchain charity, decentralized donations, ethereum charity platform, web3 donations, smart contract charity, transparent donations, cryptocurrency charity, DApp charity, blockchain fundraising, ethereum donations, web3 charity, metamask donations, crypto philanthropy, decentralized fundraising, blockchain transparency, on-chain charity, IPFS storage, KYC verification, nonprofit blockchain, charity DApp

---

