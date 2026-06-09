'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const DATA_DIR = '/data';
const DB_PATH = path.join(DATA_DIR, 'personal-tracker.db');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_RETENTION_DAYS = 7;

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function backupDatabase() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database file not found: ${DB_PATH}`);
  }

  const today = new Date();
  const backupPath = path.join(BACKUP_DIR, `backup-${formatDate(today)}.db`);
  fs.copyFileSync(DB_PATH, backupPath);

  const cutoff = new Date(today);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (BACKUP_RETENTION_DAYS - 1));

  for (const file of fs.readdirSync(BACKUP_DIR)) {
    const match = /^backup-(\d{4}-\d{2}-\d{2})\.db$/.exec(file);
    if (!match) continue;

    const backupDate = new Date(`${match[1]}T00:00:00`);
    if (Number.isNaN(backupDate.getTime())) continue;

    if (backupDate < cutoff) {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
    }
  }

  return backupPath;
}

try {
  const backupPath = backupDatabase();
  console.log(`Backup created: ${backupPath}`);
} catch (err) {
  console.error(`Backup failed: ${err.message}`);
  process.exit(1);
}
