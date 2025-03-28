# Flax-ERP Kurulum Kılavuzu

Bu kılavuz, Flax-ERP projesinin geliştirme ve çalıştırma ortamının kurulumunu anlatmaktadır.

## Teknoloji Yığını

Flax-ERP projesi aşağıdaki teknolojileri kullanmaktadır:

- **Backend**: Node.js + NestJS (TypeScript)
- **Frontend**: React + Next.js
- **Veritabanı**: PostgreSQL
- **Mimari**: Mikroservis mimarisi
- **Gerçek Zamanlı İletişim**: Socket.io

## Ön Gereksinimler

Aşağıdaki araçların sisteminizde yüklü olması gerekmektedir:

- Node.js (v14.x veya üzeri)
- npm (v6.x veya üzeri)
- PostgreSQL (v12.x veya üzeri)
- Docker ve Docker Compose (opsiyonel, ancak önerilir)
- Git

## Backend Kurulumu (NestJS)

1. NestJS CLI'ı global olarak yükleyin:
   ```bash
   npm i -g @nestjs/cli
   ```

2. Backend projesini oluşturun:
   ```bash
   cd /home/agrotest2/flax-erp
   nest new backend
   ```
   Paket yöneticisi olarak npm'i seçin.

3. PostgreSQL ve gerekli modülleri yükleyin:
   ```bash
   cd backend
   npm install @nestjs/typeorm typeorm pg
   npm install @nestjs/config
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt
   npm install @nestjs/websockets @nestjs/platform-socket.io
   ```

4. Mikroservis mimarisi için gerekli modülleri yükleyin:
   ```bash
   npm install @nestjs/microservices
   ```

## Frontend Kurulumu (Next.js)

1. Next.js projesini oluşturun:
   ```bash
   cd /home/agrotest2/flax-erp
   npx create-next-app frontend
   ```

2. Gerekli paketleri yükleyin:
   ```bash
   cd frontend
   npm install axios socket.io-client
   npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
   ```

## Docker ile Geliştirme Ortamı

1. Docker Compose dosyası oluşturun:
   ```yaml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:13
       container_name: flax-erp-postgres
       environment:
         POSTGRES_USER: ${DB_USER:-postgres}
         POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
         POSTGRES_DB: ${DB_NAME:-flaxerp}
       ports:
         - "${DB_PORT:-5432}:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
     backend:
       build:
         context: ./backend
       container_name: flax-erp-backend
       depends_on:
         - postgres
       environment:
         - DATABASE_HOST=postgres
         - DATABASE_PORT=5432
         - DATABASE_USER=${DB_USER:-postgres}
         - DATABASE_PASSWORD=${DB_PASSWORD:-postgres}
         - DATABASE_NAME=${DB_NAME:-flaxerp}
         - JWT_SECRET=${JWT_SECRET:-supersecret}
       ports:
         - "${BACKEND_PORT:-3000}:3000"
       volumes:
         - ./backend:/usr/src/app
         - /usr/src/app/node_modules
   
     frontend:
       build:
         context: ./frontend
       container_name: flax-erp-frontend
       depends_on:
         - backend
       ports:
         - "${FRONTEND_PORT:-8080}:3000"
       volumes:
         - ./frontend:/usr/src/app
         - /usr/src/app/node_modules
   
   volumes:
     postgres_data:
   ```

2. Docker Compose ile projeyi başlatın:
   ```bash
   docker-compose up -d
   ```

## Projeyi Çalıştırma (Docker Olmadan)

### Backend (NestJS)

1. Backend servisini başlatın:
   ```bash
   cd /home/agrotest2/flax-erp/backend
   npm run start:dev
   ```

### Frontend (Next.js)

1. Frontend uygulamasını başlatın:
   ```bash
   cd /home/agrotest2/flax-erp/frontend
   npm run dev
   ```

## Veritabanı Konfigürasyonu

1. PostgreSQL'i kurun ve başlatın
2. Yeni bir veritabanı oluşturun:
   ```sql
   CREATE DATABASE flaxerp;
   ```

3. Backend için `.env` dosyasını oluşturun:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=postgres
   DATABASE_NAME=flaxerp
   JWT_SECRET=supersecret
   ```

## Sonraki Adımlar

Temel kurulumu tamamladıktan sonra, sıradaki adımlar:

1. Kullanıcı Yönetimi ve Kimlik Doğrulama modülünün geliştirilmesi
2. Yetkilendirme ve İzin Sistemi'nin geliştirilmesi
3. Çok Dilli Destek altyapısının kurulması
4. Diğer temel modüllerin sırasıyla geliştirilmesi
