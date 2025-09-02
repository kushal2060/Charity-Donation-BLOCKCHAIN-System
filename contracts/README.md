# Charity Platform Smart Contracts

This directory contains the smart contracts for the blockchain charity platform.

## Features

- **Charity Creation**: Users can create charity campaigns with KYC verification
- **Donation System**: Secure donations with automatic fund distribution
- **Platform Fee**: Configurable platform fee (default 2.5%)
- **Verification System**: Admin verification for charity legitimacy
- **IPFS Integration**: Document storage on IPFS
- **Emergency Controls**: Pause/unpause functionality

## Setup

### 1. Install Dependencies
```bash
cd contracts
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Compile Contracts
```bash
npm run compile
```

### 4. Run Tests
```bash
npm run test
```

### 5. Deploy to Local Network
```bash
# Start local Hardhat network (in separate terminal)
npx hardhat node

# Deploy contracts
npm run deploy:local
```

### 6. Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

## Contract Architecture

### CharityPlatform.sol
Main contract handling:
- Charity creation and management
- Donation processing
- Fee collection
- Verification system
- Emergency controls

### Key Functions

#### For Charity Creators:
- `createCharity()` - Create new charity campaign
- `updateCharityStatus()` - Activate/deactivate charity
- `withdrawFunds()` - Emergency withdrawal

#### For Donors:
- `donate()` - Make donation to verified charity

#### For Admins:
- `verifyCharity()` - Verify/reject charity
- `updatePlatformFee()` - Update platform fee
- `pause()/unpause()` - Emergency controls

#### View Functions:
- `getCharity()` - Get charity details
- `getUserCharities()` - Get user's charities
- `getUserDonations()` - Get user's donations
- `getCharityProgress()` - Get funding progress

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Owner-only admin functions
- **Input Validation**: Comprehensive parameter validation
- **Direct Transfers**: Donations sent directly to charity wallets

## Gas Optimization

- Optimized storage layout
- Efficient mapping structures
- Minimal external calls
- Batch operations where possible

## Testing

Comprehensive test suite covering:
- Contract deployment
- Charity creation and verification
- Donation processing
- Fee calculations
- Access controls
- Edge cases and error conditions

Run tests with:
```bash
npm run test
```

## Deployment Addresses

After deployment, update these addresses in your frontend:

- **Sepolia Testnet**: `TBD`
- **Mainnet**: `TBD`

## Verification

Contracts are automatically verified on Etherscan during deployment to public networks.

Manual verification:
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS CONSTRUCTOR_ARGS
```