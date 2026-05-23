'use strict';

const { Telegraf } = require('telegraf');
const { db } = require('../db');

const INCOME_KEYWORDS = ['gaji', 'salary', 'bonus', 'jual', 'sell', 'hasil', 'income', 'pendapatan', 'masuk', 'terima', 'profit', 'untung', 'fee'];
const EXPENSE_KEYWORDS = ['makan', 'food', 'ayam', 'nasi', 'grab', 'transport', 'bensin', 'listrik', 'air', 'beli', 'buy', 'minum', 'snack', 'jajan', 'parkir', 'tol', 'tagihan', 'spp', 'kuliah', 'bayar'];

const CATEGORY_MAP = {
  ayam: 'food', makan: 'food', nasi: 'food', food: 'food', minum: 'food', snack: 'food', jajan: 'food',
  grab: 'transport', bensin: 'transport', transport: 'transport', parkir: 'transport', tol: 'transport',
  listrik: 'bills', air: 'bills', tagihan: 'bills',
  gaji: 'salary', salary: 'salary', bonus: 'salary',
  beli: 'shopping', buy: 'shopping',
  spp: 'education', kuliah: 'education',
};

function parseAmount(text) {
  const patterns = [
    { regex: /(\d[\d.,]*)\s*(M|m)\b/, multiplier: 1e9 },
    { regex: /(\d[\d.,]*)\s*(jt|juta)\b/i, multiplier: 1e6 },
    { regex: /(\d[\d.,]*)\s*(k|rb|ribu)\b/i, multiplier: 1e3 },
  ];
  for (const { regex, multiplier } of patterns) {
    const match = text.match(regex);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      if (!Number.isNaN(num)) return Math.round(num * multiplier);
    }
  }
  const plainMatch = text.match(/\b(\d[\d.,]*)\b/);
  if (plainMatch) {
    const num = parseFloat(plainMatch[1].replace(',', '.'));
    if (!Number.isNaN(num)) return Math.round(num);
  }
  return null;
}

function detectType(text) {
  const lower = text.toLowerCase();
  const hasIncome = INCOME_KEYWORDS.some(kw => lower.includes(kw));
  const hasExpense = EXPENSE_KEYWORDS.some(kw => lower.includes(kw));
  if (hasIncome && !hasExpense) return 'in';
  if (hasExpense && !hasIncome) return 'out';
  return 'out';
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category;
  }
  return 'other';
}

function extractNote(text, amount) {
  if (!amount) return text.trim();
  return text
    .replace(/\d[\d.,]*\s*(M|m|jt|juta|k|rb|ribu)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || 'no description';
}

function formatIDR(amount) {
  return 'IDR ' + amount.toLocaleString('id-ID');
}

function getJson(url, body) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FREEMODEL_API_KEY}`,
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error?.message || data.error || `HTTP ${res.status}`);
    return data;
  });
}

async function parseWithAI(text) {
  if (!process.env.FREEMODEL_API_KEY) return null;
  const prompt = `Parse this Indonesian financial message into JSON with keys type (in|out), amount (integer), category, note. Return only JSON. Message: ${text}`;
  const data = await getJson('https://api.freemodel.dev/v1/chat/completions', {
    model: 'gpt-5.5',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    response_format: { type: 'json_object' },
  });
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

function saveTransaction(type, amount, category, note) {
  const info = db.prepare('INSERT INTO transactions (type, amount, category, note) VALUES (?, ?, ?, ?)').run(type, amount, category, note);
  return db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
}

let bot = null;

function initBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'your_telegram_bot_token_here') return null;

  bot = new Telegraf(token);
  bot.start((ctx) => ctx.reply('PERSONAL TRACKER BOT\n\nSend me your expenses and income!'));
  bot.help((ctx) => ctx.reply('Send a transaction message and I will parse it automatically.'));

  bot.on('text', async (ctx) => {
    const text = ctx.message.text?.trim();
    if (!text) return;
    try {
      const parsed = await parseWithAI(text).catch(() => null);
      const amount = parsed?.amount || parseAmount(text);
      if (!amount) return ctx.reply('Could not find an amount in your message.');
      const type = parsed?.type || detectType(text);
      const category = parsed?.category || detectCategory(text);
      const note = parsed?.note || extractNote(text, amount);
      const saved = saveTransaction(type, amount, category, note);
      await ctx.reply(`${saved.type === 'in' ? '💰' : '💸'} SAVED!\n\nType: ${saved.type === 'in' ? 'INCOME' : 'EXPENSE'}\nAmount: ${formatIDR(saved.amount)}\nCategory: ${saved.category}\nNote: ${saved.note}\n\n#${saved.id} | ${new Date(saved.created_at).toLocaleString('id-ID')}`);
    } catch (err) {
      console.error('[BOT] Error:', err.message);
      ctx.reply('Failed to save transaction. Please try again.');
    }
  });

  bot.launch().then(() => console.log('[BOT] Telegram bot is running')).catch((err) => console.error('[BOT] Failed to start:', err.message));
  process.once('SIGINT', () => bot?.stop('SIGINT'));
  process.once('SIGTERM', () => bot?.stop('SIGTERM'));
  return bot;
}

module.exports = { initBot, parseAmount, detectType, detectCategory, extractNote };
