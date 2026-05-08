import React, { useState, useMemo } from 'react';
import { FiArrowUp, FiArrowDown, FiFilter, FiTrash2, FiDownload, FiFile } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { mockTransactions } from '../mockData.js';
import theme from '../theme';
import { useIsMobile } from '../hooks/useIsMobile';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonthOptions() {
  return [{ value: 'all', label: 'All Months' }].concat(
    MONTHS.map((name, idx) => ({
      value: String(idx + 1).padStart(2, '0'),
      label: name,
    }))
  );
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const endYear = currentYear + 5;
  const options = [{ value: 'all', label: 'All Years' }];
  for (let y = startYear; y <= endYear; y++) {
    options.push({ value: String(y), label: String(y) });
  }
  return options;
}

const BrutalistSelect = ({ value, onChange, options, isMobile }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: isMobile ? '6px 10px' : '8px 12px',
      border: '6px solid #000000',
      borderRadius: 0,
      backgroundColor: value !== 'all' ? '#000000' : '#ffffff',
      color: value !== 'all' ? '#ffffff' : '#000000',
      fontWeight: 900,
      fontSize: '0.7rem',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      cursor: 'pointer',
      appearance: 'none',
      fontFamily: "'Courier New', Courier, monospace",
      flex: isMobile ? '1' : 'auto',
      width: isMobile ? '100%' : 'auto',
    }}
  >
    {options.map((opt) => (
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
);

function TransactionList() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const isMobile = useIsMobile(640);

  const monthOptions = useMemo(() => getMonthOptions(), []);
  const yearOptions = useMemo(() => getYearOptions(), []);

  const filtered = useMemo(() => {
    let result = transactions;
    // Apply month filter
    if (monthFilter !== 'all') {
      const monthPart = `-${monthFilter}-`;
      result = result.filter((t) => t.date.includes(monthPart));
    }
    // Apply year filter
    if (yearFilter !== 'all') {
      result = result.filter((t) => t.date.startsWith(yearFilter));
    }
    // Apply type filter
    if (filter !== 'all') {
      result = result.filter((t) => t.type === filter);
    }
    return result;
  }, [transactions, monthFilter, yearFilter, filter]);

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

  const sanitizeForExcel = (value) => {
    if (value === null || value === undefined) return value;
    const str = String(value);
    if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
      return `'${str}`;
    }
    return str;
  };

  const handleExportExcel = () => {
    // Build worksheet data
    const wb = XLSX.utils.book_new();

    // Title row
    const aoa = [['TRANSACTIONS']];

    // Header row
    aoa.push(['Note', 'Category', 'Date', 'Type', 'Amount']);

    // Data rows
    filtered.forEach((t) => {
      aoa.push([
        sanitizeForExcel(t.note || 'NO NOTE'),
        sanitizeForExcel(t.category),
        formatDate(t.date),
        t.type === 'in' ? 'INCOME' : 'EXPENSES',
        `${t.type === 'in' ? '+' : '-'}Rp. ${formatCurrency(t.amount)}`,
      ]);
    });

    // Blank row before summary
    aoa.push([]);

    // Calculate summary totals from filtered transactions
    const totalIncome = filtered
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);
    const remainingBudget = totalIncome - totalExpenses;

    // Summary rows
    aoa.push(['TOTAL INCOME', `+Rp. ${formatCurrency(totalIncome)}`]);
    aoa.push(['TOTAL EXPENSES', `-Rp. ${formatCurrency(totalExpenses)}`]);
    aoa.push([
      'REMAINING BUDGET',
      `${remainingBudget >= 0 ? '+' : '-'}Rp. ${formatCurrency(Math.abs(remainingBudget))}`,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Column widths
    ws['!cols'] = [
      { wch: 30 }, // Note
      { wch: 20 }, // Category
      { wch: 14 }, // Date
      { wch: 12 }, // Type
      { wch: 28 }, // Amount
    ];

    // Cell styles function
    const makeCellRef = (r, c) => XLSX.utils.encode_cell({ r, c });

    // Build styles object
    const styles = {};

    // Row 1 (title) - row index 0
    for (let c = 0; c < 5; c++) {
      const ref = makeCellRef(0, c);
      styles[ref] = {
        s: {
          font: { bold: true, sz: 14, color: { rgb: '000000' } },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        },
      };
    }

    // Header row (row index 1) - black bg, white text
    for (let c = 0; c < 5; c++) {
      const ref = makeCellRef(1, c);
      styles[ref] = {
        s: {
          font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
          },
        },
      };
    }

    // Data rows (starting at row index 2)
    filtered.forEach((t, idx) => {
      const r = idx + 2;
      for (let c = 0; c < 5; c++) {
        const ref = makeCellRef(r, c);
        styles[ref] = {
          s: {
            font: { sz: 10, color: { rgb: '000000' } },
            fill: { fgColor: { rgb: 'FFFFFF' } },
            alignment:
              c === 4 ? { horizontal: 'right', vertical: 'center' } : { horizontal: 'left', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          },
        };
      }
    });

    // Summary rows (at the end)
    const summaryStartRow = aoa.length - 3;
    for (let i = 0; i < 3; i++) {
      const r = summaryStartRow + i;
      for (let c = 0; c < 5; c++) {
        const ref = makeCellRef(r, c);
        styles[ref] = {
          s: {
            font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '000000' } },
            alignment:
              c >= 1 ? { horizontal: 'right', vertical: 'center' } : { horizontal: 'left', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          },
        };
      }
    }

    // Apply styles to worksheet
    if (!ws['!dataValidation']) ws['!dataValidation'] = [];

    // Merge title row across 5 columns
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    // Store original cells for styled export
    const originalCells = {};
    XLSX.utils.sheet_to_json(ws, { header: 1, raw: false }).forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        const ref = makeCellRef(rIdx, cIdx);
        if (!originalCells[ref]) originalCells[ref] = {};
        originalCells[ref].v = cell;
      });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    // Use writeFile with cellStyles option
    XLSX.writeFile(wb, 'transactions.xlsx', { cellStyles: true, bookSST: false, styles: styles, cellDates: false });
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
            onClick={handleExportExcel}
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
        <BrutalistSelect
          value={monthFilter}
          onChange={setMonthFilter}
          options={monthOptions}
          isMobile={isMobile}
        />

        {/* YEAR SELECTOR */}
        <BrutalistSelect
          value={yearFilter}
          onChange={setYearFilter}
          options={yearOptions}
          isMobile={isMobile}
        />

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
