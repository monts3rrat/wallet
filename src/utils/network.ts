// src\utils\network.ts

import { ethers } from 'ethers';

export const getBalance = async (address: string, rpcUrl: string): Promise<string> => {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

export const sendTransaction = async (
  privateKey: string,
  to: string,
  amount: string,
  rpcUrl: string
): Promise<string> => {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    });
    
    return tx.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

export const estimateGas = async (
  from: string,
  to: string,
  amount: string,
  rpcUrl: string
): Promise<{ gasLimit: string; gasPrice: string; totalCost: string }> => {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const gasLimit = await provider.estimateGas({
      from,
      to,
      value: ethers.parseEther(amount)
    });
    
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    const totalCost = gasLimit * gasPrice;
    
    return {
      gasLimit: gasLimit.toString(),
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      totalCost: ethers.formatEther(totalCost)
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};

export const validateAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};