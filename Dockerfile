FROM node:22-alpine
WORKDIR /app

# คัดลอกและติดตั้งฝั่ง client
COPY client/package*.json ./client/
RUN cd client && npm install --include=optional

# คัดลอกโค้ดทั้งหมดและ Build client
COPY client/ ./client/
RUN cd client && npm run build

# ติดตั้งฝั่ง server
COPY server/package*.json ./server/
RUN cd server && npm install

# คัดลอกโค้ด server ที่เหลือ
COPY server/ ./server/

EXPOSE 3000
CMD ["node", "server/server.js"]