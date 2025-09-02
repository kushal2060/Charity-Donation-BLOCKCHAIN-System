import { ethers } from 'ethers';
import CharityPlatformArtifact from "../contracts/artifacts/contracts/CharityPlatform.sol/CharityPlatform.json";
export const CHARITY_PLATFORM_ABI = CharityPlatformArtifact.abi;



// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Local development (Hardhat)
  localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default Hardhat deployment address
  
};



// Network configurations
export const NETWORKS = {
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: ""
  },
  // sepolia: {
  //   chainId: 11155111,
  //   name: "Sepolia",
  //   rpcUrl: "https://sepolia.infura.io/v3/",
  //   blockExplorer: "https://sepolia.etherscan.io"
  // }
};

export interface CharityStruct {
  id: bigint;
  charityWallet: string;
  creator: string;
  name: string;
  description: string;
  category: string;
  targetAmount: bigint;
  raisedAmount: bigint;
  createdAt: bigint;
  isActive: boolean;
  isVerified: boolean;
  // ipfsHash: string;
}

export interface DonationStruct {
  charityId: bigint;
  donor: string;
  amount: bigint;
  timestamp: bigint;
  message: string;
}

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private providerContract: ethers.Contract | null = null;

  

  get contractInstance(): ethers.Contract | null {
    return this.contract;
  }

  get providerInstance(): ethers.BrowserProvider | null {
    return this.provider;
  }
  get signerInstance(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  
  async initialize(): Promise<void> {

  if (!window.ethereum) {
    throw new Error('MetaMask not found');
  }
  
  // Switch to correct network first
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x7a69' }], // 0x7a69 = 31337 in hex
  });

  // Request accounts to ensure connection
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  // Create provider
  this.provider = new ethers.BrowserProvider(window.ethereum);
  
  // Always get fresh signer to match current MetaMask account
  this.signer = await this.provider.getSigner();
  
  const signerAddress = await this.signer.getAddress();
  // console.log("Initializing with signer:", signerAddress);
  
  // Get current network
  const network = await this.provider.getNetwork();
  const chainId = Number(network.chainId);
  // console.log("Detected network:", network.name, "chainId:", network.chainId);

  // Get contract address
  let contractAddress = "";
  if (chainId === 31337) {
    contractAddress = CONTRACT_ADDRESSES.localhost;
  // } else if (chainId === 11155111) {
  //   contractAddress = CONTRACT_ADDRESSES.sepolia;
  // }
  }
   else {
    throw new Error(`Unsupported network. Please switch to Sepolia testnet or localhost.`);
  }

  if (!contractAddress) {
    throw new Error(`Contract not deployed on this network (chainId: ${chainId})`);
  }

  this.contract = new ethers.Contract(contractAddress, CHARITY_PLATFORM_ABI, this.signer);
  
  this.providerContract = new ethers.Contract(contractAddress, CHARITY_PLATFORM_ABI, this.provider); // for reads

  // console.log("Contract initialized with signer:", signerAddress);
}

  private async ensureInitialized(): Promise<void> {
    if (!this.contract) {
      await this.initialize();
    }
  }

  // Charity functions
  async createCharity(
    charityWallet: string,
    name: string,
    description: string,
    category: string,
    targetAmount: string,
    // ipfsHash: string
  ): Promise<string> {
    await this.ensureInitialized();
    
    const targetAmountWei = ethers.parseEther(targetAmount);
    const tx = await this.contract!.createCharity(
      charityWallet,
      name,
      description,
      category,
      targetAmountWei,
      // ipfsHash
    );
    await tx.wait();
    return tx.hash;
  }

  async getCharity(charityId: number): Promise<CharityStruct> {
    await this.ensureInitialized();
    return await this.providerContract!.getCharity(charityId);
  }

  async getAllCharities(): Promise<CharityStruct[]> {
    await this.ensureInitialized();
    
    const totalCharities = await this.providerContract!.getTotalCharities();
    const charities: CharityStruct[] = [];
    
    for (let i = 1; i <= Number(totalCharities); i++) {
      try {
        const charity = await this.getCharity(i);
        charities.push(charity);
      } catch (error) {
        console.warn(`Failed to fetch charity ${i}:`, error);
      }
    }
    
    return charities;
  }

  // async getUserCharities(userAddress: string): Promise<number[]> {
  //   await this.ensureInitialized();
  //   const charityIds = await this.providerContract!.getUserCharities(userAddress);
  //   return charityIds.map((id: bigint) => Number(id));
  // }

  // Donation functions
  async donate(charityId: number, amount: string, message: string = ""): Promise<string> {
    await this.ensureInitialized();
    
    const amountWei = ethers.parseEther(amount);
    const tx = await this.contract!.donate(charityId, message, { value: amountWei });
    
    return tx.hash;
  }

  // async getUserDonations(userAddress: string): Promise<number[]> {
  //   await this.ensureInitialized();
  //   const donationIds = await this.providerContract!.getUserDonations(userAddress);
  //   return donationIds.map((id: bigint) => Number(id));
  // }

  // async getDonation(donationId: number): Promise<DonationStruct> {
  //   await this.ensureInitialized();
  //   return await this.providerContract!.getDonation(donationId);
  // }

  // async getCharityDonations(charityId: number): Promise<number[]> {
  //   await this.ensureInitialized();
  //   const donationIds = await this.providerContract!.getCharityDonations(charityId);
  //   return donationIds.map((id: bigint) => Number(id));
  // }

  // Admin functions
  async verifyCharity(charityId: number, verified: boolean): Promise<string> {
    await this.ensureInitialized();
    const tx = await this.contract!.verifyCharity(charityId, verified);
    return tx.hash;
  }

  // Utility functions
  // async getCharityProgress(charityId: number): Promise<{
  //   raised: bigint;
  //   target: bigint;
  //   percentage: bigint;
  // }> {
  //   await this.ensureInitialized();
  //   const [raised, target, percentage] = await this.providerContract!.getCharityProgress(charityId);
  //   return { raised, target, percentage };
  // }

  // async getPlatformFeeRate(): Promise<number> {
  //   await this.ensureInitialized();
  //   const feeRate = await this.providerContract!.platformFeeRate();
  //   return Number(feeRate);
  // }

  // Event listeners
  // onCharityCreated(callback: (charityId: number, creator: string, name: string) => void): void {
  //   if (!this.contract) return;
    
  //   this.contract.on("CharityCreated", (charityId, creator, charityWallet, name, targetAmount) => {
  //     callback(Number(charityId), creator, name);
  //   });
  // }

  onCharityCreated(callback: (charityId: number, creator: string, charityWallet: string, name: string, targetAmount: bigint) => void): void {
    if (!this.contract) return;
    
    this.contract.on("CharityCreated", (charityId, creator, charityWallet, name, targetAmount) => {
        callback(
            Number(charityId), 
            creator, 
            charityWallet, 
            name, 
            targetAmount
        );
    });
}

  // onDonationMade(callback: (donationId: number, charityId: number, donor: string, amount: bigint) => void): void {
  //   if (!this.contract) return;
    
  //   this.contract.on("DonationMade", (donationId, charityId, donor, amount, message) => {
  //     callback(Number(donationId), Number(charityId), donor, amount);
  //   });
  // }
  onDonationMade(callback: (donationId: number, charityId: number, donor: string, amount: bigint, message: string) => void): void {
    if (!this.contract) return;
    
    this.contract.on("DonationMade", (donationId, charityId, donor, amount, message) => {
        callback(Number(donationId), Number(charityId), donor, amount, message);
    });
}

  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const contractService = new ContractService();
