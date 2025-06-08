// src\App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WalletProvider, useWallet } from './context/WalletContext';
import CreateWallet from './components/CreateWallet';
import ImportWallet from './components/ImportWallet';
import UnlockWallet from './components/UnlockWallet';
import Wallet from './components/Wallet';
import SendTransaction from './components/SendTransaction';
import TransactionHistory from './components/TransactionHistory';

const AppRoutes: React.FC = () => {
  const { wallet, isLoading, hasStoredWallet } = useWallet();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {!wallet ? (
        hasStoredWallet ? (
          <>
            <Route path="/unlock" element={<UnlockWallet />} />
            <Route path="*" element={<Navigate to="/unlock" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<CreateWallet />} />
            <Route path="/import" element={<ImportWallet />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )
      ) : (
        <>
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/send" element={<SendTransaction />} />
          <Route path="/history" element={<TransactionHistory />} />
          <Route path="*" element={<Navigate to="/wallet" replace />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </WalletProvider>
  );
};

export default App;
