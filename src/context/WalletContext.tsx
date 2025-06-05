// src\context\WalletContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletContextType, WalletData, NetworkType, WalletProviderProps } from '../types';
import { NETWORK_CONFIGS } from '../config/network';
import { encryptPrivateKey } from '../utils/crypto';
import { saveWalletData, getWalletData } from '../utils/storage';
import { getBalance } from '../utils/network';
import { createSession, getSession, clearSession } from '../utils/session';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState('0');
  const [network, setNetwork] = useState<NetworkType>('sepolia');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeWallet();
  }, []);

  useEffect(() => {
    if (wallet) {
      refreshBalance();
    }
  }, [wallet, network]);

  const initializeWallet = async () => {
    try {
      // Check for active session first
      const session = await getSession();
      if (session) {
        setWallet(session.wallet);
        setIsLoading(false);
        return;
      }

      // Check for stored wallet
      const storedWallet = await getWalletData();
      if (storedWallet) {
        // Wallet exists but needs to be unlocked
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error initializing wallet:', error);
    }
    setIsLoading(false);
  };

  const createWallet = async (privateKey: string, password: string): Promise<void> => {
    try {
      const ethersWallet = new ethers.Wallet(privateKey);
      
      const walletData: WalletData = {
        address: ethersWallet.address,
        privateKey: ethersWallet.privateKey
      };

      const encryptedPrivateKey = await encryptPrivateKey(privateKey, password);
      
      await saveWalletData({
        address: walletData.address,
        encryptedPrivateKey
      });

      await createSession(ethersWallet);
      setWallet(walletData);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  };

  const importWallet = async (privateKeyOrMnemonic: string, password: string): Promise<void> => {
    try {
      let ethersWallet: ethers.Wallet | ethers.HDNodeWallet;
      
      // Проверяем, является ли это мнемоникой или приватным ключом
      if (privateKeyOrMnemonic.split(' ').length >= 12) {
        // Это мнемоника
        ethersWallet = ethers.Wallet.fromPhrase(privateKeyOrMnemonic);
      } else {
        // Это приватный ключ
        ethersWallet = new ethers.Wallet(privateKeyOrMnemonic);
      }

      const walletData: WalletData = {
        address: ethersWallet.address,
        privateKey: ethersWallet.privateKey,
        ...(ethersWallet instanceof ethers.HDNodeWallet && ethersWallet.mnemonic?.phrase 
          ? { mnemonic: ethersWallet.mnemonic.phrase } 
          : {})
      };

      const encryptedPrivateKey = await encryptPrivateKey(ethersWallet.privateKey, password);
      
      await saveWalletData({
        address: walletData.address,
        encryptedPrivateKey,
        ...(walletData.mnemonic ? { mnemonic: walletData.mnemonic } : {})
      });

      await createSession(ethersWallet);
      setWallet(walletData);
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  };

  const switchNetwork = async (newNetwork: NetworkType): Promise<void> => {
    setNetwork(newNetwork);
    if (wallet) {
      await refreshBalance();
    }
  };

  const refreshBalance = async (): Promise<void> => {
    if (!wallet) return;
    
    try {
      const networkConfig = NETWORK_CONFIGS[network];
      const currentBalance = await getBalance(wallet.address, networkConfig.rpcUrl);
      setBalance(currentBalance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      setBalance('0');
    }
  };

  const logout = async (): Promise<void> => {
    await clearSession();
    setWallet(null);
    setBalance('0');
  };

  const value: WalletContextType = {
    wallet,
    balance,
    network,
    isLoading,
    createWallet,
    importWallet,
    switchNetwork,
    refreshBalance,
    logout
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
