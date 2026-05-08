import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '32px',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 'clamp(2rem, 8vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '0.1em',
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        FINANCIAL
        <br />
        TRACKER
      </h2>
      <div
        style={{
          width: '100px',
          height: '6px',
          backgroundColor: theme.colors.text,
        }}
      />
      <p
        style={{
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          color: theme.colors.textMuted,
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        TRACK YOUR INCOME AND EXPENSES WITH BRUTAL PRECISION.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/dashboard"
          style={{
            padding: '16px 32px',
            border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
            backgroundColor: theme.colors.text,
            color: theme.colors.background,
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          VIEW DASHBOARD
        </Link>
        <Link
          to="/add"
          style={{
            padding: '16px 32px',
            border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontWeight: 900,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          ADD TRANSACTION
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add" element={<TransactionForm />} />
          <Route path="/transactions" element={<TransactionList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
