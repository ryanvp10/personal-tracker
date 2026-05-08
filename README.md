# Financial Tracker

A personal finance tracker built with Brutalist design principles, supporting IDR/Rupiah currency and Telegram bot input.

---

## 1. Project Title
**Financial Tracker**

---

## 2. Current Stack
- **Frontend**: React + Vite + React Icons
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

---

## 3. Currency
- Native support for **IDR/Rupiah**
- Auto-parsing of shorthand amount formats:
  - `k` = thousand (e.g., `20k` → 20,000 IDR)
  - `jt` = juta/million (e.g., `5jt` → 5,000,000 IDR)
  - `M` = million (e.g., `1.5M` → 1,500,000,000 IDR)
- Display format: `Rp.` prefix, dots as thousand separators (e.g., `Rp. 125.430`), no decimal places.

---

## 4. Features
### Telegram Bot Input
Send expense/income messages to the Telegram bot (e.g., `ayam goreng 20k`). The bot auto-parses inputs via a keyword dictionary to detect category, amount, and transaction type.

### Transaction List
Displays transactions with:
- Bold notes
- Category label
- Date in `DD-MM-YYYY` format

### Footer
Site-wide footer displays **RYAN SAPTA** (bold, uppercase).

### Navigation
No hamburger menu — full navigation is always visible.

### Brutalist Design
- Color scheme: Pure black (`#000000`) and white (`#FFFFFF`)
- 6px solid borders on all elements
- Zero border-radius (no rounded corners)
- No shadows or decorative elements

---

## 5. Deployment
- **Frontend**: Hosted on Netlify
- **Backend**: Planned deployment on Railway (Node.js + Express)
- **Database**: Hosted on Supabase PostgreSQL (free tier)

---

## 6. GitHub Repository
GitHub repo: [ryanvp10/personal-tracker](https://github.com/ryanvp10/personal-tracker)
