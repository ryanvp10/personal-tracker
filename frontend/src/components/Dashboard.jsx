import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import theme from '../theme';

const cardStyle = {
  border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
  padding: '24px',
  backgroundColor: theme.colors.cardBg,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const labelStyle = {
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  color: theme.colors.textMuted,
  fontWeight: 900,
  textTransform: 'uppercase',
};

const valueStyle = {
  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
  fontWeight: 900,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

function Dashboard() {
  // Placeholder data
  const summary = {
    totalBalance: 125430.50,
    monthlyIn: 8750.00,
    monthlyOut: 4320.75,
  };

  const formatCurrency = (val) =>
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== PAGE TITLE ===== */}
      <h2
        style={{
          fontSize: 'clamp(1rem, 3vw, 1.5rem)',
          fontWeight: 900,
          letterSpacing: '0.1em',
          borderBottom: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
          paddingBottom: '16px',
          margin: 0,
        }}
      >
        DASHBOARD
      </h2>

      {/* ===== SUMMARY CARDS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {/* TOTAL BALANCE */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiDollarSign size={24} />
            <span style={labelStyle}>TOTAL BALANCE</span>
          </div>
          <span style={valueStyle}>Rp. {formatCurrency(summary.totalBalance)}</span>
        </div>

        {/* MONTHLY IN */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTrendingUp size={24} />
            <span style={labelStyle}>MONTHLY IN</span>
          </div>
          <span style={valueStyle}>Rp. {formatCurrency(summary.monthlyIn)}</span>
        </div>

        {/* MONTHLY OUT */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTrendingDown size={24} />
            <span style={labelStyle}>MONTHLY OUT</span>
          </div>
          <span style={valueStyle}>Rp. {formatCurrency(summary.monthlyOut)}</span>
        </div>
      </div>

      {/* ===== PLACEHOLDER CHARTS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {/* INCOME VS EXPENSES CHART PLACEHOLDER */}
        <div
          style={{
            ...cardStyle,
            minHeight: '300px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <FiBarChart2 size={48} />
          <span style={{ ...labelStyle, fontSize: '0.85rem' }}>
            INCOME VS EXPENSES
          </span>
          <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textAlign: 'center' }}>
            [ CHART PLACEHOLDER ]
          </span>
        </div>

        {/* SPENDING BY CATEGORY PLACEHOLDER */}
        <div
          style={{
            ...cardStyle,
            minHeight: '300px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <FiBarChart2 size={48} />
          <span style={{ ...labelStyle, fontSize: '0.85rem' }}>
            SPENDING BY CATEGORY
          </span>
          <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, textAlign: 'center' }}>
            [ CHART PLACEHOLDER ]
          </span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
