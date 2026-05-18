import React, { useState, useRef, useEffect } from 'react';
import { FiSave, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useTransactions } from '../context/TransactionsContext';
import theme from '../theme';

const categories = [
  'FOOD',
  'RENT',
  'UTILITIES',
  'TRANSPORT',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'SHOPPING',
  'SALARY',
  'FREELANCE',
  'INVESTMENT',
  'OTHER',
];

function TransactionForm() {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState('in');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString().split('T')[0],
    });

    setSaved(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSaved(false);
      setAmount('');
      setCategory('');
      setNote('');
    }, 2000);
  };

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '32px',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
      }}
    >
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
        ADD TRANSACTION
      </h2>

      {/* ===== FORM ===== */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '600px',
        }}
      >
        {/* TYPE TOGGLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: theme.colors.textMuted }}>
            TYPE
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setType('in')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                backgroundColor: type === 'in' ? theme.colors.hover : theme.colors.background,
                color: type === 'in' ? theme.colors.hoverText : theme.colors.text,
                fontWeight: 900,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <FiArrowUp /> INCOME
            </button>
            <button
              type="button"
              onClick={() => setType('out')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
                backgroundColor: type === 'out' ? theme.colors.hover : theme.colors.background,
                color: type === 'out' ? theme.colors.hoverText : theme.colors.text,
                fontWeight: 900,
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              <FiArrowDown /> EXPENSE
            </button>
          </div>
        </div>

        {/* AMOUNT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            htmlFor="amount"
            style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: theme.colors.textMuted }}
          >
            AMOUNT
          </label>
          <input
            id="amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\./g, '');
              if (/^\d*$/.test(rawValue)) {
                setAmount(rawValue);
              }
            }}
            required
          />
        </div>

        {/* CATEGORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            htmlFor="category"
            style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: theme.colors.textMuted }}
          >
            CATEGORY
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">-- SELECT --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* NOTE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label
            htmlFor="note"
            style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: theme.colors.textMuted }}
          >
            NOTE
          </label>
          <textarea
            id="note"
            rows={4}
            placeholder="ENTER NOTE..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px',
            fontSize: '0.85rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
            backgroundColor: saved ? theme.colors.hover : theme.colors.background,
            color: saved ? theme.colors.hoverText : theme.colors.text,
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          <FiSave size={20} />
          {saved ? 'SAVED!' : 'SAVE'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;
