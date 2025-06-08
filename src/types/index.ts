// src\types\index.ts

export type NetworkType = 'mainnet' | 'sepolia';

export interface WalletData {
  address: string;
  privateKey: string;
  mnemonic?: string;
}

export interface StoredWalletData {
  address: string;
  encryptedPrivateKey: string;
  mnemonic?: string;
}

export interface StorageData {
  [key: string]: any;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  symbol: string;
  blockExplorer: string;
}

export interface TransactionInfo {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: number;
  status?: string;
  type: 'sent' | 'received';
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  totalCost: string;
}

export interface WalletContextType {
  wallet: WalletData | null;
  balance: string;
  network: NetworkType;
  isLoading: boolean;
  hasStoredWallet: boolean;
  createWallet: (privateKey: string, password: string) => Promise<void>;
  importWallet: (privateKey: string, password: string) => Promise<void>;
  unlockWallet: (password: string) => Promise<void>;
  switchNetwork: (network: NetworkType) => Promise<void>;
  refreshBalance: () => Promise<void>;
  logout: () => void;
}

export interface SessionData {
  wallet: WalletData;
  timestamp: number;
  lastActivity: number;
}

export interface WalletProviderProps {
  children: React.ReactNode;
}
