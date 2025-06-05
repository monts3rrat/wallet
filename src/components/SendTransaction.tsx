import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { sendTransaction, estimateGas } from '../utils/network';
import { NETWORK_CONFIGS } from '../config/network';
import { ethers } from 'ethers';

const validateAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

const SendTransaction: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [gasEstimate, setGasEstimate] = useState<{
    gasLimit: string;
    gasPrice: string;
    totalCost: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');

  const { wallet, balance, network, refreshBalance } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (recipient && amount && validateAddress(recipient) && parseFloat(amount) > 0) {
      estimateTransactionCost();
    } else {
      setGasEstimate(null);
    }
  }, [recipient, amount, network]);

  const estimateTransactionCost = async () => {
    if (!wallet) return;
    
    try {
      const networkConfig = NETWORK_CONFIGS[network];
      const estimate = await estimateGas(
        wallet.address, 
        recipient, 
        amount, 
        networkConfig.rpcUrl
      );
      setGasEstimate(estimate);
    } catch (error) {
      console.error('Gas estimation error:', error);
      setGasEstimate(null);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
        
    if (!wallet) {
      setError('Wallet not found');
      return;
    }

    if (!validateAddress(recipient)) {
      setError('Invalid recipient address');
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(balance);
    
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    if (amountNum > balanceNum) {
      setError('Insufficient balance');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const networkConfig = NETWORK_CONFIGS[network];
      const hash = await sendTransaction(
        wallet.privateKey, 
        recipient, 
        amount, 
        networkConfig.rpcUrl
      );
      
      setTxHash(hash);
      setSuccess('Transaction sent successfully!');
        
      await refreshBalance();
        
      setRecipient('');
      setAmount('');
      setGasEstimate(null);
        
    } catch (error: any) {
      console.error('Send transaction error:', error);
      setError(error.message || 'Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const openTransaction = () => {
    if (txHash) {
      const baseUrls = {
        mainnet: 'https://etherscan.io/tx/',
        goerli: 'https://goerli.etherscan.io/tx/',
        sepolia: 'https://sepolia.etherscan.io/tx/'
      };
            
      const url = baseUrls[network] + txHash;
      window.open(url, '_blank');
    }
  };

  const maxAmount = () => {
    const balanceNum = parseFloat(balance);
    if (gasEstimate) {
      const maxSend = Math.max(0, balanceNum - parseFloat(gasEstimate.totalCost));
      setAmount(maxSend.toFixed(6));
    } else {
      setAmount((balanceNum * 0.95).toFixed(6));
    }
  };

  return (
    <div>
      <div>
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Send Transaction</h2>
      </div>
      
      <div>
        <p>Available Balance: <strong>{parseFloat(balance).toFixed(6)} ETH</strong></p>
      </div>
      
      <form onSubmit={handleSend}>
        <div>
          <label htmlFor="recipient">Recipient Address</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            required
          />
          {recipient && !validateAddress(recipient) && (
            <span>Invalid address format</span>
          )}
        </div>
        
        <div>
          <label htmlFor="amount">Amount (ETH)</label>
          <div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              min="0"
              required
            />
            <button type="button" onClick={maxAmount}>MAX</button>
          </div>
        </div>
        
        {gasEstimate && (
          <div>
            <h3>Transaction Details</h3>
            <div>
              <p>Gas Limit: {parseInt(gasEstimate.gasLimit).toLocaleString()}</p>
              <p>Gas Price: {(parseFloat(gasEstimate.gasPrice) / 1e9).toFixed(2)} Gwei</p>
              <p>Network Fee: ~{parseFloat(gasEstimate.totalCost).toFixed(6)} ETH</p>
              <p><strong>Total: {(parseFloat(amount || '0') + parseFloat(gasEstimate.totalCost)).toFixed(6)} ETH</strong></p>
            </div>
          </div>
        )}
        
        {error && <div>{error}</div>}
                
        {success && (
          <div>
            <p>{success}</p>
            {txHash && (
              <div>
                <p>Transaction Hash:</p>
                <code onClick={openTransaction}>{txHash.slice(0, 10)}...{txHash.slice(-8)}</code>
                <button type="button" onClick={openTransaction}>View on Explorer</button>
              </div>
            )}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount || !validateAddress(recipient)}
        >
          {isLoading ? 'Sending...' : 'Send Transaction'}
        </button>
      </form>
    </div>
  );
};

export default SendTransaction;
