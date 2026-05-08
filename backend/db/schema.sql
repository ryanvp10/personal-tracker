-- =============================================
-- PERSONAL TRACKER - DATABASE SCHEMA
-- =============================================
-- Run this SQL to set up the database:
--   psql -U postgres -d personal_tracker -f backend/db/schema.sql

-- Create the database (run as superuser if needed):
-- CREATE DATABASE personal_tracker;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(3) CHECK (type IN ('in', 'out')) NOT NULL,
  amount INTEGER NOT NULL,
  category VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
