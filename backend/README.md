---
title: Personal Tracker API
emoji: 💰
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
license: mit
---

# Personal Tracker API

Node.js + Express backend for the Personal Tracker app.

## Features
- REST API for transactions, summary, categories, and health checks
- Telegram bot support
- SQLite storage for Hugging Face Spaces
- AI-powered Telegram message parsing

## Environment Variables
- `FREEMODEL_API_KEY` - required for AI parsing in Telegram bot
- `TELEGRAM_BOT_TOKEN` - optional, enables Telegram bot
- `PORT` - defaults to `7860`
- `NODE_ENV` - defaults to `production`
- `CORS_ORIGINS` - comma-separated allowed origins

## Run Locally
```bash
npm install
npm start
```

## API Endpoints
- GET /api/health
- GET /api/transactions
- POST /api/transactions
- DELETE /api/transactions/:id
- GET /api/summary
- GET /api/categories
