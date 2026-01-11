# 1. Zemin: Node.js 
FROM node:22-alpine

# 2. Çalışma Odası
WORKDIR /app

# 3. Paket Yükleme
COPY package*.json ./
RUN npm install

# 4. Kodları Kopyala
COPY . .

# 5. Kapı (Vite default portu)
EXPOSE 5173

# 6. Başlat
CMD ["npm", "run", "dev", "--", "--host"]