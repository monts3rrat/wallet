import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { TransactionInfo } from '../types';
import { getTransactionHistory } from '../utils/etherscan';
import { NETWORK_CONFIGS } from '../config/network';

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
      setIsLoading(true);
      
      const txHistory = await getTransactionHistory(wallet.address, network);
      setTransactions(txHistory);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      setError(error.message || 'Failed to load transaction history');
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
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(3);
    return num.toFixed(6);
  };

  const openTransaction = (hash: string) => {
    const networkConfig = NETWORK_CONFIGS[network];
    const url = `${networkConfig.blockExplorer}/tx/${hash}`;
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

  const formatGasInfo = (gasUsed?: string, gasPrice?: string) => {
    if (!gasUsed || !gasPrice) return null;
    
    const gasUsedNum = parseInt(gasUsed);
    const gasPriceGwei = parseFloat(gasPrice) / 1e9;
    
    return `${gasUsedNum.toLocaleString()} × ${gasPriceGwei.toFixed(2)} Gwei`;
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
          <p>❌ {error}</p>
          <button onClick={loadTransactions}>Retry</button>
        </div>
      )}

      {transactions.length === 0 && !error ? (
        <div>
          <p>No transactions found</p>
          <p>Send your first transaction to see it here</p>
        </div>
      ) : (
        <div>
          {transactions.map((tx) => (
            <div key={tx.hash} style={{ 
              border: '1px solid #ccc', 
              margin: '10px 0', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: tx.type === 'received' ? '#f0f8f0' : '#f8f0f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {tx.type === 'sent' ? '↗️ Sent' : '↙️ Received'}
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: tx.type === 'sent' ? '#d32f2f' : '#2e7d32' 
                    }}>
                      {tx.type === 'sent' ? '-' : '+'}{formatValue(tx.value)} ETH
                    </span>
                  </div>
                  
                  <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                    <div>From: {formatAddress(tx.from)}</div>
                    <div>To: {tx.to ? formatAddress(tx.to) : 'Contract Creation'}</div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                    <span>{formatDate(tx.timestamp)}</span>
                    <span>{getStatusIcon(tx.status)} {tx.status || 'unknown'}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => openTransaction(tx.hash)} 
                  title="View on block explorer"
                  style={{ 
                    background: 'none', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: '5px 10px',
                    cursor: 'pointer'
                  }}
                >
                  🔗
                </button>
              </div>
              
              {tx.gasUsed && tx.gasPrice && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Gas: {formatGasInfo(tx.gasUsed, tx.gasPrice)}
                </div>
              )}
              
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                {tx.hash.slice(0, 20)}...{tx.hash.slice(-10)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
