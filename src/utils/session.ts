// src\utils\session.ts

import { ethers } from 'ethers';
import { SessionData, WalletData } from '../types';

const SESSION_KEY = 'wallet_session';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const createSession = async (wallet: ethers.Wallet | ethers.HDNodeWallet): Promise<void> => {
  const walletData: WalletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    // Правильная проверка на HDNodeWallet
    ...(wallet instanceof ethers.HDNodeWallet && wallet.mnemonic?.phrase 
      ? { mnemonic: wallet.mnemonic.phrase } 
      : {})
  };

  const sessionData: SessionData = {
    wallet: walletData,
    timestamp: Date.now(),
    lastActivity: Date.now()
  };

  // Сохранение в sessionStorage или chrome.storage.session
  if (typeof chrome !== 'undefined' && chrome.storage?.session) {
    await chrome.storage.session.set({ [SESSION_KEY]: sessionData });
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
};

export const getSession = async (): Promise<SessionData | null> => {
  try {
    let sessionData: SessionData | null = null;

    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      const result = await chrome.storage.session.get(SESSION_KEY);
      sessionData = result[SESSION_KEY] || null;
    } else {
      const stored = sessionStorage.getItem(SESSION_KEY);
      sessionData = stored ? JSON.parse(stored) : null;
    }

    if (!sessionData) return null;

    // Проверка на истечение сессии
    const now = Date.now();
    if (now - sessionData.lastActivity > SESSION_TIMEOUT) {
      await clearSession();
      return null;
    }

    // Обновление времени последней активности
    sessionData.lastActivity = now;
    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      await chrome.storage.session.set({ [SESSION_KEY]: sessionData });
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }

    return sessionData;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.session) {
      await chrome.storage.session.remove(SESSION_KEY);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};
