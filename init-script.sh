#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Flax-ERP Geliştirme Ortamı Kurulumu${NC}"
echo "----------------------------"

# Docker kontrol
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null
then
    echo -e "${RED}Hata: Docker ve docker-compose kurulu değil. Lütfen önce bunları kurun.${NC}"
    exit 1
fi

# Backend için node_modules kontrol
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}Backend bağımlılıkları yükleniyor...${NC}"
    cd backend && npm install --legacy-peer-deps
    cd ..
fi

# Frontend için node_modules kontrol
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Frontend bağımlılıkları yükleniyor...${NC}"
    cd frontend && npm install --legacy-peer-deps
    cd ..
fi

echo -e "${BLUE}Docker container'ları başlatılıyor...${NC}"
docker-compose down
docker-compose up -d

echo -e "${GREEN}Flax-ERP geliştirme ortamı başlatıldı!${NC}"
echo -e "${GREEN}Frontend:${NC} http://localhost:8080"
echo -e "${GREEN}Backend API:${NC} http://localhost:3000"
echo -e "${GREEN}Test Kullanıcısı:${NC} admin@flaxerp.com / admin123"
echo ""
echo -e "${BLUE}Projeyi durdurmak için:${NC} docker-compose down"
