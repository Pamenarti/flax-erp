#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Servisleri Yeniden Başlatma${NC}"
echo "-------------------------------------------"

# Sadece tek bir servisi yeniden başlatma
restart_service() {
    local service=$1
    echo -e "${BLUE}$service servisini yeniden başlatma...${NC}"
    
    docker-compose stop $service
    docker-compose rm -f $service
    
    if [ "$service" == "backend" ] || [ "$service" == "frontend" ]; then
        # Eğer uygulama servisiyse rebuild edelim
        docker-compose build $service
    fi
    
    docker-compose up -d $service
    
    echo -e "${GREEN}$service servisi yeniden başlatıldı.${NC}"
    
    # Durumu kontrol et
    if [ "$service" == "backend" ]; then
        echo -e "${YELLOW}Backend servisinin hazır olması bekleniyor...${NC}"
        for i in {1..15}; do
            echo -n "."
            sleep 2
            if curl -s http://localhost:3000/health > /dev/null; then
                echo -e "\n${GREEN}Backend servisi hazır!${NC}"
                break
            fi
            if [ $i -eq 15 ]; then
                echo -e "\n${RED}Backend servisinin hazır olması zaman aşımına uğradı. Logları kontrol edin.${NC}"
            fi
        done
    elif [ "$service" == "frontend" ]; then
        echo -e "${YELLOW}Frontend servisinin hazır olması bekleniyor...${NC}"
        for i in {1..15}; do
            echo -n "."
            sleep 2
            if curl -s http://localhost:8080 > /dev/null; then
                echo -e "\n${GREEN}Frontend servisi hazır!${NC}"
                break
            fi
            if [ $i -eq 15 ]; then
                echo -e "\n${RED}Frontend servisinin hazır olması zaman aşımına uğradı. Logları kontrol edin.${NC}"
            fi
        done
    fi
}

# Komut satırı parametresi kontrolü
if [ "$1" == "backend" ] || [ "$1" == "frontend" ] || [ "$1" == "postgres" ]; then
    restart_service $1
else
    echo -e "${YELLOW}Tüm servisleri yeniden başlatmak istediğinizden emin misiniz? [y/N]${NC}"
    read response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        docker-compose down
        docker-compose up -d
        echo -e "${GREEN}Tüm servisler yeniden başlatıldı.${NC}"
    else
        echo -e "${BLUE}Yeniden başlatma iptal edildi.${NC}"
        echo -e "Belirli bir servisi yeniden başlatmak için:"
        echo -e "  ./restart-services.sh backend"
        echo -e "  ./restart-services.sh frontend"
        echo -e "  ./restart-services.sh postgres"
    fi
fi
