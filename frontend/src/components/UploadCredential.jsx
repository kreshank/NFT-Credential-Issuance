import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function UploadCredential({ username, onNew }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { publicKey, connected } = useWallet();

  const submit = async e => {
    e.preventDefault();
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    
    try {
      // Request airdrop for testing (only on devnet)
      await fetch('http://localhost:3001/api/requestAirdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          address: publicKey.toString()
        }),
      });

      // Issue credential
      const resp = await fetch('http://localhost:3001/api/issueCredential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: username,
          certTitle: title,
          recipientAddress: publicKey.toString()
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.error) {
          throw new Error(data.error);
        }
        onNew({
          title,
          tokenId: data.mint,
          tokenAccount: data.tokenAccount,
          issuedAt: new Date().toISOString()
        });
        setTitle('');
      } else {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Error issuing credential');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error issuing credential: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl mb-4">Issue a Microcredential</h2>
      <div className="mb-4">
        <WalletMultiButton />
      </div>
      <form onSubmit={submit}>
        <label className="block mb-4">
          <span className="text-gray-700">Title</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
            placeholder="Enter credential title"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !connected}
          className={`py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 ${
            (loading || !connected) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Issuing...' : 'Issue NFT'}
        </button>
      </form>
    </div>
  );
}
