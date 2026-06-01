import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockTransactions } from '../mockData.js';
import { authFetch } from './AuthContext';

const TransactionsContext = createContext();

const GUEST_SKIP_KEY = 'skipAuth';
const GUEST_TRANSACTIONS_KEY = 'guestTransactions';

function isGuestMode() {
  return localStorage.getItem(GUEST_SKIP_KEY) === 'true';
}

function getStoredGuestTransactions() {
  const raw = localStorage.getItem(GUEST_TRANSACTIONS_KEY);
  if (!raw || raw === '[]') {
    localStorage.setItem(GUEST_TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
    return mockTransactions;
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : mockTransactions;
  } catch {
    localStorage.setItem(GUEST_TRANSACTIONS_KEY, JSON.stringify(mockTransactions));
    return mockTransactions;
  }
}

function persistGuestTransactions(nextTransactions) {
  localStorage.setItem(GUEST_TRANSACTIONS_KEY, JSON.stringify(nextTransactions));
}

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refetch = () => {
    setLoaded(false);
  };

  useEffect(() => {
    let active = true;

    async function load() {
      const isGuest = localStorage.getItem('skipAuth') === 'true';
      if (isGuest) {
        if (active) {
          setTransactions(getStoredGuestTransactions());
          setLoaded(true);
        }
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        if (active) {
          setTransactions([]);
          setLoaded(true);
        }
        return;
      }

      try {
        const headers = new Headers();
        headers.set('Authorization', `Bearer ${token}`);
        headers.set('Content-Type', 'application/json');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ryanvp10-personaltracker-api.hf.space';
        const response = await fetch(`${API_BASE}/api/transactions`, { headers });
        const payload = await response.json();
        if (active) {
          setTransactions(payload.success ? payload.data : []);
          setLoaded(true);
        }
      } catch (err) {
        if (active) {
          setTransactions([]);
          setLoaded(true);
        }
      }
    }

    if (!loaded) {
      load();
    }

    return () => { active = false; };
  }, [loaded]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && !isGuestMode()) {
        refetch();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const addTransaction = async (transaction) => {
    if (isGuestMode()) {
      const guestTransaction = {
        ...transaction,
        id: Date.now(),
        created_at: new Date().toISOString(),
      };
      setTransactions((prev) => {
        const nextTransactions = [guestTransaction, ...prev];
        persistGuestTransactions(nextTransactions);
        return nextTransactions;
      });
      return guestTransaction;
    }

    const token = localStorage.getItem('authToken');
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ryanvp10-personaltracker-api.hf.space';
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE}/api/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transaction),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Failed to create transaction');
    setTransactions((prev) => [payload.data, ...prev]);
    return payload.data;
  };

  const deleteTransaction = async (id) => {
    if (isGuestMode()) {
      setTransactions((prev) => {
        const nextTransactions = prev.filter((t) => t.id !== id);
        persistGuestTransactions(nextTransactions);
        return nextTransactions;
      });
      return;
    }

    const token = localStorage.getItem('authToken');
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ryanvp10-personaltracker-api.hf.space';
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE}/api/transactions/${id}`, { method: 'DELETE', headers });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Failed to delete transaction');
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo(() => ({ transactions, addTransaction, deleteTransaction, refetch }), [transactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
}
