'use strict';

const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { authenticateToken } = require('../auth');

// Protect all transaction routes — require authentication
router.use(authenticateToken);

function parseLimitOffset(query) {
  const limit = Math.max(1, Math.min(500, parseInt(query.limit || '100', 10) || 100));
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  return { limit, offset };
}

function monthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

function userScopeClause(req) {
  return {
    clause: 'user_id = ?',
    params: [req.user.sub],
  };
}

router.get('/transactions', async (req, res) => {
  try {
    const { type, category } = req.query;
    const { limit, offset } = parseLimitOffset(req.query);
    const scope = userScopeClause(req);

    const where = [scope.clause, '1=1'];
    const params = [...scope.params];
    if (type) {
      where.push('type = ?');
      params.push(type);
    }
    if (category) {
      where.push('LOWER(COALESCE(category, \'\')) LIKE ?');
      params.push(`%${String(category).toLowerCase()}%`);
    }

    const result = db.prepare(`
      SELECT * FROM transactions
      WHERE ${where.join(' AND ')}
      ORDER BY datetime(created_at) DESC, id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) AS count FROM transactions
      WHERE ${where.join(' AND ')}
    `).get(...params).count;

    res.json({ success: true, data: result, total, limit, offset });
  } catch (err) {
    console.error('[API] GET /transactions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', async (req, res) => {
  try {
    const { type, amount, category, note } = req.body;
    if (!type || !amount) return res.status(400).json({ success: false, error: 'Missing required fields: type and amount' });
    if (!['in', 'out'].includes(type)) return res.status(400).json({ success: false, error: "Type must be 'in' or 'out'" });

    const parsedAmount = parseInt(amount, 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return res.status(400).json({ success: false, error: 'Amount must be a positive integer' });

    const info = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, category, note)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.sub, type, parsedAmount, category || null, note || null);

    const saved = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('[API] POST /transactions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

router.delete('/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) return res.status(400).json({ success: false, error: 'Invalid transaction ID. Must be a positive integer.' });

    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(id, req.user.sub);
    if (!existing) return res.status(404).json({ success: false, error: 'Transaction not found' });

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(id, req.user.sub);
    res.json({ success: true, data: existing, message: 'Transaction deleted' });
  } catch (err) {
    console.error('[API] DELETE /transactions/:id error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const { start, end } = monthBounds();
    const row = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN type = 'in' THEN 1 ELSE 0 END), 0) AS income_count,
        COALESCE(SUM(CASE WHEN type = 'out' THEN 1 ELSE 0 END), 0) AS expense_count
      FROM transactions
      WHERE user_id = ? AND datetime(created_at) >= datetime(?) AND datetime(created_at) < datetime(?)
    `).get(req.user.sub, start, end);

    const summary = {
      total_income: Number(row.total_income || 0),
      total_expense: Number(row.total_expense || 0),
      balance: Number(row.total_income || 0) - Number(row.total_expense || 0),
      income_count: Number(row.income_count || 0),
      expense_count: Number(row.expense_count || 0),
    };

    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('[API] GET /summary error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { start, end } = monthBounds();
    const rows = db.prepare(`
      SELECT category, SUM(amount) AS total, COUNT(*) AS count
      FROM transactions
      WHERE user_id = ? AND type = 'out' AND datetime(created_at) >= datetime(?) AND datetime(created_at) < datetime(?)
      GROUP BY category
      ORDER BY total DESC
    `).all(req.user.sub, start, end);

    res.json({
      success: true,
      data: rows.map(row => ({ category: row.category, total: Number(row.total || 0), count: Number(row.count || 0) })),
    });
  } catch (err) {
    console.error('[API] GET /categories error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

module.exports = router;
