'use client';

import { useState, useEffect, useCallback } from 'react';
import { web3Service, UserProfile } from '@/lib/web3';
import { ApiService } from '@/lib/api';
import { contractService, CharityStruct } from '@/lib/contracts';

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const address = await web3Service.connectWallet();
      setAccount(address);
      
      const balance = await web3Service.getBalance(address);
      setBalance(balance);

      // Setup contract event listeners
      web3Service.setupContractEventListeners();

      // Try to fetch user profile
      try {
        const profile = await ApiService.getUserProfile(address);
        setUserProfile(profile);
      } catch (error) {
        console.log('No profile found for user');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const createProfile = useCallback(async (profileData: Omit<UserProfile, 'address'>) => {
    if (!account) throw new Error('No account connected');
    
    const fullProfileData = {
      ...profileData,
      walletAddress: account,
    };

    const profile = await ApiService.createUserProfile(fullProfileData);
    setUserProfile(profile);
    return profile;
  }, [account]);

  const sendDonation = useCallback(async (charityId: number, amount: string, message: string = "") => {
    if (!account) throw new Error('No account connected');
    return web3Service.sendDonation(charityId, amount, message);
  }, [account]);

  const createCharityOnChain = useCallback(async (
    charityWallet: string,
    name: string,
    description: string,
    category: string,
    targetAmount: string,
    // ipfsHash: string
  ) => {
    if (!account) throw new Error('No account connected');
    return web3Service.createCharityOnChain(charityWallet, name, description, category, targetAmount);
  }, [account]);

  // const getCharitiesFromChain = useCallback(async (): Promise<CharityStruct[]> => {
  //   return web3Service.getAllCharitiesFromChain();
  // }, []);

  // const getUserCharitiesFromChain = useCallback(async (userAddress: string): Promise<number[]> => {
  //   return web3Service.getUserCharitiesFromChain(userAddress);
  // }, []);

  const verifyCharityOnChain = useCallback(async (charityId: number, verified: boolean) => {
    if (!account) throw new Error('No account connected');
    return web3Service.verifyCharityOnChain(charityId, verified);
  }, [account]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          
          // Get balance with error handling
          try {
            const balance = await web3Service.getBalance(currentAccount);
            setBalance(balance);
          } catch (error) {
            console.warn('Could not get balance:', error);
            setBalance('0');
          }

          // Setup contract event listeners
          web3Service.setupContractEventListeners();

          // Try to fetch user profile
          try {
            const profile = await ApiService.getUserProfile(currentAccount);
            setUserProfile(profile);
          } catch (error) {
            console.log('No profile found for user');
          }
        }
      } catch (error) {
        console.warn('Error checking connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();

    // Set up event listeners
    web3Service.onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setBalance('0');
        setUserProfile(null);
        web3Service.removeContractEventListeners();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        
        // Get balance with error handling
        web3Service.getBalance(accounts[0])
          .then(setBalance)
          .catch(() => setBalance('0'));
        
        // Setup contract event listeners for new account
        web3Service.setupContractEventListeners();
        
        // Fetch profile for new account
        ApiService.getUserProfile(accounts[0])
          .then(setUserProfile)
          .catch(() => setUserProfile(null));
      }
    });

    web3Service.onChainChanged(() => {
      window.location.reload();
    });

    // Cleanup event listeners on unmount
    return () => {
      web3Service.removeContractEventListeners();
    };
  }, [account]);

  return {
    account,
    balance,
    isConnecting,
    userProfile,
    isLoading,
    connectWallet,
    createProfile,
    sendDonation,
    createCharityOnChain,
    // getCharitiesFromChain,
    // getUserCharitiesFromChain,
    verifyCharityOnChain,
  };
}