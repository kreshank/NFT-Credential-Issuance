import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    // call backend API to save into JSON
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (resp.ok) {
      setUser({ username });
      navigate('/home');
    } else {
      alert('Login failed');
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Routes>
      <Route path="/home" element={<HomePage user={user} />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
