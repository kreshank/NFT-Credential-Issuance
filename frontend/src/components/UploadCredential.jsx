import React, { useState } from 'react';

export default function UploadCredential({ username, onNew }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const submit = async e => {
    e.preventDefault();
    const form = new FormData();
    form.append('username', username);
    form.append('title', title);
    if (file) form.append('file', file);

    const resp = await fetch('/api/issueCredential', {
      method: 'POST',
      body: form,
    });
    if (resp.ok) {
      const cred = await resp.json();
      onNew(cred);
      setTitle('');
      setFile(null);
    } else {
      alert('Error issuing credential');
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-lg shadow-md max-w-md">
      <h2 className="text-xl mb-4">Upload a Microcredential</h2>
      <label className="block mb-4">
        <span className="text-gray-700">Title</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
        />
      </label>
      <label className="block mb-6">
        <span className="text-gray-700">Credential File (PDF/JSON)</span>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          className="mt-1 block w-full"
        />
      </label>
      <button
        type="submit"
        className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Issue NFT
      </button>
    </form>
  );
}
