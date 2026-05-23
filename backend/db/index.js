'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'personal-tracker.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('in', 'out')),
    amount INTEGER NOT NULL CHECK(amount > 0),
    category TEXT,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seedHardcodedUsers() {
  const users = [
    { username: 'yan', password: 'yan123' },
    { username: 'partner', password: 'partner123' },
  ];

  const insert = db.prepare('INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)');
  for (const user of users) {
    const password_hash = bcrypt.hashSync(user.password, 10);
    insert.run(user.username, password_hash);
  }
}

seedHardcodedUsers();

function testConnection() {
  try {
    const row = db.prepare('SELECT datetime("now") AS time').get();
    console.log('[DB] Connected to SQLite');
    console.log(`[DB] Server time: ${row.time}`);
    return true;
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    return false;
  }
}

function getDb() {
  return db;
}

module.exports = { db, getDb, testConnection, seedHardcodedUsers };
