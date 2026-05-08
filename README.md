# FINANCIAL TRACKER

**Track your income and expenses with BRUTAL precision.**

A personal finance tracker built with Brutalist design principles — black, white, bold, raw.

---

## 🎯 FEATURES

### CORE
- **Dashboard** — Monthly income/outcome summary with charts
- **Transaction Management** — Add, view, filter transactions
- **Telegram Integration** — Input expenses via Telegram bot (e.g., "ayam goreng 20k")
- **IDR/Rupiah Currency** — Native support for Indonesian Rupiah

### BRUTALISM DESIGN
- Pure black (#000000) background
- Pure white (#FFFFFF) text
- 6px solid white borders
- No shadows, no rounded corners
- Bold uppercase typography (Courier New, 900 weight)
- High contrast, raw, industrial

---

## 🛠️ TECH STACK

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + React Icons |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL |
| **Integration** | Telegram Bot API |
| **Design** | Brutalism (Black & White) |
| **Auth** | None (for now) |

---

## 📂 PROJECT STRUCTURE

```
personal-tracker/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # Summary cards + charts
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── TransactionList.jsx
│   │   │   └── Layout.jsx        # Header + nav
│   │   ├── App.jsx
│   │   ├── theme.js             # Brutalist theme config
│   │   └── main.jsx
│   └── package.json
│
├── backend/           # Node.js + Express + PostgreSQL + Telegram Bot
│   ├── routes/
│   ├── db/                     # PostgreSQL connection
│   ├── telegram/               # Bot parser
│   └── server.js
│
└── README.md
```

---

## 🚀 QUICK START

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

### Backend (Node.js + Express + PostgreSQL)

```bash
cd backend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 💰 USAGE

### Manual Entry (Web)
1. Open Dashboard
2. Click "ADD TRANSACTION"
3. Select type (IN/OUT)
4. Enter amount (IDR)
5. Select category
6. Add note
7. Save

### Telegram Bot Input
Send message to bot:
```
ayam goreng 20k
gaji 5jt
grab 50rb
```

**Auto-parsed:**
- Amount: `20k` → `20,000 IDR`
- Note: `ayam goreng`
- Category: Auto-detected (food, transport, salary, etc.)
- Type: Auto-detected (income/expense)

**Supported formats:**
- `20k` → 20,000
- `5jt` → 5,000,000
- `1,5M` → 1,500,000,000
- `15000` → 15,000

---

## 🎨 BRUTALISM DESIGN PRINCIPLES

This project embraces Brutalism:
- **No polish** — Raw, unrefined edges
- **High contrast** — Black backgrounds, white text
- **Thick borders** — 6px solid white borders everywhere
- **Bold typography** — Uppercase, heavy weights (900)
- **No decoration** — No shadows, no gradients, no rounded corners
- **Mobile-first** — Responsive, brutalist even on small screens

---

## 📊 DATABASE SCHEMA (PostgreSQL)

```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(3) CHECK (type IN ('in', 'out')),
  amount INTEGER NOT NULL,  -- in IDR
  category VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 TELEGRAM BOT SETUP

1. Message `@BotFather` on Telegram
2. Create bot: `/newbot`
3. Get token
4. Set webhook or use long polling
5. Configure backend with bot token

---

## ✅ STATUS

- [x] Frontend (React + Vite) — **COMPLETE**
- [x] Brutalist UI Design — **COMPLETE**
- [x] Dashboard with charts placeholders
- [x] Transaction form + list
- [x] Backend API (Node.js + Express) — **COMPLETE**
- [x] PostgreSQL integration — **COMPLETE**
- [x] Telegram bot parser — **COMPLETE**
- [ ] Real chart integration
- [ ] Deploy backend to Railway
- [ ] Setup Supabase PostgreSQL online

---

## 👤 CONTRIBUTOR

**PM-AI** — Project coordination + PM

---

## 📜 LICENSE

MIT License — Feel free to brutalize your own finances.

---

**BUILT WITH BRUTALITY. NO MERCY.**
