FROM node:16-alpine

WORKDIR /usr/src/app

# Gerekli araçları yükle
RUN apk add --no-cache curl wget bash

# Doğrudan root kullanıcısı ile çalışalım (geçici çözüm)
# Node.js kullanıcısını oluştur ve dizin izinlerini ayarla
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nextjs -u 1001 && \
#     chown -R nextjs:nodejs /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

# Script dosyalarını kopyala ve çalıştırılabilir yap
COPY entrypoint.sh fix-permissions.sh /usr/src/app/
RUN chmod +x /usr/src/app/entrypoint.sh /usr/src/app/fix-permissions.sh

COPY . .

# Node modülleri ve .next dizini için izinleri ayarla
RUN mkdir -p .next && \
    chmod -R 777 /usr/src/app/.next

# Root kullanıcısı kullanacağız (geçici çözüm)
# # USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
