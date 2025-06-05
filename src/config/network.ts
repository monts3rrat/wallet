import { NetworkConfig, NetworkType } from '../types';

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum.publicnode.com',
    chainId: 1,
    symbol: 'ETH',
    blockExplorer: 'https://etherscan.io'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://ethereum-sepolia.publicnode.com',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  }
};

export const getNetworkConfig = (network: NetworkType): NetworkConfig => {
  return NETWORK_CONFIGS[network];
};
