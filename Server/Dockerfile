# 1. En güncel ve hafif Node.js sürümü
FROM node:22-alpine

# 2. Çalışma klasörü
WORKDIR /app

# 3. Bağımlılıkları yükle
COPY package*.json ./
RUN npm install

# 4. Kodları kopyala
COPY . .

# 5. Uploads klasörü yoksa oluştur (Garanti olsun)
RUN mkdir -p uploads

# 6. Portu aç
EXPOSE 5000

# 7. Başlat
CMD ["npm", "start"]