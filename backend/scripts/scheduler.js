'use strict';

const cron = require('node-cron');
const { execSync } = require('child_process');

cron.schedule('0 2 * * *', () => {
  console.log('[BACKUP] Scheduled backup starting');
  try {
    execSync('node /app/backend/scripts/backup.js', { stdio: 'inherit' });
    console.log('[BACKUP] Scheduled backup completed');
  } catch (err) {
    console.error('[BACKUP] Scheduled backup failed:', err.message);
  }
});

console.log('[BACKUP] Daily backup scheduler initialized for 02:00');
