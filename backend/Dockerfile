FROM node:16-alpine

WORKDIR /usr/src/app

# Gerekli araçları yükle
RUN apk add --no-cache curl wget

COPY package*.json ./

# Daha ayrıntılı çıktı için verbose flag eklendi
RUN npm install --legacy-peer-deps

# TypeScript konfigürasyon dosyalarını kopyalayalım
COPY tsconfig*.json ./

# Diğer tüm kodu kopyala
COPY . .

# Build işlemi 
RUN npm run build

EXPOSE 3000

# Sağlık kontrol scripti ekleyelim
COPY health-check.sh /health-check.sh
RUN chmod +x /health-check.sh

CMD ["npm", "run", "start:prod"]
