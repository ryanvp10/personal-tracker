import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockTransactions } from '../mockData.js';
import { authFetch, useAuth } from './AuthContext';

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
  const { isAuthenticated, isGuest } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (isGuestMode() || isGuest()) {
        if (active) setTransactions(getStoredGuestTransactions());
        return;
      }
      if (!isAuthenticated) {
        if (active) setTransactions([]);
        return;
      }
      const response = await authFetch('/api/transactions');
      const payload = await response.json();
      if (active) setTransactions(payload.success ? payload.data : []);
    }

    load();
    return () => { active = false; };
  }, [isAuthenticated, isGuest]);

  const addTransaction = async (transaction) => {
    if (isGuestMode() || isGuest()) {
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

    const response = await authFetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Failed to create transaction');
    setTransactions((prev) => [payload.data, ...prev]);
    return payload.data;
  };

  const deleteTransaction = async (id) => {
    if (isGuestMode() || isGuest()) {
      setTransactions((prev) => {
        const nextTransactions = prev.filter((t) => t.id !== id);
        persistGuestTransactions(nextTransactions);
        return nextTransactions;
      });
      return;
    }

    const response = await authFetch(`/api/transactions/${id}`, { method: 'DELETE' });
    const payload = await response.json();
    if (!response.ok || !payload.success) throw new Error(payload.error || 'Failed to delete transaction');
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo(() => ({ transactions, addTransaction, deleteTransaction, mockTransactions }), [transactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
}
