FROM node:18-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --production

COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 7860

CMD ["node", "server.js"]
