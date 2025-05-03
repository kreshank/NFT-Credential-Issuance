import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import RegisterPage from './components/RegisterPage';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  // Initialize Solana connection
  const endpoint = clusterApiUrl('devnet');
  const wallets = [new PhantomWalletAdapter()];

  const handleLogin = async (username, password) => {
    try {
      console.log('Attempting login...');
      const resp = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Response status:', resp.status);
      const data = await resp.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setUser({ username });
        navigate('/home');
      } else {
        alert('Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const handleRegister = (username, password) => {
    setShowRegister(false);
    // Optionally, auto-login after registration
    handleLogin(username, password);
  };

  if (!user) {
    return showRegister ? (
      <RegisterPage onRegister={handleRegister} />
    ) : (
      <LoginPage onLogin={handleLogin} onShowRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Routes>
            <Route path="/home" element={<HomePage user={user} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
