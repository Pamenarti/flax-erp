FROM node:18-alpine

WORKDIR /app

# Bağımlılıkları kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Kaynak kodu kopyala
COPY . .

# Geliştirme modunda çalıştır
CMD ["npm", "run", "dev"]

# Prod build için:
# RUN npm run build
# CMD ["npm", "start"]
