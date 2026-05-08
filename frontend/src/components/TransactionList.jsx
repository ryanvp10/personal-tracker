import React, { useState } from 'react';
import { FiArrowUp, FiArrowDown, FiFilter, FiTrash2, FiDownload, FiFile } from 'react-icons/fi';
import { mockTransactions } from '../mockData.js';
import theme from '../theme';
import { useIsMobile } from '../hooks/useIsMobile';

function TransactionList() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all');
  const isMobile = useIsMobile(640);

  const filtered =
    filter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const formatCurrency = (val) => {
    const integerPart = Math.floor(val);
    return integerPart.toLocaleString('de-DE');
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '32px' }}>
      {/* ===== PAGE TITLE + EXPORT BUTTONS ===== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
          paddingBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            fontWeight: 900,
            letterSpacing: '0.15em',
            margin: 0,
          }}
        >
          TRANSACTIONS
        </h2>

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => console.log('Export PDF')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '8px 10px' : '10px 16px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '6px solid #ffffff',
              fontWeight: 900,
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <FiDownload size={14} /> PDF
          </button>
          <button
            onClick={() => console.log('Export Excel')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '8px 10px' : '10px 16px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '6px solid #ffffff',
              fontWeight: 900,
              fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <FiFile size={14} /> EXCEL
          </button>
        </div>
      </div>

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
              padding: isMobile ? '6px 10px' : '8px 16px',
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
              style={
                isMobile
                  ? {
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gridTemplateRows: 'auto auto',
                      gap: '8px',
                      alignItems: 'center',
                      padding: '12px',
                      border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                      backgroundColor: theme.colors.background,
                    }
                  : {
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr 80px auto auto',
                      columnGap: '16px',
                      rowGap: '0px',
                      alignItems: 'center',
                      padding: '16px',
                      border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                      backgroundColor: theme.colors.background,
                    }
              }
            >
              {/* ICON — row 1 col 1 (both) */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {t.type === 'in' ? (
                  <FiArrowUp size={20} />
                ) : (
                  <FiArrowDown size={20} />
                )}
              </div>

              {/* DETAILS — row 1 col 2 (both) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.note || 'NO NOTE'}
                </span>
                <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, letterSpacing: '0.1em' }}>
                  {t.category}
                </span>
                <span style={{ fontSize: '0.7rem', color: theme.colors.textMuted, letterSpacing: '0.1em' }}>
                  {formatDate(t.date)}
                </span>
              </div>

              {/* TYPE BADGE — col 3 on desktop (fixed 80px col), col 3 on mobile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 0px',
                  height: isMobile ? 'auto' : '32px',
                  width: isMobile ? 'auto' : '80px',
                  minWidth: isMobile ? 'auto' : '80px',
                  boxSizing: 'border-box',
                  border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  letterSpacing: '0.15em',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  justifySelf: 'center',
                  alignSelf: 'center',
                }}
              >
                {t.type === 'in' ? 'IN' : 'OUT'}
              </div>

              {/* AMOUNT — row 2 col 2-3 on mobile, row 1 col 4 on desktop */}
              <span
                style={
                  isMobile
                    ? {
                        gridColumn: '2 / 4',
                        gridRow: '2',
                        fontSize: '0.95rem',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        color: t.type === 'in' ? '#ffffff' : '#888888',
                        textAlign: 'right',
                      }
                    : {
                        fontSize: '1rem',
                        fontWeight: 900,
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        color: t.type === 'in' ? '#ffffff' : '#888888',
                        alignSelf: 'center',
                        justifySelf: 'end',
                        maxWidth: '140px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }
                }
              >
                {t.type === 'in' ? '+' : '-'}Rp. {formatCurrency(t.amount)}
              </span>

              {/* DELETE — row 2 col 1 on mobile, row 1 col 5 on desktop */}
              <button
                onClick={() => handleDelete(t.id)}
                aria-label="Delete transaction"
                style={
                  isMobile
                    ? {
                        gridColumn: '1',
                        gridRow: '2',
                        padding: '6px',
                        border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 'fit-content',
                      }
                    : {
                        padding: '8px',
                        border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        justifySelf: 'center',
                      }
                }
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
