import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockTransactions } from '../mockData.js';
import { authFetch, useAuth } from './AuthContext';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
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
  }, [isAuthenticated]);

  const addTransaction = async (transaction) => {
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
