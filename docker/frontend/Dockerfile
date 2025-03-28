FROM node:16-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY ./package*.json ./
RUN npm install

# Kaynak dosyaları kopyala
COPY . .

# Ortam değişkenlerini ayarla
ENV HOST=0.0.0.0
ENV PORT=3000
ENV API_URL=http://88.218.130.67:3001/api

# Uygulamayı derle
RUN npm run build

# Portu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
