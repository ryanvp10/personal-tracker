import React, { useState } from 'react';
import { FiArrowUp, FiArrowDown, FiFilter, FiTrash2 } from 'react-icons/fi';
import theme from '../theme';

// Placeholder data
const initialTransactions = [
  { id: 1, type: 'in', amount: 5000.0, category: 'SALARY', note: 'Monthly salary', date: '2026-05-01' },
  { id: 2, type: 'out', amount: 1200.0, category: 'RENT', note: 'Apartment rent', date: '2026-05-02' },
  { id: 3, type: 'out', amount: 85.5, category: 'FOOD', note: 'Grocery shopping', date: '2026-05-03' },
  { id: 4, type: 'in', amount: 750.0, category: 'FREELANCE', note: 'Web design project', date: '2026-05-04' },
  { id: 5, type: 'out', amount: 200.0, category: 'UTILITIES', note: 'Electric bill', date: '2026-05-05' },
  { id: 6, type: 'out', amount: 45.0, category: 'TRANSPORT', note: 'Gas', date: '2026-05-06' },
  { id: 7, type: 'out', amount: 150.0, category: 'ENTERTAINMENT', note: 'Concert tickets', date: '2026-05-07' },
  { id: 8, type: 'in', amount: 300.0, category: 'INVESTMENT', note: 'Dividend payout', date: '2026-05-07' },
];

function TransactionList() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const formatCurrency = (val) => {
    // Indonesian Rupiah format: dots for thousands, no decimals
    const integerPart = Math.floor(val);
    return integerPart.toLocaleString('de-DE'); // de-DE uses dots for thousands
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* ===== PAGE TITLE ===== */}
      <h2
        style={{
          fontSize: 'clamp(1rem, 3vw, 1.5rem)',
          fontWeight: 900,
          letterSpacing: '0.15em',
          borderBottom: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
          paddingBottom: '16px',
          margin: 0,
        }}
      >
        TRANSACTIONS
      </h2>

      {/* ===== FILTER BAR ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <FiFilter size={16} />
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: theme.colors.textMuted }}>
          FILTER:
        </span>
        {['all', 'in', 'out'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
              backgroundColor: filter === f ? theme.colors.hover : theme.colors.background,
              color: filter === f ? theme.colors.hoverText : theme.colors.text,
              fontWeight: 900,
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? 'ALL' : f === 'in' ? 'INCOME' : 'EXPENSES'}
          </button>
        ))}
      </div>

      {/* ===== TRANSACTION LIST ===== */}
      {filtered.length === 0 ? (
        <div
          style={{
            border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
            padding: '48px 24px',
            textAlign: 'center',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            color: theme.colors.textMuted,
          }}
        >
          NO TRANSACTIONS FOUND
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '16px',
                alignItems: 'center',
                padding: '16px',
                border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                backgroundColor: theme.colors.background,
              }}
            >
              {/* ICON */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {t.type === 'in' ? (
                  <FiArrowUp size={20} />
                ) : (
                  <FiArrowDown size={20} />
                )}
              </div>

              {/* DETAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                  {t.note || 'NO NOTE'}
                </span>
                <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, letterSpacing: '0.1em' }}>
                  {t.category}
                </span>
                <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, letterSpacing: '0.1em' }}>
                  {new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                </span>
              </div>

              {/* AMOUNT */}
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.type === 'in' ? '+' : '-'}Rp. {formatCurrency(t.amount)}
              </span>

              {/* DELETE */}
              <button
                onClick={() => handleDelete(t.id)}
                aria-label="Delete transaction"
                style={{
                  padding: '8px',
                  border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===== COUNT ===== */}
      <div
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.15em',
          color: theme.colors.textMuted,
          textAlign: 'right',
        }}
      >
        SHOWING {filtered.length} OF {transactions.length} TRANSACTIONS
      </div>
    </div>
  );
}

export default TransactionList;
