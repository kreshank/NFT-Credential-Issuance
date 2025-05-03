import React, { useState } from 'react';

export default function UploadCredential({ username, onNew }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const resp = await fetch('/api/issueCredential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: username,
          certTitle: title
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        onNew({
          title,
          tokenId: data.txHash,
          issuedAt: new Date().toISOString()
        });
        setTitle('');
      } else {
        alert('Error issuing credential');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error issuing credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl mb-4">Issue a Microcredential</h2>
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
        disabled={loading}
        className={`py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Issuing...' : 'Issue NFT'}
      </button>
    </form>
  );
}
