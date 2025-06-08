import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

interface MainPageProps {
  onWalletLocked?: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ onWalletLocked }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
    
  const { wallet, balance, network, switchNetwork, refreshBalance, isLoading, logout } = useWallet();
  const navigate = useNavigate();

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
        
    try {
      await refreshBalance();
    } catch (error: any) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLockWallet = async () => {
    try {
      await logout();
      if (onWalletLocked) {
        onWalletLocked();
      }
    } catch (error) {
      console.error('Error locking wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (wallet) {
      try {
        await navigator.clipboard.writeText(wallet.address);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '50px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading wallet...</div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          Restoring wallet from secure session
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>No wallet found</h2>
        <p>Please create or import a wallet</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2>Spartex Wallet</h2>
        <button
          onClick={handleLockWallet}
          style={{
            padding: '5px 10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Lock
        </button>
      </div>

      <div style={{
        marginBottom: '20px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Network:
        </label>
        <select
          value={network}
          onChange={(e) => switchNetwork(e.target.value as any)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="mainnet">Ethereum Mainnet</option>
          <option value="goerli">Goerli Testnet</option>
          <option value="sepolia">Sepolia Testnet</option>
        </select>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3>Balance</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {balance} ETH
        </p>
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Your Address</h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <code style={{
            wordBreak: 'break-all',
            flex: 1
          }}>
            {wallet.address}
          </code>
          <button
            onClick={copyAddress}
            style={{
              padding: '5px 8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Copy
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => navigate('/send')}
          style={{
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Send
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{
            padding: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          History
        </button>
      </div>

      <button
        onClick={handleRefreshBalance}
        disabled={isRefreshing}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: isRefreshing ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRefreshing ? 'not-allowed' : 'pointer'
        }}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Balance'}
      </button>
    </div>
  );
};

export default MainPage;
