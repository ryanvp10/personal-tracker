'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { signAuthToken } = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signAuthToken(user);
    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error('[API] POST /auth/login error:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to login' });
  }
});

module.exports = router;
