import React, { useState } from 'react';

export default function RegisterPage({ onRegister }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password, email }),
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        alert('Registration successful! You can now log in.');
        onRegister && onRegister(userId, password);
      } else {
        alert('Registration failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Registration error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-2xl mb-6 text-center">Register</h2>
      <label className="block mb-4">
        <span className="text-gray-700">Username</span>
        <input type="text" value={userId} onChange={e => setUserId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
      </label>
      <label className="block mb-4">
        <span className="text-gray-700">Email</span>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
      </label>
      <label className="block mb-6">
        <span className="text-gray-700">Password</span>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
      </label>
      <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
} 