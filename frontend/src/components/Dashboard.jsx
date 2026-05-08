import React, { useMemo, useState, useCallback } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
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

// Brutalist pie label: category + amount
const renderPieLabel = ({ name, value }) => `${name.toUpperCase()} ${formatIDR(value)}`;

function Dashboard() {
  const isMobile = useIsMobile(640);

  // ===== CHART INTERACTION STATE =====
  const [selectedBar, setSelectedBar] = useState(null);
  const [selectedSlice, setSelectedSlice] = useState(null);

  const handleBarClick = useCallback((data) => {
    setSelectedBar((prev) => (prev === data.name ? null : data.name));
  }, []);

  const handlePieClick = useCallback((data) => {
    setSelectedSlice((prev) => (prev === data.name ? null : data.name));
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
                activeBar={(entry) =>
                  selectedBar === entry.name
                    ? { fill: '#000000', stroke: '#FFFFFF', strokeWidth: 4 }
                    : { fill: '#FFFFFF' }
                }
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
                outerRadius={isMobile ? 80 : 110}
                innerRadius={isMobile ? 30 : 40}
                stroke="#000000"
                strokeWidth={2}
                label={isMobile ? false : renderPieLabel}
                labelLine={isMobile ? false : { stroke: '#FFFFFF', strokeWidth: 1 }}
                isAnimationActive={false}
                activeShape={(props) => {
                  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                  const isSelected = selectedSlice === props.name;
                  return (
                    <g>
                      <path
                        d={`
                          M ${cx + (outerRadius + (isSelected ? 8 : 0)) * Math.cos(-startAngle * Math.PI / 180)} ${cy + (outerRadius + (isSelected ? 8 : 0)) * Math.sin(-startAngle * Math.PI / 180)}
                          A ${outerRadius + (isSelected ? 8 : 0)} ${outerRadius + (isSelected ? 8 : 0)} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + (outerRadius + (isSelected ? 8 : 0)) * Math.cos(-endAngle * Math.PI / 180)} ${cy + (outerRadius + (isSelected ? 8 : 0)) * Math.sin(-endAngle * Math.PI / 180)}
                          L ${cx + (innerRadius - (isSelected ? 4 : 0)) * Math.cos(-endAngle * Math.PI / 180)} ${cy + (innerRadius - (isSelected ? 4 : 0)) * Math.sin(-endAngle * Math.PI / 180)}
                          A ${innerRadius - (isSelected ? 4 : 0)} ${innerRadius - (isSelected ? 4 : 0)} 0 ${endAngle - startAngle > 180 ? 1 : 0} 0 ${cx + (innerRadius - (isSelected ? 4 : 0)) * Math.cos(-startAngle * Math.PI / 180)} ${cy + (innerRadius - (isSelected ? 4 : 0)) * Math.sin(-startAngle * Math.PI / 180)}
                          Z
                        `}
                        fill={isSelected ? '#000000' : fill}
                        stroke="#FFFFFF"
                        strokeWidth={isSelected ? 4 : 2}
                      />
                    </g>
                  );
                }}
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
              <Legend formatter={renderLegendText} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
