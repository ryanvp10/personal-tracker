import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPlus, FiList, FiDollarSign } from 'react-icons/fi';
import theme from '../theme';

const navItems = [
  { to: '/', label: 'HOME', icon: <FiHome /> },
  { to: '/dashboard', label: 'DASHBOARD', icon: <FiDollarSign /> },
  { to: '/add', label: 'ADD', icon: <FiPlus /> },
  { to: '/transactions', label: 'TRANSACTIONS', icon: <FiList /> },
];

function Layout({ children }) {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {/* ===== HEADER ===== */}
      <header
        style={{
          borderBottom: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '0.15em',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          FINANCIAL TRACKER
        </h1>

        {/* ===== NAVIGATION ===== */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          {navItems.map(({ to, label, icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-label={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                  backgroundColor: isActive ? theme.colors.hover : theme.colors.background,
                  color: isActive ? theme.colors.hoverText : theme.colors.text,
                  textDecoration: 'none',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main
        style={{
          flex: 1,
          padding: '24px',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: theme.colors.textMuted,
        }}
      >
        FINANCIAL TRACKER // BRUTALIST EDITION // {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default Layout;
