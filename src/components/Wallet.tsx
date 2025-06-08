// src\components\Wallet.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import NetworkSelector from './NetworkSelector';

const Wallet: React.FC = () => {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { wallet, balance, network, isLoading, refreshBalance, logout } = useWallet();
  const navigate = useNavigate();

  if (!wallet) {
    return (
      <div className="wallet-container">
        <div className="error-message">
          Wallet not found. Please create or import a wallet.
        </div>
      </div>
    );
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Make sure you have saved your private key.')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="wallet-title">
          <h1>My Wallet</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        
        <NetworkSelector />
      </div>

      <div className="wallet-info">
        <div className="address-section">
          <label>Wallet Address</label>
          <div className="address-display">
            <span className="address">{formatAddress(wallet.address)}</span>
            <button 
              onClick={() => copyToClipboard(wallet.address)}
              className="copy-button"
              title="Copy full address"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <div className="full-address">
            <small>{wallet.address}</small>
          </div>
        </div>

        <div className="balance-section">
          <div className="balance-display">
            <h2>{isLoading ? 'Loading...' : `${parseFloat(balance).toFixed(6)} ETH`}</h2>
            <button 
              onClick={refreshBalance}
              disabled={isLoading}
              className="refresh-button"
              title="Refresh balance"
            >
              {isLoading ? '↻' : '🔄'}
            </button>
          </div>
          <p className="network-info">on {network.charAt(0).toUpperCase() + network.slice(1)}</p>
        </div>
      </div>

      <div className="wallet-actions">
        <button 
          onClick={() => navigate('/send')}
          className="action-button send-button"
          disabled={parseFloat(balance) <= 0}
        >
          📤 Send
        </button>
        
        <button 
          onClick={() => navigate('/history')}
          className="action-button history-button"
        >
          📋 History
        </button>
        
        <button 
          onClick={() => copyToClipboard(wallet.address)}
          className="action-button receive-button"
        >
          📥 Receive
        </button>
      </div>

      <div className="private-key-section">
        <div className="private-key-header">
          <h3>Private Key</h3>
          <button 
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            className="toggle-button"
          >
            {showPrivateKey ? '🙈 Hide' : '👁️ Show'}
          </button>
        </div>
        
        {showPrivateKey && (
          <div className="private-key-display">
            <div className="warning">
              ⚠️ Never share your private key with anyone!
            </div>
            <div className="private-key-value">
              <code>{wallet.privateKey}</code>
              <button 
                onClick={() => copyToClipboard(wallet.privateKey)}
                className="copy-button"
              >
                📋
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="wallet-footer">
        <small>
          Always keep your private key safe and never share it with anyone.
          This extension stores your keys locally in your browser.
        </small>
      </div>
    </div>
  );
};

export default Wallet;
