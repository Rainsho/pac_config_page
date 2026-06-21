'use client';

import { useState } from 'react';

interface AuthModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AuthModal({ onSuccess, onCancel }: AuthModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('auth-success'));
        onSuccess();
      } else {
        setError('Wrong code!');
      }
    } catch {
      setError('Network error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Authorization Required</h2>
        <input
          type="password"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Enter authorization code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
