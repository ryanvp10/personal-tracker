import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionsProvider } from './context/TransactionsContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

const guestLandingButtonStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '22px 28px',
  border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
  backgroundColor: theme.colors.background,
  color: theme.colors.text,
  fontSize: '1rem',
  fontWeight: 900,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  boxShadow: `8px 8px 0 ${theme.colors.border}`,
};

function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('skipAuth');
    navigate('/login');
  };

  const handleGuestContinue = () => {
    localStorage.setItem('skipAuth', 'true');
    navigate('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '24px', textAlign: 'center', padding: '24px' }}>
      <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 900, letterSpacing: '0.12em', margin: 0, textTransform: 'uppercase' }}>Personal Tracker</h1>
      <p style={{ maxWidth: '680px', margin: 0, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.6 }}>
        Track transactions with your account or continue offline in guest mode.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center', marginTop: '12px' }}>
        <button style={guestLandingButtonStyle} onClick={handleLogin}>Login</button>
        <button style={guestLandingButtonStyle} onClick={handleGuestContinue}>Continue as Guest</button>
      </div>
    </div>
  );
}

function AppShell() {
  return (
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      localStorage.removeItem('skipAuth');
      await login(username, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError((err.message || 'LOGIN FAILED').toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => navigate('/');

  const containerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '24px', textAlign: 'center' };
  const titleStyle = { fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' };
  const inputStyle = { width: '100%', maxWidth: '300px', padding: '12px 16px', border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: theme.typography.fontFamily };
  const buttonStyle = { padding: '14px 32px', border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`, backgroundColor: theme.colors.background, color: theme.colors.text, fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'none' };

  return (
    <div style={containerStyle}>
      <button style={{ ...buttonStyle, alignSelf: 'flex-start', fontSize: '0.75rem', padding: '8px 16px', marginBottom: '16px' }} onClick={handleBackHome}>← BACK TO HOME</button>
      <h2 style={titleStyle}>LOGIN</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <input type="text" placeholder="USERNAME" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} autoComplete="username" />
        <input type="password" placeholder="PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoComplete="current-password" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <button style={{ ...buttonStyle, width: '100%' }} onClick={handleLogin} disabled={loading}>{loading ? 'LOGGING IN...' : 'LOGIN'}</button>
      </div>
      {error ? <p style={{ fontSize: '0.75rem', color: theme.colors.text, letterSpacing: '0.05em', maxWidth: '420px', textTransform: 'uppercase' }}>{error}</p> : null}
    </div>
  );
}

export default App;
