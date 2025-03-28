#!/bin/bash

# Renkli çıktı için değişkenler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo ve bilgi yazdırma
print_logo() {
    echo -e "${BLUE}"
    echo "  ______                    ______ _____  _____  "
    echo " |  ____|                  |  ____|  __ \|  __ \ "
    echo " | |__ | | __ _  __  __    | |__  | |__) | |__) |"
    echo " |  __|| |/ _\` | \ \/ /    |  __| |  _  /|  ___/ "
    echo " | |   | | (_| |  >  <     | |____| | \ \| |     "
    echo " |_|   |_|\__,_| /_/\_\    |______|_|  \_\_|     "
    echo -e "${NC}"
    echo -e "${GREEN}Flax-ERP Yönetim Aracı${NC}"
    echo -e "${YELLOW}------------------------------${NC}"
}

# Yardım mesajı
show_help() {
    print_logo
    echo -e "Kullanım: $0 [komut]"
    echo -e ""
    echo -e "Komutlar:"
    echo -e "  ${GREEN}setup${NC}     - Geliştirme ortamını kurar"
    echo -e "  ${GREEN}start${NC}     - Tüm servisleri başlatır"
    echo -e "  ${GREEN}stop${NC}      - Tüm servisleri durdurur"
    echo -e "  ${GREEN}restart${NC}   - Tüm servisleri yeniden başlatır"
    echo -e "  ${GREEN}status${NC}    - Çalışan servislerin durumunu gösterir"
    echo -e "  ${GREEN}logs${NC}      - Tüm servislerin loglarını gösterir"
    echo -e "  ${GREEN}frontend${NC}  - Sadece frontend servisini yeniden başlatır"
    echo -e "  ${GREEN}backend${NC}   - Sadece backend servisini yeniden başlatır"
    echo -e "  ${GREEN}db${NC}        - Veritabanı servisini yönetir"
    echo -e "  ${GREEN}shell${NC}     - İstenen servis için shell açar (örn: $0 shell backend)"
    echo -e "  ${GREEN}help${NC}      - Bu yardım mesajını gösterir"
    echo -e ""
}

# Ortam kontrolü
check_environment() {
    echo -e "${BLUE}Gerekli araçlar kontrol ediliyor...${NC}"
    
    if ! [ -x "$(command -v docker)" ]; then
        echo -e "${RED}Hata: Docker kurulu değil.${NC}"
        echo -e "Lütfen Docker'ı yükleyin: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! [ -x "$(command -v docker-compose)" ]; then
        echo -e "${RED}Hata: Docker Compose kurulu değil.${NC}"
        echo -e "Lütfen Docker Compose'u yükleyin: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo -e "${GREEN}Tüm gerekli araçlar kurulu!${NC}"
}

# Setup işlemi
setup() {
    print_logo
    check_environment
    
    echo -e "${BLUE}Flax-ERP geliştirme ortamı kuruluyor...${NC}"
    
    # .env dosyasını oluştur (eğer yoksa)
    if [ ! -f .env ]; then
        echo -e "${YELLOW}.env dosyası oluşturuluyor...${NC}"
        cat > .env << EOF
DB_PASSWORD=flaxpassword
JWT_SECRET=flaxsecretkey
NODE_ENV=development
EOF
    fi
    
    # Docker imajlarını oluştur ve servisleri başlat
    echo -e "${YELLOW}Docker imajları oluşturuluyor...${NC}"
    docker-compose build
    
    echo -e "${GREEN}Kurulum tamamlandı!${NC}"
    echo -e "${YELLOW}Servisleri başlatmak için: $0 start${NC}"
}

# Servisleri başlat
start() {
    print_logo
    echo -e "${BLUE}Flax-ERP servisleri başlatılıyor...${NC}"
    docker-compose up -d
    echo -e "${GREEN}Tüm servisler başlatıldı!${NC}"
    echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
    echo -e "${YELLOW}Backend: http://localhost:3001${NC}"
    echo -e "${YELLOW}Adminer: http://localhost:8080${NC}"
}

# Servisleri durdur
stop() {
    print_logo
    echo -e "${BLUE}Flax-ERP servisleri durduruluyor...${NC}"
    docker-compose down
    echo -e "${GREEN}Tüm servisler durduruldu!${NC}"
}

# Servisleri yeniden başlat
restart() {
    print_logo
    echo -e "${BLUE}Flax-ERP servisleri yeniden başlatılıyor...${NC}"
    docker-compose restart
    echo -e "${GREEN}Tüm servisler yeniden başlatıldı!${NC}"
}

# Servislerin durumunu göster
status() {
    print_logo
    echo -e "${BLUE}Flax-ERP servisleri durumu:${NC}"
    docker-compose ps
}

# Servislerin loglarını göster
logs() {
    print_logo
    echo -e "${BLUE}Flax-ERP servisleri logları:${NC}"
    docker-compose logs -f
}

# Belirli bir servis için shell aç
open_shell() {
    if [ -z "$1" ]; then
        echo -e "${RED}Hata: Servis adı belirtilmedi. Örnek: $0 shell backend${NC}"
        exit 1
    fi
    
    print_logo
    echo -e "${BLUE}$1 servisi için shell açılıyor...${NC}"
    docker-compose exec $1 /bin/sh
}

# Ana komut kontrolü
case "$1" in
    setup)
        setup
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    frontend)
        print_logo
        echo -e "${BLUE}Frontend servisi yeniden başlatılıyor...${NC}"
        docker-compose restart frontend
        echo -e "${GREEN}Frontend servisi yeniden başlatıldı!${NC}"
        ;;
    backend)
        print_logo
        echo -e "${BLUE}Backend servisi yeniden başlatılıyor...${NC}"
        docker-compose restart backend
        echo -e "${GREEN}Backend servisi yeniden başlatıldı!${NC}"
        ;;
    db)
        print_logo
        echo -e "${BLUE}Veritabanı servisi yeniden başlatılıyor...${NC}"
        docker-compose restart db
        echo -e "${GREEN}Veritabanı servisi yeniden başlatıldı!${NC}"
        ;;
    shell)
        open_shell $2
        ;;
    help|*)
        show_help
        ;;
esac

exit 0
