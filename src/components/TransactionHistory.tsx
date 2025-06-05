import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { TransactionInfo } from '../types';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { wallet, network } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) {
      loadTransactions();
    }
  }, [wallet, network]);

  const loadTransactions = async () => {
    if (!wallet) return;
    
    try {
      setError('');
      // Временно используем пустой массив, пока не реализуем API
      const txs: TransactionInfo[] = [];
      setTransactions(txs);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openTransaction = (hash: string) => {
    const baseUrls = {
      mainnet: 'https://etherscan.io/tx/',
      goerli: 'https://goerli.etherscan.io/tx/',
      sepolia: 'https://sepolia.etherscan.io/tx/'
    };
        
    const url = baseUrls[network] + hash;
    window.open(url, '_blank');
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (isLoading) {
    return (
      <div>
        <div>
          <button onClick={() => navigate(-1)}>← Back</button>
          <h2>Transaction History</h2>
        </div>
        <div>Loading transactions...</div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Transaction History</h2>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? '↻' : '🔄'}
        </button>
      </div>

      {error && (
        <div>
          {error}
          <button onClick={loadTransactions}>Retry</button>
        </div>
      )}

      {transactions.length === 0 ? (
        <div>
          <p>No transactions found</p>
          <p>Send your first transaction to see it here</p>
        </div>
      ) : (
        <div>
          {transactions.map((tx) => (
            <div key={tx.hash}>
              <div>
                <div>
                  <span>{tx.type === 'sent' ? '↗️ Sent' : '↙️ Received'}</span>
                  <span>{tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.value).toFixed(6)} ETH</span>
                </div>
                                
                <div>
                  <div>
                    <span>From: {formatAddress(tx.from)}</span>
                    <span>To: {tx.to ? formatAddress(tx.to) : 'Contract Creation'}</span>
                  </div>
                                    
                  <div>
                    <span>{formatDate(tx.timestamp)}</span>
                    <span>{getStatusIcon(tx.status)} {tx.status || 'unknown'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <button onClick={() => openTransaction(tx.hash)} title="View on block explorer">
                  🔗
                </button>
              </div>
              
              {tx.gasUsed && tx.gasPrice && (
                <div>
                  <small>
                    Gas: {parseInt(tx.gasUsed).toLocaleString()} × {(parseFloat(tx.gasPrice) / 1e9).toFixed(2)} Gwei
                  </small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
