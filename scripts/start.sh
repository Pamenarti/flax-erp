#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Renksiz

# Logo yazdırma fonksiyonu
print_logo() {
    echo -e "${GREEN}"
    echo "  _______ _        __    __      ______ _____  _____  "
    echo " |__   __| |      / _|  / /     |  ____|  __ \|  __ \ "
    echo "    | |  | |     | |_  / /_     | |__  | |__) | |__) |"
    echo "    | |  | |     |  _|/ / __|   |  __| |  _  /|  ___/ "
    echo "    | |  | |____ | | / / |_ _   | |____| | \ \| |     "
    echo "    |_|  |______||_|/_/ \__(_)  |______|_|  \_\_|     "
    echo -e "${NC}"
    echo -e "${BLUE}Flax-ERP Yönetim Sistemi${NC}"
    echo "========================================"
}

# Yardım mesajı
show_help() {
    print_logo
    echo -e "${YELLOW}Kullanım:${NC} $0 [komut]"
    echo ""
    echo "Komutlar:"
    echo -e "  ${GREEN}setup${NC}     - Geliştirme ortamını kurar (npm bağımlılıkları vb.)"
    echo -e "  ${GREEN}start${NC}     - Tüm servisleri başlatır"
    echo -e "  ${GREEN}stop${NC}      - Tüm servisleri durdurur"
    echo -e "  ${GREEN}restart${NC}   - Tüm servisleri yeniden başlatır"
    echo -e "  ${GREEN}status${NC}    - Servis durumlarını gösterir"
    echo -e "  ${GREEN}logs${NC}      - Servis loglarını gösterir"
    echo -e "  ${GREEN}backend${NC}   - Sadece backend servisini başlatır"
    echo -e "  ${GREEN}frontend${NC}  - Sadece frontend servisini başlatır"
    echo -e "  ${GREEN}db${NC}        - Sadece veritabanı servisini başlatır"
    echo -e "  ${GREEN}install-deps${NC} - Tüm node_modules bağımlılıklarını yükler"
    echo ""
    echo "Örnek: ./scripts/start.sh start"
}

# Ortam değişkenleri dosyasını kontrol et ve oluştur
check_env_file() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}[INFO] .env dosyası bulunamadı, oluşturuluyor...${NC}"
        cat > .env << EOF
DB_PASSWORD=flaxpassword
JWT_SECRET=flax-erp-jwt-secret-key-change-in-production
NODE_ENV=production
EOF
        echo -e "${GREEN}[SUCCESS] .env dosyası oluşturuldu${NC}"
    fi
}

# Servisleri başlat
start_services() {
    echo -e "${YELLOW}[INFO] Servisler başlatılıyor...${NC}"
    docker-compose up -d
    echo -e "${GREEN}[SUCCESS] Tüm servisler başlatıldı${NC}"
    echo -e "${BLUE}[INFO] Frontend: http://88.218.130.67:3000${NC}"
    echo -e "${BLUE}[INFO] Backend API: http://88.218.130.67:3001/api${NC}"
    echo -e "${BLUE}[INFO] API Dokümantasyonu: http://88.218.130.67:3001/api/docs${NC}"
}

# Servisleri durdur
stop_services() {
    echo -e "${YELLOW}[INFO] Servisler durduruluyor...${NC}"
    docker-compose down
    echo -e "${GREEN}[SUCCESS] Tüm servisler durduruldu${NC}"
}

# Servisleri yeniden başlat
restart_services() {
    echo -e "${YELLOW}[INFO] Servisler yeniden başlatılıyor...${NC}"
    docker-compose restart
    echo -e "${GREEN}[SUCCESS] Tüm servisler yeniden başlatıldı${NC}"
}

# Servis durumlarını göster
show_status() {
    echo -e "${YELLOW}[INFO] Servis durumları:${NC}"
    docker-compose ps
}

# Logları göster
show_logs() {
    echo -e "${YELLOW}[INFO] Servis logları gösteriliyor...${NC}"
    docker-compose logs -f
}

# Belirli bir servisi başlat
start_service() {
    service_name=$1
    echo -e "${YELLOW}[INFO] $service_name servisi başlatılıyor...${NC}"
    docker-compose up -d $service_name
    echo -e "${GREEN}[SUCCESS] $service_name servisi başlatıldı${NC}"
}

# Tüm NPM bağımlılıklarını yükle
install_dependencies() {
    print_logo
    echo -e "${YELLOW}[INFO] Tüm node_modules bağımlılıkları yükleniyor...${NC}"
    
    # Frontend bağımlılıkları
    echo -e "${YELLOW}[INFO] Frontend bağımlılıkları yükleniyor...${NC}"
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}[SUCCESS] Frontend bağımlılıkları yüklendi${NC}"
    else
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
    fi
    
    # Backend bağımlılıkları
    echo -e "${YELLOW}[INFO] Backend bağımlılıkları yükleniyor...${NC}"
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        echo -e "${GREEN}[SUCCESS] Backend bağımlılıkları yüklendi${NC}"
    else
        echo -e "${RED}[ERROR] Backend dizini bulunamadı${NC}"
    fi
    
    # Modül bağımlılıkları
    echo -e "${YELLOW}[INFO] Modül bağımlılıkları kontrol ediliyor...${NC}"
    if [ -d "modules" ]; then
        for module_dir in modules/*/; do
            if [ -f "${module_dir}package.json" ]; then
                echo -e "${YELLOW}[INFO] ${module_dir} bağımlılıkları yükleniyor...${NC}"
                cd "${module_dir}"
                npm install
                cd ../../
                echo -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"
            fi
        done
    fi
    
    echo -e "${GREEN}[SUCCESS] Tüm bağımlılıklar yüklendi${NC}"
}

# Geliştirme ortamını kur
setup_dev_environment() {
    print_logo
    echo -e "${YELLOW}[INFO] Geliştirme ortamı kuruluyor...${NC}"
    
    # Docker kontrol
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}[ERROR] Docker ve Docker Compose yüklü değil${NC}"
        echo -e "${YELLOW}Docker kurulumu için: https://docs.docker.com/get-docker/${NC}"
        echo -e "${YELLOW}Docker Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    
    # .env dosyasını kontrol et
    check_env_file
    
    # Tüm bağımlılıkları yükle
    install_dependencies
    
    # Docker imajlarını oluştur
    echo -e "${YELLOW}[INFO] Docker imajları oluşturuluyor...${NC}"
    docker-compose build
    
    echo -e "${GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"
    echo -e "${BLUE}[INFO] Servisleri başlatmak için: ./scripts/start.sh start${NC}"
}

# Ana fonksiyon
main() {
    # Logo yazdır
    print_logo
    
    # Parametre kontrolü
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi
    
    # Komut işleme
    case "$1" in
        help)
            show_help
            ;;
        setup)
            setup_dev_environment
            ;;
        start)
            check_env_file
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        backend)
            start_service backend
            ;;
        frontend)
            start_service frontend
            ;;
        db)
            start_service db
            ;;
        install-deps)
            install_dependencies
            ;;
        *)
            echo -e "${RED}[ERROR] Bilinmeyen komut: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Scripti çalıştır
main "$@"
