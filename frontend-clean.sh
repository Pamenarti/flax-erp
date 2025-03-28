#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Frontend Temizleme İşlemi${NC}"
echo "----------------------------"

# Frontend konteynerini durdur
echo -e "${YELLOW}Frontend konteyneri durduruluyor...${NC}"
docker-compose stop frontend

# Mevcut konteyneri kaldır
echo -e "${YELLOW}Frontend konteyneri kaldırılıyor...${NC}"
docker-compose rm -f frontend

# Frontend next cache volume'unu temizle
echo -e "${YELLOW}Frontend cache volume temizleniyor...${NC}"
docker volume rm -f flax-erp_frontend_next_cache

# Yeni volume oluştur
echo -e "${YELLOW}Yeni cache volume oluşturuluyor...${NC}"
docker volume create flax-erp_frontend_next_cache

# Yeniden başlat
echo -e "${YELLOW}Frontend konteyneri yeniden oluşturuluyor...${NC}"
docker-compose up -d --build frontend

echo -e "${GREEN}İşlem tamamlandı!${NC}"
echo -e "${YELLOW}Frontend servisi yeniden başlatılıyor. Lütfen bekleyin...${NC}"

# Frontend konteyneri durumunu göster
echo -e "\n${BLUE}Frontend konteyner durumu:${NC}"
sleep 5
docker ps -f name=flax-erp-frontend

echo -e "\n${YELLOW}Konteyner loglarını takip etmek için:${NC}"
echo -e "${BLUE}docker logs -f flax-erp-frontend${NC}"
