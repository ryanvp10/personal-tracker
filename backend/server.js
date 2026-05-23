'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection, seedHardcodedUsers } = require('./db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const { initBot } = require('./telegram/bot');

const app = express();
const PORT = parseInt(process.env.PORT || '7860', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!process.env.NODE_ENV) {
  console.warn('[WARN] NODE_ENV is not set — defaulting to "development". Set NODE_ENV=production in production.');
}
if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  console.error(`[FATAL] NODE_ENV must be "development" or "production", got: "${NODE_ENV}"`);
  process.exit(1);
}

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV, uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api', transactionRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'PERSONAL TRACKER API',
    version: '1.0.0',
    endpoints: {
      'GET  /api/health': 'Health check',
      'POST /api/auth/login': 'Authenticate user and return JWT',
      'GET  /api/transactions': 'List all transactions',
      'POST /api/transactions': 'Create transaction',
      'DELETE /api/transactions/:id': 'Delete transaction',
      'GET  /api/summary': 'Monthly summary',
      'GET  /api/categories': 'Spending by category',
    },
  });
});

app.use((req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error('[SERVER] Error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

async function start() {
  console.log('═══════════════════════════════════════');
  console.log('  PERSONAL TRACKER - BACKEND');
  console.log('═══════════════════════════════════════');
  console.log(`  env : ${NODE_ENV}`);
  console.log(`  port: ${PORT}`);
  console.log(`  cors: [${corsOrigins.join(', ')}]`);
  console.log('───────────────────────────────────────');

  testConnection();
  seedHardcodedUsers();
  initBot();
  app.listen(PORT, '0.0.0.0', () => console.log(`[HTTP] Server running on http://0.0.0.0:${PORT}`));
}

start().catch((err) => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});

module.exports = app;
