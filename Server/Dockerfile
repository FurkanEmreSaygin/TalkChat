# 1. Zemin: Node.js
FROM node:22-alpine

# 2. Çalışma Odası
WORKDIR /app

# 3. Hazırlık
COPY package*.json ./
RUN npm install

# 4. Kodlar
COPY . .

# 5. Kapı
EXPOSE 5000

# 6. Motor
CMD ["npm", "start"]