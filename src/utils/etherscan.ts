import { TransactionInfo, NetworkType } from '../types';
import { backgroundFetch } from './backgroundFetch';

const ETHERSCAN_API_KEYS = {
  mainnet: '', // вставь баля ключики сюды
  sepolia: '' // вставь баля ключики сюды
};

const ETHERSCAN_BASE_URLS = {
  mainnet: 'https://api.etherscan.io/api',
  sepolia: 'https://api-sepolia.etherscan.io/api'
};

export const getTransactionHistory = async (
  address: string, 
  network: NetworkType
): Promise<TransactionInfo[]> => {
  try {
    const baseUrl = ETHERSCAN_BASE_URLS[network];
    const apiKey = ETHERSCAN_API_KEYS[network];
    
    if (!apiKey || apiKey.includes('Your')) {
      console.warn('Etherscan API key not configured');
      return [];
    }

    const normalTxUrl = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;
    
    const internalTxUrl = `${baseUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;

    const [normalResponse, internalResponse] = await Promise.all([
      backgroundFetch(normalTxUrl),
      backgroundFetch(internalTxUrl).catch(() => ({ status: '0', result: [] }))
    ]);

    if (normalResponse.status !== '1') {
      throw new Error(normalResponse.message || 'Failed to fetch transactions');
    }

    const normalTxs = normalResponse.result || [];
    const internalTxs = internalResponse.status === '1' ? internalResponse.result || [] : [];

    const allTxs = [...normalTxs, ...internalTxs];
    
    const processedTxs: TransactionInfo[] = allTxs.map((tx: any) => {
      const isReceived = tx.to && tx.to.toLowerCase() === address.toLowerCase();
      const value = tx.value ? (parseFloat(tx.value) / 1e18).toString() : '0';
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: value,
        gasUsed: tx.gasUsed,
        gasPrice: tx.gasPrice,
        timestamp: parseInt(tx.timeStamp),
        status: tx.isError === '0' ? 'success' : 'failed',
        type: isReceived ? 'received' : 'sent'
      };
    });

    const uniqueTxs = processedTxs.filter((tx, index, self) => 
      index === self.findIndex(t => t.hash === tx.hash)
    );

    return uniqueTxs.sort((a, b) => b.timestamp - a.timestamp);

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
};

export const getTransactionDetails = async (
  txHash: string, 
  network: NetworkType
): Promise<any> => {
  try {
    const baseUrl = ETHERSCAN_BASE_URLS[network];
    const apiKey = ETHERSCAN_API_KEYS[network];
    
    if (!apiKey || apiKey.includes('Your')) {
      throw new Error('Etherscan API key not configured');
    }

    const url = `${baseUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${apiKey}`;
    const response = await backgroundFetch(url);

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};
