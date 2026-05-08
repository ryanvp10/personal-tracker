'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./db');
const transactionRoutes = require('./routes/transactions');
const { initBot } = require('./telegram/bot');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Startup: validate NODE_ENV
if (!process.env.NODE_ENV) {
  console.warn('[WARN] NODE_ENV is not set — defaulting to "development". Set NODE_ENV=production in production.');
}
if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  console.error(`[FATAL] NODE_ENV must be "development" or "production", got: "${NODE_ENV}"`);
  process.exit(1);
}

// =============================================
// CORS CONFIGURATION
// =============================================
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(s => s.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Telegram webhooks, etc.)
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In development, log allowed origins but still validate against the list
    if (NODE_ENV === 'development') {
      console.warn(`[CORS] Non-whitelisted origin in development: ${origin}`);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =============================================
// REQUEST LOGGING (development only)
// =============================================
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.url} — ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', transactionRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'PERSONAL TRACKER API',
    version: '1.0.0',
    endpoints: {
      'GET  /api/health': 'Health check',
      'GET  /api/transactions': 'List all transactions (?type=in|out&category=food&limit=100&offset=0)',
      'POST /api/transactions': 'Create transaction { type, amount, category?, note? }',
      'DELETE /api/transactions/:id': 'Delete transaction',
      'GET  /api/summary': 'Monthly summary (income, expense, balance)',
      'GET  /api/categories': 'Spending by category (current month)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER] Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// =============================================
// START SERVER
// =============================================
async function start() {
  console.log('═══════════════════════════════════════');
  console.log('  PERSONAL TRACKER - BACKEND');
  console.log('═══════════════════════════════════════');
  console.log(`  env : ${NODE_ENV}`);
  console.log(`  port: ${PORT}`);
  console.log(`  cors: [${corsOrigins.join(', ')}]`);
  console.log('───────────────────────────────────────');

  // Test database connection
  const dbOk = await testConnection();
  if (!dbOk) {
    console.log('[WARN] Running without database — transactions will fail');
    console.log('[WARN] Make sure PostgreSQL is running and .env is configured');
  }

  // Initialize Telegram bot
  initBot();

  // Start HTTP server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HTTP] Server running on http://0.0.0.0:${PORT}`);
    console.log('═══════════════════════════════════════');
    console.log('  READY');
    console.log('═══════════════════════════════════════');
  });
}

start().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
