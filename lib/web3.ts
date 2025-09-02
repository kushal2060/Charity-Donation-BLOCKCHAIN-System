  import { ethers } from 'ethers';
  import { contractService, CharityStruct, DonationStruct } from './contracts';

  export interface MetaMaskError {
    code: number;
    message: string;
  }

  export interface UserProfile {
    address: string;
    name: string;
    email: string;
    profileType: 'donor' | 'charity';
    isVerified?: boolean;
  }

  declare global {
    interface Window {
      ethereum?: any;
    }
  }

  export class Web3Service {
    private provider: ethers.BrowserProvider | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    private async initializeProvider(): Promise<void> {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }

      if (!this.signer) {
        this.signer = await this.provider.getSigner();
      }
    }

    async connectWallet(): Promise<string> {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      try {
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        await this.initializeProvider();

        // Switch to Sepolia testnet
        // await this.switchToSepolia();

        // Initialize contract service
        await contractService.initialize();

        return accounts[0];
      } catch (error) {
        console.error('Error connecting wallet:', error);
        throw error;
      }
    }

    // async switchToSepolia(): Promise<void> {
    //   if (!window.ethereum) return;

    //   try {
    //     await window.ethereum.request({
    //       method: 'wallet_switchEthereumChain',
    //       params: [{ chainId: '0xaa36a7' }], // Sepolia testnet chain ID
    //     });
    //   } catch (error: any) {
    //     // If network doesn't exist, add it
    //     if (error.code === 4902) {
    //       await window.ethereum.request({
    //         method: 'wallet_addEthereumChain',
    //         params: [
    //           {
    //             chainId: '0xaa36a7',
    //             chainName: 'Sepolia Test Network',
    //             nativeCurrency: {
    //               name: 'ETH',
    //               symbol: 'ETH',
    //               decimals: 18,
    //             },
    //             rpcUrls: ['https://sepolia.infura.io/v3/'],
    //             blockExplorerUrls: ['https://sepolia.etherscan.io/'],
    //           },
    //         ],
    //       });
    //     }
    //   }
    // }


    async getBalance(address: string): Promise<string> {
      try {
        // Initialize provider if not already done
        if (!this.provider) {
          await this.initializeProvider();
        }

        const balance = await this.provider!.getBalance(address);
        return ethers.formatEther(balance);
      } catch (error) {
        console.error('Error getting balance:', error);
        // Return 0 balance if there's an error
        return '0';
      }
    }

    async sendDonation(charityId: number, amount: string, message: string = ""): Promise<string> {
      try {
        if (!this.signer) {
          await this.initializeProvider();
        }

        // Use contract service for donations
        return await contractService.donate(charityId, amount, message);
      } catch (error) {
        console.error('Error sending donation:', error);
        throw error;
      }
    }


  async createCharityOnChain(
    charityWallet: string,
    name: string,
    description: string,
    category: string,
    targetAmount: string,
  ): Promise<string> {
    try {
    
      // await contractService.initialize();
      
      // Get charity count before creation
      // const countBefore = await contractService.contractInstance?.getTotalCharities() || BigInt(0);
      
      // Create the charity (this returns transaction hash)
      const txHash = await contractService.createCharity(
        charityWallet,
        name,
        description,
        category,
        targetAmount,
      );
      
      // Wait for transaction to be mined
      await contractService.providerInstance?.waitForTransaction(txHash);
      
      // Get charity count after creation
      const countAfter = await contractService.contractInstance?.getTotalCharities() || BigInt(0);
      
      // The new charity ID is the current count
      const charityId = countAfter.toString();
      
      console.log(`✅ Charity created with ID: ${charityId} (tx: ${txHash})`);
      
      // Return the charity ID, not the transaction hash
      return charityId;
      
    } catch (error) {
      console.error('Error creating charity on chain:', error);
      throw error;
    }
  }

    async getCharityFromChain(charityId: number): Promise<CharityStruct> {
      try {
        return await contractService.getCharity(charityId);
      } catch (error) {
        console.error('Error getting charity from chain:', error);
        throw error;
      }
    }

    // async getAllCharitiesFromChain(): Promise<CharityStruct[]> {
    //   try {
    //     return await contractService.getAllCharities();
    //   } catch (error) {
    //     console.error('Error getting all charities from chain:', error);
    //     throw error;
    //   }
    // }

    // async getUserCharitiesFromChain(userAddress: string): Promise<number[]> {
    //   try {
    //     return await contractService.getUserCharities(userAddress);
    //   } catch (error) {
    //     console.error('Error getting user charities from chain:', error);
    //     throw error;
    //   }
    // }

    // async getUserDonationsFromChain(userAddress: string): Promise<number[]> {
    //   try {
    //     return await contractService.getUserDonations(userAddress);
    //   } catch (error) {
    //     console.error('Error getting user donations from chain:', error);
    //     throw error;
    //   }
    // }

    // async getDonationFromChain(donationId: number): Promise<DonationStruct> {
    //   try {
    //     return await contractService.getDonation(donationId);
    //   } catch (error) {
    //     console.error('Error getting donation from chain:', error);
    //     throw error;
    //   }
    // }

    async verifyCharityOnChain(charityId: number, verified: boolean): Promise<string> {
      try {
        return await contractService.verifyCharity(charityId, verified);
      } catch (error) {
        console.error('Error verifying charity on chain:', error);
        throw error;
      }
    }

    async getCurrentAccount(): Promise<string | null> {
      if (!window.ethereum) return null;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts[0]) {
          // Initialize provider when we have an account
          try {
            await this.initializeProvider();
            // Initialize contract service
            await contractService.initialize();
          } catch (error) {
            console.warn('Could not initialize provider or contract service:', error);
          }
        }

        return accounts[0] || null;
      } catch (error) {
        console.error('Error getting current account:', error);
        return null;
      }
    }

    onAccountsChanged(callback: (accounts: string[]) => void): void {
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', callback);
      }
    }

    onChainChanged(callback: (chainId: string) => void): void {
      if (window.ethereum) {
        window.ethereum.on('chainChanged', callback);
      }
    }

    // Event listeners for smart contract events
    setupContractEventListeners(): void {
      // Remove existing listeners first to prevent duplicates
      contractService.removeAllListeners();
      
      // contractService.onCharityCreated((charityId, creator, name) => {
      //   console.log(`New charity created: ${name} (ID: ${charityId}) by ${creator}`);
      // });
      contractService.onCharityCreated((charityId, creator, charityWallet, name, targetAmount) => {
    console.log(`New charity created: ${name} (ID: ${charityId}) by ${creator} with target ${ethers.formatEther(targetAmount)} ETH`);
});

      // contractService.onDonationMade((donationId, charityId, donor, amount) => {
      //   console.log(`New donation: ${ethers.formatEther(amount)} ETH to charity ${charityId} by ${donor}`);
      // });
      contractService.onDonationMade((donationId, charityId, donor, amount, message) => {
  console.log(`New donation: ${ethers.formatEther(amount)} ETH to charity ${charityId} by ${donor} - Message: "${message}" (ID: ${donationId})`);
});
    }

    removeContractEventListeners(): void {
      contractService.removeAllListeners();
    }
  }

  export const web3Service = new Web3Service();