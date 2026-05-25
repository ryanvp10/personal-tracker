# FINANCIAL TRACKER

**Track your income and expenses with BRUTAL precision.**

A personal finance tracker built with Brutalist design principles — black, white, bold, raw. Now with Telegram bot integration and user authentication.



## 🎯 FEATURES

### CORE
- **Dashboard** — Monthly income/outcome summary with charts (pie, bar, line)
- **Transaction Management** — Add, view, filter, delete transactions
- **Guest Mode** — Track finances offline without login (localStorage)
- **User Auth** — Login with username/password (7-day persistent sessions)
- **Shared Tracker** — All logged-in users see the same transaction pool
- **Telegram Integration** — Input expenses via Telegram bot
- **Export** — PDF and Excel export with Brutalist styling
- **IDR/Rupiah Currency** — Native support (125.000 format)

### AUTH
- JWT-based authentication (7-day token expiry)
- Persistent login via localStorage
- Guest mode with localStorage-only transactions
- Default accounts seeded for personal use

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
| **Database** | SQLite (serverless-friendly) |
| **Auth** | JWT + bcrypt |
| **Integration** | Telegram Bot API (webhook) |
| **AI Parsing** | GPT-5.5 via freemodel.dev |
| **Frontend Deploy** | Netlify |
| **Backend Deploy** | Hugging Face Spaces |
| **Design** | Brutalism (Black & White) |

---

## 📂 PROJECT STRUCTURE

```
personal-tracker/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx       # Summary cards + charts
│   │   │   ├── TransactionForm.jsx # Add transaction form
│   │   │   ├── TransactionList.jsx # List with filters + export
│   │   │   ├── Layout.jsx          # Header + nav
│   │   │   └── LandingPage.jsx     # Home page
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state + login/logout
│   │   │   └── TransactionsContext.jsx # Transaction CRUD
│   │   ├── hooks/
│   │   │   └── useIsMobile.js      # Mobile detection
│   │   ├── theme.js                # Brutalist theme config
│   │   ├── mockData.js             # Sample transactions for guest
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/               # Node.js + Express + SQLite
│   ├── routes/
│   │   ├── auth.js         # Login + register
│   │   └── transactions.js # CRUD + filter endpoints
│   ├── db/
│   │   └── index.js        # SQLite connection + schema + seed
│   ├── telegram/
│   │   └── bot.js          # Telegram bot (webhook mode)
│   ├── auth.js             # JWT middleware (optional + required)
│   └── server.js
│
├── Dockerfile             # HF Spaces deployment
└── README.md
```

---

## 🚀 QUICK START

### Prerequisites
- Node.js 18+
- npm

### Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:7860
npm run dev
# Open http://localhost:5173
```

### Backend (Node.js + Express)

```bash
cd backend
npm install
cp .env.example .env
# Configure:
#   PORT=7860
#   TELEGRAM_BOT_TOKEN=your_bot_token
#   FREEMODEL_API_KEY=your_freemodel_key
#   JWT_SECRET=your_secret
#   CORS_ORIGINS=http://localhost:5173
npm start
# Runs on http://localhost:7860
```

---

## 💰 USAGE

### Guest Mode
1. Click "CONTINUE AS GUEST" on the login page
2. Start adding transactions immediately
3. Data stored in localStorage (per browser)

### Logged-In Mode
1. Click "LOGIN" on the landing page
2. Enter your credentials
3. Transactions sync across all logged-in devices
4. Partner can login with their own account

### Telegram Bot
Send message to your Telegram bot:
```
ayam goreng 20k
gaji 5jt
grab 50rb
listrik 100000
```

**Auto-parsed:**
- Amount: `20k` → `20,000 IDR`
- Note: `ayam goreng`
- Category: Auto-detected (food, transport, salary, bills, etc.)
- Type: Auto-detected (income/expense)

**Supported amount formats:**
| Input | Parsed |
|-------|--------|
| `20k` | 20,000 |
| `50rb` | 50,000 |
| `5jt` | 5,000,000 |
| `1.5M` | 1,500,000,000 |
| `15000` | 15,000 |

### Export Transactions
On the Transactions page:
- **PDF** — Download formatted PDF with summary footer
- **EXCEL** — Download styled XLSX with Brutalist formatting

---

## 🔌 API ENDPOINTS

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/transactions` | Optional | List transactions (empty for guests) |
| POST | `/api/transactions` | Optional | Create transaction |
| DELETE | `/api/transactions/:id` | Optional | Delete transaction |
| GET | `/api/summary` | Optional | Monthly summary |
| GET | `/api/categories` | Optional | Spending by category |
| POST | `/telegram-webhook` | No | Telegram webhook endpoint |

---

## 🎨 BRUTALISM DESIGN PRINCIPLES

- **No polish** — Raw, unrefined edges
- **High contrast** — Black backgrounds, white text
- **Thick borders** — 6px solid white borders everywhere
- **Bold typography** — Uppercase, heavy weights (900)
- **No decoration** — No shadows, no gradients, no rounded corners
- **Mobile-first** — Responsive, brutalist even on small screens

---

## 📊 DATABASE SCHEMA (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('in', 'out')),
  amount INTEGER NOT NULL CHECK(amount > 0),
  category TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 🤖 TELEGRAM BOT SETUP

1. Message `@BotFather` on Telegram
2. Create bot: `/newbot`
3. Get token
4. Set `TELEGRAM_BOT_TOKEN` in HF Space secrets
5. Bot auto-registers webhook on startup

**AI-powered parsing:**
- Uses GPT-5.5 via freemodel.dev for natural language understanding
- Falls back to regex-based parsing for simple formats
- Handles Bahasa Indonesia naturally

---

## 🌐 DEPLOYMENT

### Frontend → Netlify
- Auto-deploys from GitHub `main` branch
- Custom domain: `personaltrac.netlify.app`

### Backend → Hugging Face Spaces
- Docker-based deployment
- Secrets managed via HF Space settings:
  - `TELEGRAM_BOT_TOKEN`
  - `FREEMODEL_API_KEY`
  - `JWT_SECRET`
- Free tier (CPU basic)

---

## ✅ STATUS

- [x] Frontend (React + Vite) — **COMPLETE**
- [x] Brutalist UI Design — **COMPLETE**
- [x] Dashboard with charts (pie, bar, line) — **COMPLETE**
- [x] Transaction CRUD — **COMPLETE**
- [x] Guest mode (localStorage) — **COMPLETE**
- [x] User authentication (JWT) — **COMPLETE**
- [x] Backend API (Node.js + Express) — **COMPLETE**
- [x] SQLite database — **COMPLETE**
- [x] Telegram bot (webhook + AI parsing) — **COMPLETE**
- [x] PDF/Excel export — **COMPLETE**
- [x] Netlify deployment — **COMPLETE**
- [x] HF Spaces deployment — **COMPLETE**
- [ ] Partner Telegram ID linking
- [ ] PDF export via Telegram bot command

---

## 👤 CONTRIBUTOR

**PM-AI (Thom)** — Project coordination + PM
**Worker-AI (Alva)** — Implementation + deployment

---

## 📜 LICENSE

MIT License — Feel free to brutalize your own finances.

---

**BUILT WITH BRUTALITY. NO MERCY.**
