#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Flax-ERP Konteyner Durumu${NC}"
echo "----------------------------"

# Tüm konteynerleri kontrol et
echo -e "${YELLOW}Konteyner Durumları:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Health check durumlarını kontrol et
echo -e "\n${YELLOW}Sağlık Durumları:${NC}"
for container in flax-erp-postgres flax-erp-backend flax-erp-frontend; do
    if [ "$(docker ps -q -f name=$container)" ]; then
        health=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}No health check{{end}}' $container)
        echo -ne "  $container: "
        
        case "$health" in
            "healthy")
                echo -e "${GREEN}Sağlıklı${NC}"
                ;;
            "unhealthy")
                echo -e "${RED}Sağlıksız${NC}"
                echo -e "    Son kontroller:"
                docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' $container | tail -n 3 | sed 's/^/    /'
                ;;
            "starting")
                echo -e "${YELLOW}Başlatılıyor${NC}"
                echo -e "    Son kontroller:"
                docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' $container | tail -n 3 | sed 's/^/    /'
                ;;
            *)
                echo -e "${YELLOW}$health${NC}"
                ;;
        esac
    else
        echo -e "  $container: ${RED}Çalışmıyor${NC}"
    fi
done

# Servis erişilebilirliğini kontrol et
echo -e "\n${YELLOW}Servis Erişilebilirliği:${NC}"
echo -ne "  Backend API (health): "
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}Erişilebilir${NC}"
else
    echo -e "${RED}Erişilemiyor${NC}"
fi

echo -ne "  Frontend: "
if curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}Erişilebilir${NC}"
else
    echo -e "${RED}Erişilemiyor${NC}"
fi

# Log kontrolü seçeneği sunalım
echo -e "\n${YELLOW}Son Logları Görüntülemek İçin:${NC}"
echo -e "  Backend: ${BLUE}docker logs flax-erp-backend --tail 50${NC}"
echo -e "  Frontend: ${BLUE}docker logs flax-erp-frontend --tail 50${NC}"
echo -e "  Postgres: ${BLUE}docker logs flax-erp-postgres --tail 50${NC}"

echo -e "\n${YELLOW}Manuel Yeniden Başlatma Komutları:${NC}"
echo -e "  Backend: ${BLUE}docker-compose restart backend${NC}"
echo -e "  Frontend: ${BLUE}docker-compose restart frontend${NC}"
echo -e "  Postgres: ${BLUE}docker-compose restart postgres${NC}"
echo -e "  Tüm Servisler: ${BLUE}docker-compose restart${NC}"
