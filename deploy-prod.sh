#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# .env.production dosyasından değişkenleri yükle
if [ -f .env.production ]; then
    export $(grep -v '^#' .env.production | xargs)
else
    echo -e "${RED}Hata: .env.production dosyası bulunamadı.${NC}"
    exit 1
fi

SERVER_IP=${SERVER_IP:-88.218.130.67}
SSH_USER=${SSH_USER:-root}
REMOTE_DIR=${REMOTE_DIR:-/home/flax-erp}

echo -e "${BLUE}Flax-ERP Live Test Ortamını ${SERVER_IP} Sunucusuna Deploy Etme${NC}"
echo "----------------------------"

# SSH kontrolü
echo -e "${BLUE}Sunucu bağlantısı test ediliyor...${NC}"
if ! ssh -o ConnectTimeout=5 ${SSH_USER}@${SERVER_IP} "echo 'Bağlantı başarılı'"; then
    echo -e "${RED}Hata: Sunucuya bağlanılamadı. SSH anahtarınızın doğru olduğundan emin olun.${NC}"
    exit 1
fi

# Gerekli dizinleri oluştur
echo -e "${BLUE}Sunucuda gerekli dizinleri oluşturma...${NC}"
ssh ${SSH_USER}@${SERVER_IP} "mkdir -p ${REMOTE_DIR}"

# Gerekli dosyaları sunucuya kopyalama
echo -e "${BLUE}Proje dosyalarını sunucuya kopyalanıyor...${NC}"
scp -r ./backend ${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/
scp -r ./frontend ${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/
scp docker-compose.prod.yml ${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/docker-compose.yml
scp .env.production ${SSH_USER}@${SERVER_IP}:${REMOTE_DIR}/.env

# Docker işlemleri
echo -e "${BLUE}Sunucuda Docker konteynerlerini başlatma...${NC}"
ssh ${SSH_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && docker-compose down && docker-compose up -d"

# Deployment sonrası kontrol
echo -e "${BLUE}Servisler kontrol ediliyor...${NC}"
sleep 10
ssh ${SSH_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && docker-compose ps"

echo -e "${GREEN}Deploy işlemi tamamlandı!${NC}"
echo -e "${GREEN}Frontend:${NC} http://${SERVER_IP}:8080"
echo -e "${GREEN}Backend API:${NC} http://${SERVER_IP}:3000"
echo -e "${GREEN}Test Kullanıcısı:${NC} admin@flaxerp.com / admin123"
echo ""
echo -e "${YELLOW}ÖNEMLİ:${NC} Live test ortamı sadece test amaçlıdır. Gerçek verileri kullanmayın."
