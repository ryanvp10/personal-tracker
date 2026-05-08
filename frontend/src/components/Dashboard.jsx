import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiX } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import theme from '../theme';
import { mockTransactions } from '../mockData.js';
import { useIsMobile } from '../hooks/useIsMobile';

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

const formatIDR = (val) => {
  const integerPart = Math.floor(val);
  return 'Rp. ' + integerPart.toLocaleString('de-DE');
};

// Brutalist tooltip: black bg, white border, no radius
const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#000000',
    border: '6px solid #FFFFFF',
    borderRadius: '0px',
    color: '#FFFFFF',
    fontSize: '0.7rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '8px 12px',
  },
  itemStyle: { color: '#FFFFFF' },
  labelStyle: { color: '#888888', fontWeight: 900 },
};

// Brutalist legend label renderer
const renderLegendText = (value) => (
  <span style={{ color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
    {value}
  </span>
);



// ===== BRUTALIST POPUP =====
function BrutalistPopup({ title, children, onClose, isMobile }) {
  const popupRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0' : '24px',
      }}
    >
      <div
        ref={popupRef}
        style={{
          backgroundColor: '#000000',
          border: '6px solid #FFFFFF',
          borderRadius: '0px',
          padding: isMobile ? '24px' : '32px',
          width: isMobile ? '100vw' : 'auto',
          minWidth: isMobile ? 'auto' : '360px',
          maxWidth: isMobile ? '100vw' : '520px',
          height: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : 'none',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflow: isMobile ? 'auto' : 'visible',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          color: '#FFFFFF',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          lineHeight: '1.8',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const isMobile = useIsMobile(640);

  // ===== CHART INTERACTION STATE =====
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedSlice, setSelectedSlice] = useState(null);

  const closePopup = useCallback(() => {
    setSelectedBar(null);
    setSelectedSlice(null);
  }, []);

  const handleBarClick = useCallback((data) => {
    setSelectedSlice(null);
    setSelectedBar(data);
  }, []);

  const handlePieClick = useCallback((data) => {
    setSelectedBar(null);
    setSelectedSlice(data);
  }, []);

  // ===== DERIVE DATA FROM mockTransactions =====
  const { summary, barData, pieData } = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    const categoryMap = {};

    mockTransactions.forEach((tx) => {
      if (tx.type === 'in') {
        totalIn += tx.amount;
      } else if (tx.type === 'out') {
        totalOut += tx.amount;
        if (tx.category) {
          categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    const balance = totalIn - totalOut;

    // Bar chart: income vs expense single-month summary
    const bar = [
      { name: 'INCOME', amount: totalIn },
      { name: 'EXPENSE', amount: totalOut },
    ];

    // Pie chart: expense breakdown by category
    const CAT_COLORS = {
      food: '#FFFFFF',
      transport: '#888888',
      bills: '#444444',
    };
    const pie = Object.entries(categoryMap).map(([cat, total]) => ({
      name: cat,
      value: total,
      color: CAT_COLORS[cat] || '#FFFFFF',
    }));

    return {
      summary: { totalBalance: balance, monthlyIn: totalIn, monthlyOut: totalOut },
      barData: bar,
      pieData: pie,
    };
  }, []);

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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiDollarSign size={24} />
            <span style={labelStyle}>TOTAL BALANCE</span>
          </div>
          <span style={valueStyle}>{formatIDR(summary.totalBalance)}</span>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTrendingUp size={24} />
            <span style={labelStyle}>MONTHLY IN</span>
          </div>
          <span style={valueStyle}>{formatIDR(summary.monthlyIn)}</span>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiTrendingDown size={24} />
            <span style={labelStyle}>MONTHLY OUT</span>
          </div>
          <span style={valueStyle}>{formatIDR(summary.monthlyOut)}</span>
        </div>
      </div>

      {/* ===== CHARTS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* BAR CHART: Income vs Expense */}
        <div style={{ ...cardStyle, padding: isMobile ? '16px' : '24px', minHeight: isMobile ? '300px' : '350px', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ ...labelStyle, textAlign: 'center', marginBottom: '16px' }}>
            INCOME VS EXPENSE
          </span>
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
            <BarChart
              data={barData}
              barCategoryGap="30%"
              barSize={isMobile ? 48 : 64}
              maxBarSize={80}
              margin={isMobile ? { top: 5, right: 0, left: -15, bottom: 5 } : { top: 5, right: 10, left: 0, bottom: 5 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  handleBarClick(e.activePayload[0].payload);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid stroke="#FFFFFF" strokeDasharray="0" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#FFFFFF', fontSize: 10, fontWeight: 900 }}
                axisLine={{ stroke: '#FFFFFF', strokeWidth: 2 }}
                tickLine={{ stroke: '#FFFFFF' }}
              />
              <YAxis
                tickFormatter={(v) => Math.floor(v / 1000) + 'K'}
                tick={{ fill: '#888888', fontSize: 10, fontWeight: 900 }}
                axisLine={{ stroke: '#FFFFFF', strokeWidth: 2 }}
                tickLine={{ stroke: '#FFFFFF' }}
              />
              <Tooltip
                formatter={(value) => [formatIDR(value), '']}
                {...tooltipStyle}
                cursor={{ fill: '#222222' }}
              />
              <Bar
                dataKey="amount"
                fill="#FFFFFF"
                radius={[0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART: Expense Breakdown */}
        <div style={{ ...cardStyle, padding: isMobile ? '16px' : '24px', minHeight: isMobile ? '300px' : '350px', width: '100%', boxSizing: 'border-box' }}>
          <span style={{ ...labelStyle, textAlign: 'center', marginBottom: '16px' }}>
            SPENDING BY CATEGORY
          </span>
          <ResponsiveContainer width="100%" height={isMobile ? 260 : 280}>
            <PieChart
              margin={{ top: 10, right: 20, bottom: isMobile ? 10 : 50, left: 20 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  handlePieClick(e.activePayload[0].payload);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 80 : 100}
                innerRadius={isMobile ? 30 : 40}
                stroke="#000000"
                strokeWidth={2}
                label={false}
                labelLine={isMobile ? false : { stroke: '#FFFFFF', strokeWidth: 1 }}
                isAnimationActive={false}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} radius={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatIDR(value), name.toUpperCase()]}
                {...tooltipStyle}
              />
              {!isMobile && (
                <Legend
                  formatter={renderLegendText}
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: '24px' }}
                  contentStyle={{ borderRadius: '0px' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== POPUP: Bar selected ===== */}
      {selectedBar && (
        <BrutalistPopup
          title={`BAR DETAIL: ${selectedBar.name}`}
          onClose={closePopup}
          isMobile={isMobile}
        >
          <div>NAME: {selectedBar.name}</div>
          <div>AMOUNT: {formatIDR(selectedBar.amount)}</div>
        </BrutalistPopup>
      )}

      {/* ===== POPUP: Pie slice selected ===== */}
      {selectedSlice && (() => {
        const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);
        const pct = totalPie > 0 ? ((selectedSlice.value / totalPie) * 100).toFixed(1) : '0.0';
        return (
          <BrutalistPopup
            title={`SLICE DETAIL: ${selectedSlice.name.toUpperCase()}`}
            onClose={closePopup}
            isMobile={isMobile}
          >
            <div>NAME: {selectedSlice.name.toUpperCase()}</div>
            <div>VALUE: {formatIDR(selectedSlice.value)}</div>
            <div>PERCENTAGE: {pct}%</div>
          </BrutalistPopup>
        );
      })()}
    </div>
  );
}

export default Dashboard;
