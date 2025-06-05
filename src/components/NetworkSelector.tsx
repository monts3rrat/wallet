import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { NetworkType } from '../types';
import { NETWORK_CONFIGS } from '../config/network';

const NetworkSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { network, switchNetwork } = useWallet();

  const handleNetworkChange = async (newNetwork: NetworkType) => {
    try {
      await switchNetwork(newNetwork);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const currentNetworkConfig = NETWORK_CONFIGS[network];

  return (
    <div className="network-selector">
      <button 
        className="network-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="network-info">
          <div className={`network-dot ${network}`}></div>
          <span className="network-name">{currentNetworkConfig.name}</span>
        </div>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="network-dropdown">
          {Object.entries(NETWORK_CONFIGS).map(([key, config]) => (
            <button
              key={key}
              className={`network-option ${network === key ? 'active' : ''}`}
              onClick={() => handleNetworkChange(key as NetworkType)}
            >
              <div className={`network-dot ${key}`}></div>
              <div className="network-details">
                <span className="network-name">{config.name}</span>
                <span className="network-chain">Chain ID: {config.chainId}</span>
              </div>
              {network === key && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="network-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NetworkSelector;
