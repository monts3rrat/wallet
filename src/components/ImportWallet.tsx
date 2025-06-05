import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

interface ImportWalletProps {
  onWalletImported?: () => void;
}

const ImportWallet: React.FC<ImportWalletProps> = ({ onWalletImported }) => {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
    
  const { importWallet } = useWallet();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
        
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await importWallet(seedPhrase.trim(), password);
        
      if (onWalletImported) {
        onWalletImported();
      }
        
    } catch (error: any) {
      console.error('Import error:', error);
      setError('Invalid seed phrase or encryption error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setSeedPhrase(wallet.mnemonic?.phrase || '');
      setShowCreateNew(true);
    } catch (error) {
      setError('Error generating wallet');
    }
  };

  return (
    <div>
      <h2>Welcome to Spartex Wallet</h2>
            
      {!showCreateNew ? (
        <div>
          <h3>Import Existing Wallet</h3>
          <form onSubmit={handleImport}>
            <div>
              <textarea
                placeholder="Enter your 12-word seed phrase"
                value={seedPhrase}
                onChange={(e) => setSeedPhrase(e.target.value)}
                rows={3}
                required
              />
            </div>
                        
            <div>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
                        
            <div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
                        
            {error && <div>{error}</div>}
                        
            <button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Importing...' : 'Import Wallet'}
            </button>
          </form>
                    
          <div>
            <span>or</span>
          </div>
                    
          <button onClick={generateNewWallet}>
            Create New Wallet
          </button>
        </div>
      ) : (
        <div>
          <h3>New Wallet Created</h3>
          <div>
            <strong>Your Seed Phrase:</strong>
            <p>{seedPhrase}</p>
            <small>
              ⚠️ Save this seed phrase securely! You'll need it to recover your wallet.
            </small>
          </div>
                    
          <form onSubmit={handleImport}>
            <div>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
                        
            <div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
                        
            {error && <div>{error}</div>}
            <button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
            </button>
          </form>
                    
          <button onClick={generateNewWallet}>
            Generate New Seed Phrase
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportWallet;
