'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'personal-tracker-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, error: 'Missing bearer token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { authenticateToken, signAuthToken };
