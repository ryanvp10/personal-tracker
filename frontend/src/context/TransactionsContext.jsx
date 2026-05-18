import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockTransactions } from '../mockData.js';

const TransactionsContext = createContext();

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState(() => {
    // Load guest transactions from sessionStorage
    const stored = sessionStorage.getItem('guestTransactions');
    const guestTransactions = stored ? JSON.parse(stored) : [];
    
    // Merge mockTransactions with guest transactions
    // Use mockTransactions as base, then add any guest transactions
    return [...mockTransactions, ...guestTransactions];
  });

  // Persist guest transactions to sessionStorage whenever transactions change
  useEffect(() => {
    // Only persist transactions that were added by the guest (not mock ones)
    const guestTransactions = transactions.filter(
      t => !mockTransactions.some(m => m.id === t.id)
    );
    sessionStorage.setItem('guestTransactions', JSON.stringify(guestTransactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, deleteTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}