import React, { useEffect, useState } from 'react';
import UploadCredential from './UploadCredential';

export default function HomePage({ user }) {
  const [credentials, setCredentials] = useState([]);

  useEffect(() => {
    // fetch existing NFTs for user
    async function fetchCreds() {
      const resp = await fetch(`/api/credentials?username=${user.username}`);
      if (resp.ok) {
        const data = await resp.json();
        setCredentials(data);
      }
    }
    fetchCreds();
  }, [user.username]);

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Welcome, {user.username}</h1>
      <div className="mb-8">
        <UploadCredential username={user.username} onNew={cred => setCredentials([...credentials, cred])} />
      </div>
      <div>
        <h2 className="text-2xl mb-2">Your Microcredential NFTs</h2>
        {credentials.length === 0 ? (
          <p>No credentials issued yet.</p>
        ) : (
          <ul className="space-y-4">
            {credentials.map((cred, idx) => (
              <li key={idx} className="border p-4 rounded-lg">
                <p><strong>Title:</strong> {cred.title}</p>
                <p><strong>Token ID:</strong> {cred.tokenId}</p>
                <p><strong>Issued on:</strong> {new Date(cred.issuedAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}