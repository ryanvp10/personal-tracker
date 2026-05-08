'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'personal_tracker',
  password: process.env.PGPASSWORD || '',
  port: parseInt(process.env.PGPORT || '5432', 10),
});

// Test connection on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    const res = await client.query('SELECT NOW() AS time');
    console.log(`[DB] Server time: ${res.rows[0].time}`);
    client.release();
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };
