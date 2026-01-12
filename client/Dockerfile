# 1. Node.js 22 (Uyumlu sürüm)
FROM node:22-alpine

# 2. Çalışma klasörü
WORKDIR /app

# 3. Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# 4. Kodları kopyala
COPY . .

# 5. Portu aç
EXPOSE 5173

# 6. Başlat (--host önemli!)
CMD ["npm", "run", "dev", "--", "--host"]