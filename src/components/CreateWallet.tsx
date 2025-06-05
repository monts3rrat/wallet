import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';

const CreateWallet: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'create' | 'backup' | 'confirm'>('welcome');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [confirmWords, setConfirmWords] = useState<{ [key: number]: string }>({});
  const [randomIndices, setRandomIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [savedBackup, setSavedBackup] = useState(false);

  const { createWallet } = useWallet();
  const navigate = useNavigate();

  const handleCreateWallet = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create wallet with mnemonic
      const newWallet = ethers.Wallet.createRandom();
      const walletMnemonic = newWallet.mnemonic?.phrase || '';
      
      setWallet(newWallet);
      setMnemonic(walletMnemonic);
      setMnemonicWords(walletMnemonic.split(' '));
      
      // Generate random indices for confirmation
      const indices: number[] = [];
      while (indices.length < 3) {
        const randomIndex = Math.floor(Math.random() * 12);
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
      setRandomIndices(indices.sort((a, b) => a - b));
      
      setStep('backup');
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmMnemonic = () => {
    const isValid = randomIndices.every(index => 
      confirmWords[index]?.toLowerCase().trim() === mnemonicWords[index]?.toLowerCase()
    );

    if (!isValid) {
      setError('Incorrect words. Please check your backup phrase.');
      return;
    }

    setStep('confirm');
    setError('');
  };

  const handleFinishSetup = async () => {
    if (!wallet || !savedBackup) {
      setError('Please complete all steps');
      return;
    }

    setIsLoading(true);
    
    try {
      await createWallet(wallet.privateKey, password);
      navigate('/wallet');
    } catch (error: any) {
      console.error('Error saving wallet:', error);
      setError('Failed to save wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadBackup = () => {
    const backupData = {
      mnemonic: mnemonic,
      address: wallet?.address,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'welcome') {
    return (
      <div className="create-wallet">
        <div className="welcome-screen">
          <div className="logo">
            <div className="wallet-icon">👛</div>
            <h1>Ethereum Wallet</h1>
          </div>
          
          <div className="welcome-content">
            <h2>Welcome to your new wallet</h2>
            <p>Create a secure Ethereum wallet to store, send, and receive ETH and tokens.</p>
            
            <div className="features">
              <div className="feature">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🌐</span>
                <span>Multi-Network Support</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Easy to Use</span>
              </div>
            </div>
          </div>

          <div className="welcome-actions">
            <button 
              onClick={() => setStep('create')}
              className="primary-button"
            >
              Create New Wallet
            </button>
            
            <button 
              onClick={() => navigate('/import')}
              className="secondary-button"
            >
              Import Existing Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'create') {
    return (
      <div className="create-wallet">
        <div className="create-form">
          <button onClick={() => setStep('welcome')} className="back-button">
            ← Back
          </button>
          
          <h2>Create Password</h2>
          <p>This password will encrypt your wallet on this device.</p>

          <form onSubmit={(e) => { e.preventDefault(); handleCreateWallet(); }}>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password"
                minLength={8}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                minLength={8}
                required
              />
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <span className="checkmark"></span>
                I agree to the terms and understand that this wallet is for educational purposes only
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword || !agreedToTerms}
              className="primary-button"
            >
              {isLoading ? 'Creating Wallet...' : 'Create Wallet'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="create-wallet">
        <div className="backup-screen">
          <h2>🔐 Backup Your Wallet</h2>
          <div className="warning-box">
            <p><strong>⚠️ Important:</strong> Write down these 12 words in order and keep them safe. This is the only way to recover your wallet.</p>
          </div>

          <div className="mnemonic-display">
            <div className="mnemonic-grid">
              {mnemonicWords.map((word, index) => (
                <div key={index} className="mnemonic-word">
                  <span className="word-number">{index + 1}</span>
                  <span className="word-text">{word}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="backup-actions">
            <button 
              onClick={() => copyToClipboard(mnemonic)}
              className="secondary-button"
            >
              📋 Copy to Clipboard
            </button>
            
            <button 
              onClick={downloadBackup}
              className="secondary-button"
            >
              💾 Download Backup
            </button>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={savedBackup}
                onChange={(e) => setSavedBackup(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              I have safely stored my backup phrase
            </label>
          </div>

          <button
            onClick={() => setStep('confirm')}
            disabled={!savedBackup}
            className="primary-button"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="create-wallet">
        <div className="confirm-screen">
          <h2>✅ Confirm Your Backup</h2>
          <p>Please enter the following words from your backup phrase:</p>

          <div className="confirm-form">
            {randomIndices.map((index) => (
              <div key={index} className="form-group">
                <label>Word #{index + 1}</label>
                <input
                  type="text"
                  value={confirmWords[index] || ''}
                  onChange={(e) => setConfirmWords({
                    ...confirmWords,
                    [index]: e.target.value
                  })}
                  placeholder={`Enter word #${index + 1}`}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="confirm-actions">
            <button 
              onClick={() => setStep('backup')}
              className="secondary-button"
            >
              ← Back to Backup
            </button>
            
            <button
              onClick={handleConfirmMnemonic}
              disabled={randomIndices.some(index => !confirmWords[index])}
              className="secondary-button"
            >
              Verify Words
            </button>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={savedBackup}
                onChange={(e) => setSavedBackup(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              I confirm that I have verified and saved my backup phrase
            </label>
          </div>

          <button
            onClick={handleFinishSetup}
            disabled={isLoading || !savedBackup}
            className="primary-button"
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CreateWallet;
