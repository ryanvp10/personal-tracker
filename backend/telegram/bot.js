'use strict';

const { Telegraf } = require('telegraf');
const { pool } = require('../db');

// =============================================
// KEYWORD DICTIONARIES
// =============================================
const INCOME_KEYWORDS = [
  'gaji', 'salary', 'bonus', 'jual', 'sell', 'hasil', 'income',
  'pendapatan', 'masuk', 'terima', 'profit', 'untung', 'fee',
];

const EXPENSE_KEYWORDS = [
  'makan', 'food', 'ayam', 'nasi', 'grab', 'transport', 'bensin',
  'listrik', 'air', 'beli', 'buy', 'minum', 'snack', 'jajan',
  'parkir', 'tol', 'tagihan', 'spp', 'kuliah', 'bayar',
];

// Category mapping: keyword -> category name
const CATEGORY_MAP = {
  // Food
  ayam: 'food',
  makan: 'food',
  nasi: 'food',
  food: 'food',
  minum: 'food',
  snack: 'food',
  jajan: 'food',
  // Transport
  grab: 'transport',
  bensin: 'transport',
  transport: 'transport',
  parkir: 'transport',
  tol: 'transport',
  // Bills
  listrik: 'bills',
  air: 'bills',
  tagihan: 'bills',
  // Income / Salary
  gaji: 'salary',
  salary: 'salary',
  bonus: 'salary',
  // Shopping
  beli: 'shopping',
  buy: 'shopping',
  // Education
  spp: 'education',
  kuliah: 'education',
};

// =============================================
// AMOUNT PARSER
// =============================================
// Parses IDR shorthand: '20k' -> 20000, '5jt' -> 5000000, '1.5M' -> 1500000000
function parseAmount(text) {
  // Match patterns: 20k, 5jt, 10rb, 1.5M, 2.5m, or plain numbers
  const patterns = [
    // Miliar (billion): 1.5M, 2M, 1.5m
    { regex: /(\d[\d.,]*)\s*(M|m)\b/, multiplier: 1e9 },
    // Juta (million): 5jt, 5 jt, 5juta, 5 juta
    { regex: /(\d[\d.,]*)\s*(jt|juta)\b/i, multiplier: 1e6 },
    // Ribu (thousand): 20k, 20rb, 20 rb, 20ribu, 20 ribu
    { regex: /(\d[\d.,]*)\s*(k|rb|ribu)\b/i, multiplier: 1e3 },
  ];

  for (const { regex, multiplier } of patterns) {
    const match = text.match(regex);
    if (match) {
      // Replace comma with dot for Indonesian decimal format, keep dots as-is
      let numStr = match[1].replace(',', '.');
      let num = parseFloat(numStr);
      if (!isNaN(num)) {
        return Math.round(num * multiplier);
      }
    }
  }

  // Plain number (no suffix)
  const plainMatch = text.match(/\b(\d[\d.,]*)\b/);
  if (plainMatch) {
    let numStr = plainMatch[1].replace(',', '.');
    let num = parseFloat(numStr);
    if (!isNaN(num)) {
      return Math.round(num);
    }
  }

  return null;
}

// =============================================
// KEYWORD DETECTOR
// =============================================
function detectType(text) {
  const lower = text.toLowerCase();

  const hasIncome = INCOME_KEYWORDS.some(kw => lower.includes(kw));
  const hasExpense = EXPENSE_KEYWORDS.some(kw => lower.includes(kw));

  if (hasIncome && !hasExpense) return 'in';
  if (hasExpense && !hasIncome) return 'out';
  if (hasIncome && hasExpense) {
    // If both found, prioritize the first match position
    const firstIncome = INCOME_KEYWORDS
      .map(kw => ({ kw, pos: lower.indexOf(kw) }))
      .filter(x => x.pos >= 0)
      .sort((a, b) => a.pos - b.pos)[0];
    const firstExpense = EXPENSE_KEYWORDS
      .map(kw => ({ kw, pos: lower.indexOf(kw) }))
      .filter(x => x.pos >= 0)
      .sort((a, b) => a.pos - b.pos)[0];
    return (firstIncome?.pos ?? Infinity) < (firstExpense?.pos ?? Infinity) ? 'in' : 'out';
  }

  // Default to expense if no keywords found
  return 'out';
}

// =============================================
// CATEGORY DETECTOR
// =============================================
function detectCategory(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  // First pass: check multi-word keys, then single words
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }

  return 'other';
}

// =============================================
// NOTE EXTRACTOR
// =============================================
// Extract the descriptive part of the message (remove amount parts)
function extractNote(text, amount) {
  if (!amount) return text.trim();

  // Remove the amount part from text
  let note = text;
  const amountPatterns = [
    /\d[\d.,]*\s*(M|m|jt|juta|juta)\b/gi,
    /\d[\d.,]*\s*(k|rb|ribu)\b/gi,
  ];

  for (const pattern of amountPatterns) {
    note = note.replace(pattern, '');
  }

  note = note.replace(/\s+/g, ' ').trim();
  return note || 'no description';
}

// =============================================
// FORMAT IDR
// =============================================
function formatIDR(amount) {
  return 'IDR ' + amount.toLocaleString('id-ID');
}

// =============================================
// SAVE TRANSACTION
// =============================================
async function saveTransaction(type, amount, category, note) {
  const result = await pool.query(
    `INSERT INTO transactions (type, amount, category, note)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [type, amount, category, note]
  );
  return result.rows[0];
}

// =============================================
// BOT SETUP
// =============================================
let bot = null;

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === 'your_telegram_bot_token_here') {
    console.log('[BOT] No TELEGRAM_BOT_TOKEN set — Telegram bot disabled');
    console.log('[BOT] Set your token in .env to enable the bot');
    return null;
  }

  bot = new Telegraf(token);

  // /start command
  bot.start((ctx) => {
    ctx.reply(
      'PERSONAL TRACKER BOT\n\n' +
      'Send me your expenses and income!\n\n' +
      'Examples:\n' +
      '  ayam goreng 20k\n' +
      '  gaji 5jt\n' +
      '  grab 50rb\n' +
      '  listrik 500k\n\n' +
      'Formats: 20k = 20,000 | 5jt = 5,000,000 | 1.5M = 1,500,000,000 (Miliar)'
    );
  });

  // /help command
  bot.help((ctx) => {
    ctx.reply(
      'HOW TO USE:\n\n' +
      '1. Type your transaction naturally\n' +
      "2. Include an amount (e.g. '20k', '5jt')\n" +
      '3. The bot auto-detects type and category\n\n' +
      'INCOME keywords: gaji, salary, bonus, jual, sell\n' +
      'EXPENSE keywords: makan, grab, bensin, listrik, beli\n\n' +
      'CATEGORIES: food, transport, bills, salary, shopping, other'
    );
  });

  // Handle all text messages
  bot.on('text', async (ctx) => {
    const text = ctx.message.text?.trim();
    if (!text) return;

    // Parse amount
    const amount = parseAmount(text);
    if (!amount) {
      return ctx.reply(
        "Could not find an amount in your message.\n" +
        "Use formats like: 20k, 5jt, 1.5M, or a plain number."
      );
    }

    // Detect type and category
    const type = detectType(text);
    const category = detectCategory(text);
    const note = extractNote(text, amount);

    try {
      const saved = await saveTransaction(type, amount, category, note);

      const typeLabel = saved.type === 'in' ? 'INCOME' : 'EXPENSE';
      const emoji = saved.type === 'in' ? '💰' : '💸';

      await ctx.reply(
        `${emoji} SAVED!\n\n` +
        `Type: ${typeLabel}\n` +
        `Amount: ${formatIDR(saved.amount)}\n` +
        `Category: ${saved.category}\n` +
        `Note: ${saved.note}\n\n` +
        `#${saved.id} | ${new Date(saved.created_at).toLocaleString('id-ID')}`
      );
    } catch (err) {
      console.error('[BOT] Error saving transaction:', err.message);
      ctx.reply('Failed to save transaction. Please try again.');
    }
  });

  // Start polling
  bot.launch()
    .then(() => console.log('[BOT] Telegram bot is running'))
    .catch((err) => console.error('[BOT] Failed to start:', err.message));

  // Graceful stop
  process.once('SIGINT', () => bot?.stop('SIGINT'));
  process.once('SIGTERM', () => bot?.stop('SIGTERM'));

  return bot;
}

module.exports = { initBot, parseAmount, detectType, detectCategory, extractNote };
