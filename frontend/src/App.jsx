import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import theme from './theme';
import { TransactionsProvider } from './context/TransactionsContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function App() {
  return (
    <BrowserRouter>
      <TransactionsProvider>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/add" element={<Layout><TransactionForm /></Layout>} />
        <Route path="/transactions" element={<Layout><TransactionList /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </TransactionsProvider>
    </BrowserRouter>
  );
}

// Login component for /login route
function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Guest login logic: store session in sessionStorage
    sessionStorage.setItem('isGuest', 'true');
    window.location.href = '/dashboard';
  };

  const handleBackHome = () => {
    navigate('/');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '24px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 6vw, 3rem)',
    fontWeight: 900,
    letterSpacing: '0.1em',
    margin: 0,
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    maxWidth: '300px',
    padding: '12px 16px',
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: '0.85rem',
    fontWeight: 900,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily,
  };

  const buttonStyle = {
    padding: '14px 32px',
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: '0.85rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'none',
  };

  return (
    <div style={containerStyle}>
      <button style={{ ...buttonStyle, alignSelf: 'flex-start', fontSize: '0.75rem', padding: '8px 16px', marginBottom: '16px' }} onClick={handleBackHome}>
        ← BACK TO HOME
      </button>
      <h2 style={titleStyle}>LOGIN</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <input type="email" placeholder="EMAIL" style={inputStyle} />
        <input type="password" placeholder="PASSWORD" style={inputStyle} />
      </div>
      <button style={buttonStyle} onClick={handleLogin}>
        LOGIN
      </button>
      <p style={{ fontSize: '0.75rem', color: theme.colors.textMuted, letterSpacing: '0.05em', maxWidth: '300px' }}>
        LEAVE FIELDS EMPTY FOR GUEST ACCESS. SESSION STORED IN SESSIONSTORAGE.
      </p>
    </div>
  );
}

export default App;