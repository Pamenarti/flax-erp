FROM node:16-alpine

WORKDIR /app

# Bağımlılıkları kopyala ve yükle
COPY ./package*.json ./
RUN npm install

# Kaynak dosyaları kopyala
COPY . .

# Ortam değişkenlerini ayarla
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

# Uygulamayı derle
RUN npm run build

# Portu aç
EXPOSE 3001

# Uygulamayı başlat
CMD ["node", "dist/main"]
