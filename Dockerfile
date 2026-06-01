FROM node:18-alpine

WORKDIR /app

COPY backend/package.json ./
RUN npm install --production

COPY backend/ ./backend/

WORKDIR /app/backend

# Create data directory for SQLite (persistent on HF Spaces)
RUN mkdir -p /data

EXPOSE 7860

CMD ["node", "server.js"]
