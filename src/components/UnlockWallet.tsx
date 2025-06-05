import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { getWalletData } from '../utils/storage';
import { decryptPrivateKey } from '../utils/crypto';
import { createSession } from '../utils/session';

const UnlockWallet: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const unlockWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const storedWallet = await getWalletData();
      if (!storedWallet) {
        throw new Error('No wallet found');
      }

      const privateKey = await decryptPrivateKey(storedWallet.encryptedPrivateKey, password);
      const ethersWallet = new ethers.Wallet(privateKey);

      await createSession(ethersWallet);
      navigate('/wallet');
    } catch (error: any) {
      console.error('Error unlocking wallet:', error);
      setError('Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="unlock-wallet">
      <div className="unlock-form">
        <h2>Unlock Wallet</h2>
        <p>Enter your password to unlock your wallet</p>

        <form onSubmit={unlockWallet}>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="primary-button"
          >
            {isLoading ? 'Unlocking...' : 'Unlock Wallet'}
          </button>
        </form>

        <div className="unlock-actions">
          <button 
            onClick={() => navigate('/')}
            className="secondary-button"
          >
            Create New Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockWallet;
