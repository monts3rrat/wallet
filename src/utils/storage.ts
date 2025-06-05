import { StoredWalletData } from '../types';

const WALLET_KEY = 'wallet_data';

export const getStorageData = async <T = any>(keys: string | string[]): Promise<T | null> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(keys);
      return result as T;
    } else {
      // Fallback to localStorage for development
      if (typeof keys === 'string') {
        const item = localStorage.getItem(keys);
        return item ? JSON.parse(item) : null;
      } else {
        const result: any = {};
        keys.forEach(key => {
          const item = localStorage.getItem(key);
          result[key] = item ? JSON.parse(item) : null;
        });
        return result;
      }
    }
  } catch (error) {
    console.error('Error getting storage data:', error);
    throw error;
  }
};

// Добавьте недостающие функции
export const setStorageData = async (data: { [key: string]: any }): Promise<void> => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set(data);
    } else {
      // Fallback to localStorage for development
      Object.keys(data).forEach(key => {
        localStorage.setItem(key, JSON.stringify(data[key]));
      });
    }
  } catch (error) {
    console.error('Error setting storage data:', error);
    throw error;
  }
};

export const saveWalletData = async (walletData: StoredWalletData): Promise<void> => {
  await setStorageData({ [WALLET_KEY]: walletData });
};

export const getWalletData = async (): Promise<StoredWalletData | null> => {
  const result = await getStorageData<{ [WALLET_KEY]: StoredWalletData }>(WALLET_KEY);
  return result?.[WALLET_KEY] || null;
};
