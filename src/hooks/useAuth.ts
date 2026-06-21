'use client';

import { useState, useCallback } from 'react';

let pendingAuth: (() => void) | null = null;

export function useAuth() {
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const requestAuth = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      pendingAuth = resolve;
      setShowModal(true);
    });
  }, []);

  const onAuthSuccess = useCallback(() => {
    setShowModal(false);
    pendingAuth?.();
    pendingAuth = null;
  }, []);

  const onAuthCancel = useCallback(() => {
    setShowModal(false);
    pendingAuth = null;
  }, []);

  const openAuth = useCallback(() => {
    setShowModal(true);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  return { showModal, toast, showToast, openAuth, requestAuth, onAuthSuccess, onAuthCancel };
}

// Centralized fetch that handles 401 by dispatching auth-needed
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, { credentials: 'include', ...options });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('auth-needed'));

    // Wait for auth-success, then retry
    return new Promise((resolve) => {
      const handler = () => {
        window.removeEventListener('auth-success', handler);
        fetch(url, { credentials: 'include', ...options }).then(resolve);
      };
      window.addEventListener('auth-success', handler);
    });
  }

  if (res.status === 403) {
    throw new Error('Wrong code');
  }

  return res;
}

// Listen for auth-needed events globally, show toast
export function setupAuthListener(onToast: (msg: string) => void, onOpenAuth: () => void) {
  function handler() {
    onToast('Authorization required');
  }
  window.addEventListener('auth-needed', handler);
  return () => window.removeEventListener('auth-needed', handler);
}
