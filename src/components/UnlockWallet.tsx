// src\components\UnlockWallet.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const UnlockWallet: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { unlockWallet } = useWallet();
  const navigate = useNavigate();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await unlockWallet(password);
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
        <form onSubmit={handleUnlock}>
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
