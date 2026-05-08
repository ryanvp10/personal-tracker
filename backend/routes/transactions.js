'use strict';

const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/transactions - List all transactions (newest first)
router.get('/transactions', async (req, res) => {
  try {
    const { type, category, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (category) {
      query += ` AND category ILIKE $${paramIndex++}`;
      params.push(`%${category}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (type) {
      countQuery += ` AND type = $${countIndex++}`;
      countParams.push(type);
    }
    if (category) {
      countQuery += ` AND category ILIKE $${countIndex++}`;
      countParams.push(`%${category}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (err) {
    console.error('[API] GET /transactions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions - Create a new transaction
router.post('/transactions', async (req, res) => {
  try {
    const { type, amount, category, note } = req.body;

    // Validation
    if (!type || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type and amount',
      });
    }

    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Type must be 'in' or 'out'",
      });
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive integer',
      });
    }

    const result = await pool.query(
      `INSERT INTO transactions (type, amount, category, note)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [type, parsedAmount, category || null, note || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('[API] POST /transactions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Validate id is a positive integer
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction ID. Must be a positive integer.',
      });
    }

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Transaction deleted',
    });
  } catch (err) {
    console.error('[API] DELETE /transactions/:id error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
  }
});

// GET /api/summary - Get monthly summary (income, expense, balance)
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) FILTER (WHERE type = 'in') AS income_count,
        COUNT(*) FILTER (WHERE type = 'out') AS expense_count
      FROM transactions
      WHERE created_at >= DATE_TRUNC('month', NOW())
        AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
    `);

    const row = result.rows[0];
    const summary = {
      total_income: parseInt(row.total_income, 10),
      total_expense: parseInt(row.total_expense, 10),
      balance: parseInt(row.total_income, 10) - parseInt(row.total_expense, 10),
      income_count: parseInt(row.income_count, 10),
      expense_count: parseInt(row.expense_count, 10),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    console.error('[API] GET /summary error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

// GET /api/categories - Get spending by category
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, SUM(amount) AS total, COUNT(*) AS count
      FROM transactions
      WHERE type = 'out'
        AND created_at >= DATE_TRUNC('month', NOW())
        AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
      GROUP BY category
      ORDER BY total DESC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        category: row.category,
        total: parseInt(row.total, 10),
        count: parseInt(row.count, 10),
      })),
    });
  } catch (err) {
    console.error('[API] GET /categories error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

module.exports = router;
