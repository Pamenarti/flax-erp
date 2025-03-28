#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Renksiz

echo -e "${BLUE}Flax-ERP Ağ Kontrol Aracı${NC}"
echo "========================================"

echo -e "${YELLOW}[INFO] Docker konteyner durumları:${NC}"
docker ps

echo -e "\n${YELLOW}[INFO] Ağ bağlantıları:${NC}"
netstat -tulpn | grep -E '3000|3001|5432'

echo -e "\n${YELLOW}[INFO] Güvenlik duvarı durumu:${NC}"
ufw status

echo -e "\n${YELLOW}[INFO] Frontend konteynerinin IP adresi:${NC}"
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-frontend

echo -e "\n${YELLOW}[INFO] Backend konteynerinin IP adresi:${NC}"
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-backend

echo -e "\n${YELLOW}[INFO] Frontend logları:${NC}"
docker logs flax-erp-frontend | tail -n 20

echo -e "\n${YELLOW}[INFO] Portları test et:${NC}"
curl -I http://localhost:3000 2>/dev/null || echo -e "${RED}Frontend yerel olarak erişilebilir değil${NC}"
curl -I http://127.0.0.1:3000 2>/dev/null || echo -e "${RED}Frontend IP 127.0.0.1 üzerinden erişilebilir değil${NC}"
curl -I http://localhost:3001/api 2>/dev/null || echo -e "${RED}Backend API yerel olarak erişilebilir değil${NC}"

echo -e "\n${YELLOW}[ÇÖZÜM ÖNERİLERİ]${NC}"
echo -e "1. Konteynerler çalışmıyorsa: ./scripts/start.sh restart"
echo -e "2. Portlar bloke ediliyorsa: sudo ufw allow 3000/tcp && sudo ufw allow 3001/tcp"
echo -e "3. Host bağlama sorunu varsa: nuxt.config.js dosyasında server.host ayarını '0.0.0.0' olarak kontrol edin"
echo -e "4. Docker ağı sorunları için: docker-compose down && docker-compose up -d"

echo -e "\n${GREEN}[BİLGİ] Bu komutları root (sudo) yetkileriyle çalıştırmak gerekebilir${NC}"
