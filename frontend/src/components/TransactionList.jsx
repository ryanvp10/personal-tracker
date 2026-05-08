import React, { useState, useMemo } from 'react';
import { FiArrowUp, FiArrowDown, FiFilter, FiTrash2, FiDownload, FiFile } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockTransactions } from '../mockData.js';
import theme from '../theme';
import { useIsMobile } from '../hooks/useIsMobile';

function getMonthOptions() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const options = [{ value: 'all', label: 'All Months' }];

  for (let offset = -12; offset <= 12; offset++) {
    const totalMonths = currentYear * 12 + currentMonth + offset;
    const year = Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    const value = `${year}-${String(month + 1).padStart(2, '0')}`;
    const label = `${months[month]} ${year}`;
    options.push({ value, label });
  }
  return options;
}

function TransactionList() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const isMobile = useIsMobile(640);

  const monthOptions = useMemo(() => getMonthOptions(), []);

  const filtered = useMemo(() => {
    let result = transactions;
    // First: apply month filter
    if (monthFilter !== 'all') {
      result = result.filter((t) => t.date.startsWith(monthFilter));
    }
    // Then: apply type filter
    if (filter !== 'all') {
      result = result.filter((t) => t.type === filter);
    }
    return result;
  }, [transactions, monthFilter, filter]);

  const formatCurrency = (val) => {
    const integerPart = Math.floor(val);
    return integerPart.toLocaleString('de-DE');
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('TRANSACTIONS', 14, 20);

    // Build table rows
    const rows = filtered.map((t) => [
      t.note || 'NO NOTE',
      t.category,
      formatDate(t.date),
      t.type === 'in' ? 'INCOME' : 'EXPENSES',
      `${t.type === 'in' ? '+' : '-'}Rp. ${formatCurrency(t.amount)}`,
    ]);

    // Calculate summary totals from filtered transactions
    const totalIncome = filtered
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = totalIncome - totalExpenses;

    autoTable(doc, {
      head: [['Note', 'Category', 'Date', 'Type', 'Amount']],
      body: rows,
      startY: 28,
      styles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        fontSize: 9,
        cellPadding: 4,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      theme: 'plain',
      margin: { left: 14, right: 14 },
    });

    // --- Summary footer rows (brutalist: black bg, white text, left-aligned) ---
    const tableLeft = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableRight = pageWidth - 14;

    const finalY = doc.lastAutoTable.finalY || (28 + rows.length * 10 + 10);
    const rowHeight = 12;
    const paddingLeft = 4;

    const summaryRows = [
      { label: 'TOTAL INCOME', value: `+Rp. ${formatCurrency(totalIncome)}` },
      { label: 'TOTAL EXPENSES', value: `-Rp. ${formatCurrency(totalExpenses)}` },
      { label: 'REMAINING BUDGET', value: `${remainingBudget >= 0 ? '+' : '-'}Rp. ${formatCurrency(Math.abs(remainingBudget))}` },
    ];

    summaryRows.forEach((sr, i) => {
      const y = finalY + (i + 1) * rowHeight;
      // Black background spanning full table width
      doc.setFillColor(0, 0, 0);
      doc.rect(tableLeft, y - rowHeight + 4, tableRight - tableLeft, rowHeight - 2, 'F');
      // White bold text — label at tableLeft, value right after label
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      const labelWidth = doc.getTextWidth(sr.label + ' ');
      doc.text(sr.label, tableLeft, y);
      doc.text(sr.value, tableLeft + labelWidth, y);
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    doc.save('transactions.pdf');
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
            onClick={handleExportPDF}
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
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '8px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter size={16} />
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: theme.colors.textMuted }}>
            FILTER:
          </span>
        </div>

        {/* MONTH SELECTOR */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          style={{
            padding: isMobile ? '6px 10px' : '8px 12px',
            border: `${theme.borders.width} ${theme.borders.style} ${theme.borders.color}`,
            backgroundColor: monthFilter !== 'all' ? theme.colors.hover : theme.colors.background,
            color: monthFilter !== 'all' ? theme.colors.hoverText : theme.colors.text,
            fontWeight: 900,
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            appearance: 'auto',
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {monthOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.85rem',
              }}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* TYPE FILTER BUTTONS */}
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
                      gridTemplateColumns: 'auto 1fr 80px 160px auto',
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
