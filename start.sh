#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SERVER_IP="localhost"
FRONTEND_PORT="8080"
BACKEND_PORT="3000"
REMOTE_SERVER_IP="88.218.130.67"
SSH_USER="root"
REMOTE_DIR="/home/flax-erp"

# Banner göster
show_banner() {
    echo -e "${BLUE}"
    echo "  ______   __                                 ______   _______   _______  "
    echo " /      \ |  \                               /      \ |       \ |       \ "
    echo "|  $$$$$$\| $$  ______   __    __           |  $$$$$$\| $$$$$$$\| $$$$$$$\\"
    echo "| $$_  \$$| $$ |      \ |  \  /  \  ______  | $$__| $$| $$__/ $$| $$__| $$"
    echo "| $$ \    | $$  \$$$$$$\ \$$\/  $$ |      \ | $$    $$| $$    $$| $$    $$"
    echo "| $$$$    | $$ /      $$  >$$  $$   \$$$$$$\| $$$$$$$$| $$$$$$$\| $$$$$$$\\"
    echo "| $$      | $$|  $$$$$$$ /  $$$$\           | $$  | $$| $$__/ $$| $$      "
    echo "| $$      | $$ \$$    $$|  $$ \$$\          | $$  | $$| $$    $$| $$      "
    echo " \$$       \$$  \$$$$$$$ \$$   \$$           \$$   \$$ \$$$$$$$  \$$      "
    echo -e "${NC}"
    echo -e "${CYAN}Flax-ERP Yönetim Aracı${NC}"
    echo -e "Sürüm: 1.0.0"
    echo -e "Çalışma Ortamı: ${SERVER_IP}"
    echo -e "-------------------------------------------"
}

# Yardım mesajını göster
show_help() {
    echo -e "${YELLOW}Kullanım:${NC}"
    echo -e "  ./start.sh [KOMUT]"
    echo
    echo -e "${YELLOW}Temel Komutlar:${NC}"
    echo -e "  start         Uygulamayı başlatır"
    echo -e "  stop          Uygulamayı durdurur"
    echo -e "  restart       Uygulamayı yeniden başlatır"
    echo -e "  status        Sistem durumunu gösterir"
    echo -e "  logs          Sistemin loglarını gösterir"
    echo
    echo -e "${YELLOW}Gelişmiş Komutlar:${NC}"
    echo -e "  diag          Detaylı teşhis bilgisi verir"
    echo -e "  rebuild       Sistemi tamamen yeniden oluşturur"
    echo -e "  service       Belirli bir servisi yönetir (kullanım: service [backend|frontend|postgres] [start|stop|restart])"
    echo -e "  fix           Yaygın sorunları otomatik olarak çözer"
    echo -e "  clean         Frontend cache temizliği yapar"
    echo -e "  deploy        Projeyi uzak sunucuya deploy eder"
    echo -e "  remote        Uzak sunucuda komut çalıştırır (kullanım: remote [KOMUT])"
    echo -e "  server        Uzak sunucu durumunu kontrol eder"
    echo -e "  fix-frontend  Frontend servisi izin sorunlarını çözer"
    echo
    echo -e "${YELLOW}Örnekler:${NC}"
    echo -e "  ./start.sh start"
    echo -e "  ./start.sh service backend restart"
    echo -e "  ./start.sh deploy"
    echo -e "  ./start.sh remote status"
}

# Docker kurulu mu kontrol et
check_docker() {
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Hata: Docker ve docker-compose kurulu değil. Lütfen önce bunları kurun.${NC}"
        exit 1
    fi
}

# Port kontrolü yap
check_port() {
    local ip=$1
    local port=$2
    local name=$3
    
    echo -ne "  $name Port ($port): "
    nc -z -w 2 $ip $port &>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Açık${NC}"
    else
        echo -e "${RED}Kapalı${NC}"
    fi
}

# HTTP durum koduna göre renkli durum mesajı 
status_color() {
    local status=$1
    if [[ "$status" == "200" ]]; then
        echo -e "${GREEN}Çalışıyor (200 OK)${NC}"
    elif [[ "$status" == "offline" ]]; then
        echo -e "${RED}Çalışmıyor (erişilemiyor)${NC}"
    else
        echo -e "${YELLOW}Kısmen çalışıyor (HTTP $status)${NC}"
    fi
}

# Konteyner sağlık durumu kontrolü
check_container_health() {
    local container=$1
    local status=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}No health check{{end}}' $container 2>/dev/null || echo "unknown")
    
    if [ "$status" == "healthy" ]; then
        echo -e "${GREEN}Sağlıklı${NC}"
    elif [ "$status" == "starting" ]; then
        # Eğer başlangıç aşamasındaysa, son kontrol loglarını göster
        echo -e "${YELLOW}Başlatılıyor${NC}"
        echo -e "  Son kontrol: $(docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' $container 2>/dev/null | tail -n 1)"
    elif [ "$status" == "unhealthy" ]; then
        echo -e "${RED}Sağlıksız${NC}"
        echo -e "  Son kontrol: $(docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' $container 2>/dev/null | tail -n 1)"
    else
        echo -e "${YELLOW}Durum: $status${NC}"
    fi
}

# Sistem durumunu kontrol et
check_status() {
    echo -e "${BLUE}Sistem durumu kontrol ediliyor...${NC}"
    
    # Docker servisleri kontrolü
    echo -e "${YELLOW}Docker servisleri:${NC}"
    docker-compose ps
    
    # Port kontrolü
    echo -e "\n${YELLOW}Port durumları:${NC}"
    check_port "localhost" ${FRONTEND_PORT} "Frontend"
    check_port "localhost" ${BACKEND_PORT} "Backend"
    
    # HTTP kontrolü
    echo -e "\n${YELLOW}HTTP servis durumları:${NC}"
    local frontend_status=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://${SERVER_IP}:${FRONTEND_PORT} 2>/dev/null || echo "offline")
    local backend_status=$(curl -s -o /dev/null -w "%{http_code}" -m 5 http://${SERVER_IP}:${BACKEND_PORT}/health 2>/dev/null || echo "offline")
    
    echo -e "  Frontend (${SERVER_IP}:${FRONTEND_PORT}): $(status_color $frontend_status)"
    echo -e "  Backend (${SERVER_IP}:${BACKEND_PORT}): $(status_color $backend_status)"
    
    # Konteyner sağlık durumu
    echo -e "\n${YELLOW}Konteyner sağlık durumları:${NC}"
    for container in flax-erp-backend flax-erp-frontend flax-erp-postgres; do
        if [ "$(docker ps -q -f name=$container)" ]; then
            echo -ne "  $container: "
            check_container_health $container
        else
            echo -e "  $container: ${RED}Çalışmıyor${NC}"
        fi
    done
}

# Detaylı tanılama yap
diagnose_system() {
    echo -e "${BLUE}Sistem tanılaması yapılıyor...${NC}"
    
    # Docker bilgileri
    echo -e "\n${YELLOW}1. Docker Bilgileri:${NC}"
    echo -e "  Docker Sürümü:"
    docker --version
    echo -e "  Docker Compose Sürümü:"
    docker-compose --version
    echo -e "  Docker Disk Kullanımı:"
    docker system df
    
    # Konteyner detayları
    echo -e "\n${YELLOW}2. Konteyner Detayları:${NC}"
    for container in flax-erp-backend flax-erp-frontend flax-erp-postgres; do
        if [ "$(docker ps -q -f name=$container)" ]; then
            echo -e "  ${GREEN}$container:${NC}"
            echo -e "    ID: $(docker ps -q -f name=$container)"
            echo -e "    IP: $(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $container)"
            echo -e "    Başlangıç: $(docker inspect -f '{{.State.StartedAt}}' $container)"
            echo -e "    Durumu: $(docker inspect -f '{{.State.Status}}' $container)"
        else
            echo -e "  ${RED}$container: Çalışmıyor${NC}"
        fi
    done
    
    # Port kontrolü
    echo -e "\n${YELLOW}3. Açık Portlar:${NC}"
    netstat -tulpn 2>/dev/null | grep -E ":(${FRONTEND_PORT}|${BACKEND_PORT})" || echo -e "  Netstat kullanılabilir değil, alternatif yöntem deneniyor..."
    lsof -i -P -n 2>/dev/null | grep -E ":(${FRONTEND_PORT}|${BACKEND_PORT})" || echo -e "  Açık port bilgisi alınamadı"
    
    # Dosya kontrolleri
    echo -e "\n${YELLOW}4. Dosya Kontrolleri:${NC}"
    echo -e "  Docker Compose Dosyası: $(if [ -f docker-compose.yml ]; then echo "${GREEN}Mevcut${NC}"; else echo "${RED}Mevcut Değil${NC}"; fi)"
    echo -e "  .env Dosyası: $(if [ -f .env ]; then echo "${GREEN}Mevcut${NC} (içerik aşağıda)"; cat .env | grep -v PASSWORD | grep -v SECRET; else echo "${RED}Mevcut Değil${NC}"; fi)"
    
    # TypeScript konfigürasyonları
    echo -e "\n${YELLOW}5. TypeScript Konfigürasyonları:${NC}"
    echo -e "  tsconfig.json: $(if [ -f backend/tsconfig.json ]; then echo "${GREEN}Mevcut${NC}"; else echo "${RED}Mevcut Değil${NC}"; fi)"
    echo -e "  tsconfig.build.json: $(if [ -f backend/tsconfig.build.json ]; then echo "${GREEN}Mevcut${NC}"; else echo "${RED}Mevcut Değil${NC}"; fi)"
    
    # Log kontrolü
    echo -e "\n${YELLOW}6. Konteyner Logları:${NC}"
    for container in flax-erp-backend flax-erp-frontend; do
        if [ "$(docker ps -q -f name=$container)" ]; then
            echo -e "  ${CYAN}$container (son 10 satır):${NC}"
            docker logs --tail 10 $container
            echo
        fi
    done
    
    # Volume kontrolü
    echo -e "\n${YELLOW}7. Docker Volumes:${NC}"
    docker volume ls | grep flax-erp
    
    echo -e "\n${YELLOW}Tanılama tamamlandı.${NC}"
}

# Yaygın sorunları çözmeye çalış - fix komutu
fix_common_issues() {
    echo -e "${BLUE}Yaygın sorunları otomatik olarak çözme...${NC}"
    
    # TypeScript dosyalarını kontrol et ve oluştur
    echo -e "\n${YELLOW}1. TypeScript Konfigürasyonlarını Kontrol Etme${NC}"
    if [ ! -f "backend/tsconfig.json" ]; then
        echo -e "  ${RED}Backend TypeScript konfigürasyon dosyası bulunamadı. Oluşturuluyor...${NC}"
        cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF
        echo -e "  ${GREEN}tsconfig.json oluşturuldu.${NC}"
    else
        echo -e "  ${GREEN}tsconfig.json mevcut.${NC}"
    fi

    if [ ! -f "backend/tsconfig.build.json" ]; then
        echo -e "  ${RED}Backend tsconfig.build.json dosyası bulunamadı. Oluşturuluyor...${NC}"
        cat > backend/tsconfig.build.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
EOF
        echo -e "  ${GREEN}tsconfig.build.json oluşturuldu.${NC}"
    else
        echo -e "  ${GREEN}tsconfig.build.json mevcut.${NC}"
    fi
    
    # Frontend için fix-permissions.sh dosyası
    echo -e "\n${YELLOW}2. Frontend İzin Düzeltme Scriptini Kontrol Etme${NC}"
    if [ ! -f "frontend/fix-permissions.sh" ]; then
        echo -e "  ${RED}Frontend izin düzeltme scripti bulunamadı. Oluşturuluyor...${NC}"
        cat > frontend/fix-permissions.sh << 'EOF'
#!/bin/sh
set -e

# Next.js dizini için izinleri düzelt
echo "Fixing Next.js directory permissions..."
mkdir -p .next
chmod -R 777 /usr/src/app/.next
rm -rf /usr/src/app/.next/cache

# Node modules izinlerini kontrol et
if [ -d "/usr/src/app/node_modules" ]; then
  echo "Checking node_modules permissions..."
  chmod -R 755 /usr/src/app/node_modules
fi

echo "Permissions have been fixed."
EOF
        chmod +x frontend/fix-permissions.sh
        echo -e "  ${GREEN}fix-permissions.sh oluşturuldu ve çalıştırılabilir yapıldı.${NC}"
    else
        echo -e "  ${GREEN}fix-permissions.sh mevcut.${NC}"
        chmod +x frontend/fix-permissions.sh
    fi
    
    # Frontend entrypoint.sh dosyası
    echo -e "\n${YELLOW}3. Frontend Entrypoint Scriptini Kontrol Etme${NC}"
    if [ ! -f "frontend/entrypoint.sh" ]; then
        echo -e "  ${RED}Frontend entrypoint scripti bulunamadı. Oluşturuluyor...${NC}"
        cat > frontend/entrypoint.sh << 'EOF'
#!/bin/sh
set -e

# İzinleri düzelt
if [ -f "/usr/src/app/fix-permissions.sh" ]; then
  /usr/src/app/fix-permissions.sh
fi

# Backend hazır olana kadar bekle
echo "Backend servisinin hazır olması bekleniyor..."
while ! wget -q --spider http://backend:3000/health; do
  echo "Backend hazır değil, bekleniyor..."
  sleep 2
done
echo "Backend hazır, frontend başlatılıyor..."

# Node.js uygulamasını başlat
if [ "$NODE_ENV" = "production" ]; then
  echo "Production modunda başlatılıyor..."
  npm start
else
  echo "Development modunda başlatılıyor..."
  # Next.js'nin dev modunda ramdisk kullanmasını sağla
  export NEXT_TELEMETRY_DISABLED=1
  export NEXT_FORCE_DISK_CACHE=1
  npm run dev
fi
EOF
        chmod +x frontend/entrypoint.sh
        echo -e "  ${GREEN}entrypoint.sh oluşturuldu ve çalıştırılabilir yapıldı.${NC}"
    else
        echo -e "  ${GREEN}entrypoint.sh mevcut.${NC}"
        chmod +x frontend/entrypoint.sh
    fi
    
    # Backend için health-check.sh dosyası
    echo -e "\n${YELLOW}4. Backend Health Check Scriptini Kontrol Etme${NC}"
    if [ ! -f "backend/health-check.sh" ]; then
        echo -e "  ${RED}Backend health-check scripti bulunamadı. Oluşturuluyor...${NC}"
        cat > backend/health-check.sh << 'EOF'
#!/bin/sh

# Basit sağlık kontrolü
response=$(wget -qO- http://localhost:3000/health 2>/dev/null || echo "failed")

if echo "$response" | grep -q "status.*ok"; then
    echo "Backend service is healthy"
    exit 0
else
    echo "Backend service is unhealthy: $response"
    exit 1
fi
EOF
        chmod +x backend/health-check.sh
        echo -e "  ${GREEN}health-check.sh oluşturuldu ve çalıştırılabilir yapıldı.${NC}"
    else
        echo -e "  ${GREEN}health-check.sh mevcut.${NC}"
        chmod +x backend/health-check.sh
    fi
    
    # Docker temizliği
    echo -e "\n${YELLOW}5. Docker Temizliği${NC}"
    echo -e "  Docker konteynerleri durdurulup temizlenecek..."
    docker-compose down
    echo -e "  Docker cache temizleniyor..."
    docker system prune -f
    
    # Volume temizliği
    echo -e "\n${YELLOW}6. Volume Temizliği${NC}"
    echo -e "  Frontend volume'ları kontrol ediliyor..."
    if docker volume ls | grep -q "flax-erp_frontend_next_cache"; then
        echo -e "  Frontend cache volume'u temizleniyor..."
        docker volume rm -f flax-erp_frontend_next_cache
        docker volume create flax-erp_frontend_next_cache
        echo -e "  ${GREEN}Frontend cache volume'u yenilendi.${NC}"
    fi
    
    # Sistemi yeniden başlat
    echo -e "\n${YELLOW}7. Sistemi Yeniden Başlatma${NC}"
    echo -e "  Docker konteynerlerini yeniden başlatma..."
    docker-compose up -d
    
    echo -e "\n${GREEN}Sorun giderme işlemi tamamlandı. Durumu kontrol etmek için:${NC}"
    echo -e "${BLUE}./start.sh status${NC}"
}

# Frontend cache temizliği - clean komutu
clean_frontend() {
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
    docker volume rm -f flax-erp_frontend_next_cache || true

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
}

# Tek bir servisi başlatma/durdurma/yeniden başlatma - service komutu
manage_service() {
    local service=$1
    local action=$2
    
    if [[ -z "$service" || -z "$action" ]]; then
        echo -e "${RED}Hata: Servis adı ve aksiyon belirtilmelidir.${NC}"
        echo -e "Kullanım: ./start.sh service [backend|frontend|postgres] [start|stop|restart]"
        return 1
    fi
    
    # Servis adını kontrol et
    if [[ "$service" != "backend" && "$service" != "frontend" && "$service" != "postgres" ]]; then
        echo -e "${RED}Hata: Geçersiz servis adı. Desteklenen servisler: backend, frontend, postgres${NC}"
        return 1
    fi
    
    # Aksiyon adını kontrol et
    if [[ "$action" != "start" && "$action" != "stop" && "$action" != "restart" ]]; then
        echo -e "${RED}Hata: Geçersiz aksiyon. Desteklenen aksiyonlar: start, stop, restart${NC}"
        return 1
    fi
    
    echo -e "${BLUE}$service servisini $action işlemi uygulanıyor...${NC}"
    
    case "$action" in
        start)
            docker-compose up -d $service
            ;;
        stop)
            docker-compose stop $service
            ;;
        restart)
            docker-compose stop $service
            docker-compose rm -f $service
            
            if [[ "$service" == "backend" || "$service" == "frontend" ]]; then
                # Eğer uygulama servisiyse rebuild edelim
                docker-compose build $service
            fi
            
            docker-compose up -d $service
            ;;
        *)
            echo -e "${RED}Bilinmeyen aksiyon: $action${NC}"
            return 1
            ;;
    esac
    
    echo -e "${GREEN}$service servisi için $action işlemi tamamlandı.${NC}"
    
    # Durumu kontrol et
    if [[ "$action" == "start" || "$action" == "restart" ]]; then
        if [[ "$service" == "backend" ]]; then
            echo -e "${YELLOW}Backend servisinin hazır olması bekleniyor...${NC}"
            for i in {1..15}; do
                echo -n "."
                sleep 2
                if curl -s http://localhost:3000/health > /dev/null; then
                    echo -e "\n${GREEN}Backend servisi hazır!${NC}"
                    break
                fi
                if [[ $i -eq 15 ]]; then
                    echo -e "\n${RED}Backend servisinin hazır olması zaman aşımına uğradı. Logları kontrol edin.${NC}"
                fi
            done
        elif [[ "$service" == "frontend" ]]; then
            echo -e "${YELLOW}Frontend servisinin hazır olması bekleniyor...${NC}"
            for i in {1..15}; do
                echo -n "."
                sleep 2
                if curl -s http://localhost:8080 > /dev/null; then
                    echo -e "\n${GREEN}Frontend servisi hazır!${NC}"
                    break
                fi
                if [[ $i -eq 15 ]]; then
                    echo -e "\n${RED}Frontend servisinin hazır olması zaman aşımına uğradı. Logları kontrol edin.${NC}"
                fi
            done
        fi
    fi
}

# Özel fonksiyon: Frontend iznini düzelt
fix_frontend_permissions() {
    echo -e "${BLUE}Frontend izin sorununu düzeltme...${NC}"
    
    # Önce frontend'i durdur
    docker-compose stop frontend
    
    # Entrypoint.sh dosyası izinleri
    echo -e "${YELLOW}Entrypoint script izinlerini düzeltme...${NC}"
    chmod +x frontend/entrypoint.sh
    chmod +x frontend/fix-permissions.sh
    
    # Docker volume'larını temizle
    echo -e "${YELLOW}Frontend volume'larını yeniden oluşturma...${NC}"
    docker volume rm -f flax-erp_frontend_next_cache flax-erp_frontend_node_modules 2>/dev/null || true
    docker volume create flax-erp_frontend_next_cache
    docker volume create flax-erp_frontend_node_modules
    
    # Dockerfile'ı düzelt ve rebuild et
    echo -e "${YELLOW}Frontend container'ını yeniden oluşturma...${NC}"
    sed -i 's/USER nextjs/# USER nextjs/g' frontend/Dockerfile 2>/dev/null || true
    docker-compose build --no-cache frontend
    
    # Yeniden başlat
    echo -e "${YELLOW}Frontend servisini başlatma...${NC}"
    docker-compose up -d frontend
    
    echo -e "${GREEN}İşlem tamamlandı. Frontend durumunu kontrol edin:${NC}"
    sleep 5
    docker ps -f name=flax-erp-frontend
}

# Uzak sunucu durumunu kontrol et - server komutu
check_remote_server() {
    echo -e "${BLUE}Sunucu ${REMOTE_SERVER_IP} Durum Kontrolü${NC}"
    echo "-------------------------------------------"

    # Ağ bağlantısını kontrol et
    echo -e "${YELLOW}1. Ağ Bağlantısı Kontrolü:${NC}"
    if ping -c 3 ${REMOTE_SERVER_IP} &> /dev/null; then
        echo -e "  Ping: ${GREEN}Başarılı${NC}"
        RTT=$(ping -c 1 ${REMOTE_SERVER_IP} | grep -oP 'time=\K[0-9.]+')
        echo -e "  Gecikme: ${RTT} ms"
    else
        echo -e "  Ping: ${RED}Başarısız${NC}"
        echo -e "  Sebepler:"
        echo -e "  - Sunucu çalışmıyor olabilir"
        echo -e "  - Ağ bağlantınızda sorun olabilir"
        echo -e "  - ICMP paketleri engellenmiş olabilir"
        return 1
    fi

    # SSH bağlantısını kontrol et
    echo -e "\n${YELLOW}2. SSH Bağlantısı Kontrolü:${NC}"
    if ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER_IP} "echo 'SSH connection successful'" &> /dev/null; then
        echo -e "  SSH Bağlantısı: ${GREEN}Başarılı${NC}"
    else
        echo -e "  SSH Bağlantısı: ${RED}Başarısız${NC}"
        echo -e "  Sebepler:"
        echo -e "  - SSH anahtarı yapılandırması yanlış olabilir"
        echo -e "  - SSH servisi sunucuda çalışmıyor olabilir"
        echo -e "  - Firewall SSH bağlantılarını engelliyor olabilir"
        echo -e "  Çözüm için manuel SSH bağlantısı deneyin:"
        echo -e "  $ ssh ${SSH_USER}@${REMOTE_SERVER_IP}"
        return 1
    fi

    # Sunucu kaynaklarını kontrol et
    echo -e "\n${YELLOW}3. Sunucu Kaynakları:${NC}"
    ssh -o ConnectTimeout=5 ${SSH_USER}@${REMOTE_SERVER_IP} "
        echo '  CPU Kullanımı:' 
        top -bn1 | grep 'Cpu(s)' | awk '{print \"  \" \$2+\$4 \"%\"}' 
        echo '  Bellek Kullanımı:' 
        free -m | grep Mem | awk '{print \"  \" \$3/\$2*100 \"%  (\" \$3 \"MB / \" \$2 \"MB)\"}' 
        echo '  Disk Kullanımı:' 
        df -h / | awk 'NR==2 {print \"  \" \$5 \"  (\" \$3 \" / \" \$2 \")\"}'"

    # Docker durumunu kontrol et
    echo -e "\n${YELLOW}4. Docker Durumu:${NC}"
    if ssh -o ConnectTimeout=5 ${SSH_USER}@${REMOTE_SERVER_IP} "command -v docker" &> /dev/null; then
        echo -e "  Docker: ${GREEN}Kurulu${NC}"
        
        # Docker servisini kontrol et
        if ssh -o ConnectTimeout=5 ${SSH_USER}@${REMOTE_SERVER_IP} "systemctl is-active docker" &> /dev/null; then
            echo -e "  Docker Servisi: ${GREEN}Çalışıyor${NC}"
            
            # Docker imajlarını ve konteynerleri listele
            echo -e "  Docker Konteynerleri:"
            ssh -o ConnectTimeout=5 ${SSH_USER}@${REMOTE_SERVER_IP} "docker ps -a" | awk 'NR>1 {print \"  - \" \$NF \" (\"\$2\"): \" \$(NF-1)}'
        else
            echo -e "  Docker Servisi: ${RED}Çalışmıyor${NC}"
            echo -e "  Docker servisini başlatmak için:"
            echo -e "  $ ssh ${SSH_USER}@${REMOTE_SERVER_IP} \"systemctl start docker\""
        fi
    else
        echo -e "  Docker: ${RED}Kurulu Değil${NC}"
        echo -e "  Docker'ı yüklemek için:"
        echo -e "  $ ssh ${SSH_USER}@${REMOTE_SERVER_IP} \"curl -fsSL https://get.docker.com | sh\""
    fi

    # Port kontrollerini yap
    echo -e "\n${YELLOW}5. Port Kontrolleri:${NC}"
    for port in 22 80 443 3000 8080; do
        nc -z -w 2 ${REMOTE_SERVER_IP} ${port} &>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "  Port ${port}: ${GREEN}Açık${NC}"
        else
            echo -e "  Port ${port}: ${RED}Kapalı${NC}"
        fi
    done

    # Uygulama kontrolü
    echo -e "\n${YELLOW}6. Flax-ERP Uygulama Kontrolü:${NC}"
    echo -e "  Backend API:"
    curl -s -o /dev/null -w "  HTTP Durum: %{http_code}\n" --connect-timeout 5 http://${REMOTE_SERVER_IP}:3000/health || echo -e "  ${RED}Erişilemiyor${NC}"
    echo -e "  Frontend:"
    curl -s -o /dev/null -w "  HTTP Durum: %{http_code}\n" --connect-timeout 5 http://${REMOTE_SERVER_IP}:8080 || echo -e "  ${RED}Erişilemiyor${NC}"

    echo -e "\n${BLUE}Sunucu kontrol tamamlandı.${NC}"
}

# Uzak sunucuya deploy et - deploy komutu
deploy_to_remote() {
    # .env.production dosyasından değişkenleri yükle
    if [ -f .env.production ]; then
        export $(grep -v '^#' .env.production | xargs)
    else
        echo -e "${RED}Hata: .env.production dosyası bulunamadı.${NC}"
        echo -e "Örnek .env.production dosyası oluşturuluyor..."
        
        cat > .env.production << 'EOF'
# Sunucu Bilgileri
SERVER_IP=88.218.130.67
SSH_USER=root
REMOTE_DIR=/home/flax-erp

# Database
DB_USER=flaxerp
DB_PASSWORD=FlaxERP_2023!
DB_NAME=flaxerp
DB_PORT=5432

# Backend
BACKEND_PORT=3000
JWT_SECRET=flaxerp-production-jwt-secret-key-2023
BACKEND_URL=http://88.218.130.67:3000
NODE_ENV=production

# Frontend
FRONTEND_PORT=8080
FRONTEND_URL=http://88.218.130.67:8080
EOF
        
        echo -e "${YELLOW}.env.production dosyası oluşturuldu. Lütfen içeriğini düzenleyip tekrar deneyin.${NC}"
        return 1
    fi

    local remote_server_ip=${SERVER_IP:-${REMOTE_SERVER_IP}}
    local ssh_user=${SSH_USER:-"root"}
    local remote_dir=${REMOTE_DIR:-"/home/flax-erp"}

    echo -e "${BLUE}Flax-ERP Live Test Ortamını ${remote_server_ip} Sunucusuna Deploy Etme${NC}"
    echo "----------------------------"

    # SSH kontrolü
    echo -e "${BLUE}Sunucu bağlantısı test ediliyor...${NC}"
    if ! ssh -o ConnectTimeout=5 ${ssh_user}@${remote_server_ip} "echo 'Bağlantı başarılı'"; then
        echo -e "${RED}Hata: Sunucuya bağlanılamadı. SSH anahtarınızın doğru olduğundan emin olun.${NC}"
        return 1
    fi

    # Gerekli dizinleri oluştur
    echo -e "${BLUE}Sunucuda gerekli dizinleri oluşturma...${NC}"
    ssh ${ssh_user}@${remote_server_ip} "mkdir -p ${remote_dir}"

    # Gerekli dosyaları sunucuya kopyalama
    echo -e "${BLUE}Proje dosyalarını sunucuya kopyalanıyor...${NC}"
    scp -r ./backend ${ssh_user}@${remote_server_ip}:${remote_dir}/
    scp -r ./frontend ${ssh_user}@${remote_server_ip}:${remote_dir}/
    
    # Docker compose dosyalarını kopyala
    if [ -f "docker-compose.prod.yml" ]; then
        scp docker-compose.prod.yml ${ssh_user}@${remote_server_ip}:${remote_dir}/docker-compose.yml
    else
        scp docker-compose.yml ${ssh_user}@${remote_server_ip}:${remote_dir}/
    fi
    
    scp .env.production ${ssh_user}@${remote_server_ip}:${remote_dir}/.env
    
    # Docker işlemleri
    echo -e "${BLUE}Sunucuda Docker konteynerlerini başlatma...${NC}"
    ssh ${ssh_user}@${remote_server_ip} "cd ${remote_dir} && docker-compose down && docker-compose up -d"

    # Deployment sonrası kontrol
    echo -e "${BLUE}Servisler kontrol ediliyor...${NC}"
    sleep 10
    ssh ${ssh_user}@${remote_server_ip} "cd ${remote_dir} && docker-compose ps"
    
    echo -e "${GREEN}Deploy işlemi tamamlandı!${NC}"
    echo -e "${GREEN}Frontend:${NC} http://${remote_server_ip}:8080"
    echo -e "${GREEN}Backend API:${NC} http://${remote_server_ip}:3000"
    echo -e "${GREEN}Test Kullanıcısı:${NC} admin@flaxerp.com / admin123"
    echo ""
    echo -e "${YELLOW}ÖNEMLİ:${NC} Live test ortamı sadece test amaçlıdır. Gerçek verileri kullanmayın."
}

# Uzak sunucuda komut çalıştır - remote komutu
run_remote_command() {
    local command=$1
    
    if [[ -z "$command" ]]; then
        echo -e "${RED}Hata: Uzak sunucuda çalıştırılacak komut belirtilmelidir.${NC}"
        echo -e "Kullanım: ./start.sh remote [KOMUT]"
        echo -e "Örnekler:"
        echo -e "  ./start.sh remote status   # Uzak sunucudaki servislerin durumunu gösterir"
        echo -e "  ./start.sh remote restart  # Uzak sunucudaki servisleri yeniden başlatır"
        return 1
    fi
    
    echo -e "${BLUE}Uzak sunucuda ($REMOTE_SERVER_IP) '$command' komutu çalıştırılıyor...${NC}"
    
    # SSH bağlantısını kontrol et
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no ${SSH_USER}@${REMOTE_SERVER_IP} "echo 'SSH connection successful'" &> /dev/null; then
        echo -e "${RED}Hata: SSH bağlantısı kurulamadı. SSH anahtarınızı kontrol edin.${NC}"
        return 1
    fi
    
    # Komutu çalıştır
    case "$command" in
        status)
            ssh ${SSH_USER}@${REMOTE_SERVER_IP} "cd ${REMOTE_DIR} && docker-compose ps"
            ;;
        restart)
            ssh ${SSH_USER}@${REMOTE_SERVER_IP} "cd ${REMOTE_DIR} && docker-compose down && docker-compose up -d"
            echo -e "${GREEN}Uzak sunucudaki servisler yeniden başlatıldı.${NC}"
            ;;
        logs)
            echo -e "${YELLOW}Uzak sunucudaki logları göstermek için. Çıkmak için CTRL+C tuşlarına basın.${NC}"
            ssh ${SSH_USER}@${REMOTE_SERVER_IP} "cd ${REMOTE_DIR} && docker-compose logs -f"
            ;;
        *)
            # Genel komut çalıştırma
            ssh ${SSH_USER}@${REMOTE_SERVER_IP} "cd ${REMOTE_DIR} && $command"
            ;;
    esac
    
    echo -e "${GREEN}Uzak sunucuda komut çalıştırma tamamlandı.${NC}"
}

# Sistemi tamamen yeniden oluştur - rebuild komutu
rebuild_system() {
    echo -e "${BLUE}Flax-ERP tamamen yeniden kuruluyor...${NC}"
    
    # Mevcut container'ları durdur ve kaldır
    docker-compose down -v
    
    # Temizlik yap
    echo -e "${YELLOW}Docker sistemi temizleniyor...${NC}"
    docker system prune -f
    
    # node_modules temizle
    echo -e "${YELLOW}Node modülleri temizleniyor...${NC}"
    rm -rf backend/node_modules frontend/node_modules
    
    # Bağımlılıkları tekrar yükle
    echo -e "${YELLOW}Backend bağımlılıkları yükleniyor...${NC}"
    cd backend && npm install --legacy-peer-deps && cd ..
    
    echo -e "${YELLOW}Frontend bağımlılıkları yükleniyor...${NC}"
    cd frontend && npm install --legacy-peer-deps && cd ..
    
    # TypeScript dosyalarını kontrol et
    echo -e "${YELLOW}TypeScript dosyaları kontrol ediliyor...${NC}"
    if [ ! -f "backend/tsconfig.json" ] || [ ! -f "backend/tsconfig.build.json" ]; then
        fix_common_issues
    fi
    
    # Imajları yeniden oluştur
    echo -e "${YELLOW}Docker imajları yeniden oluşturuluyor...${NC}"
    docker-compose build --no-cache
    
    # Sistemi başlat
    echo -e "${YELLOW}Sistem yeniden başlatılıyor...${NC}"
    docker-compose up -d
    
    echo -e "${GREEN}Yeniden kurulum tamamlandı.${NC}"
    
    echo -e "${YELLOW}Durumu kontrol etmek için birkaç saniye bekleniyor...${NC}"
    sleep 10
    check_status
}

# Sistemi başlat
start_system() {
    echo -e "${BLUE}Flax-ERP başlatılıyor...${NC}"
    
    # Önce postgres'i başlat ve hazır olmasını bekle
    echo -e "${YELLOW}PostgreSQL başlatılıyor...${NC}"
    docker-compose up -d postgres
    
    # PostgreSQL'in hazır olmasını bekle
    echo -ne "PostgreSQL'in hazır olması bekleniyor..."
    local counter=0
    local max_wait=30
    while [ $counter -lt $max_wait ]; do
        counter=$((counter+1))
        
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            echo -e " ${GREEN}Hazır!${NC}"
            break
        fi
        
        echo -n "."
        sleep 2
        
        if [ $counter -eq $max_wait ]; then
            echo -e " ${RED}Zaman aşımı!${NC}"
        fi
    done
    
    # Backend'i başlat ve hazır olmasını bekle
    echo -e "${YELLOW}Backend servisi başlatılıyor...${NC}"
    docker-compose up -d backend
    
    # Backend'in hazır olmasını bekle
    echo -ne "Backend servisinin hazır olması bekleniyor..."
    counter=0
    while [ $counter -lt $max_wait ]; do
        counter=$((counter+1))
        
        if curl -s http://localhost:3000/health > /dev/null; then
            echo -e " ${GREEN}Hazır!${NC}"
            break
        fi
        
        echo -n "."
        sleep 2
        
        if [ $counter -eq $max_wait ]; then
            echo -e " ${YELLOW}Zaman aşımı!${NC}"
        fi
    done
    
    # Frontend'i başlat
    echo -e "${YELLOW}Frontend servisi başlatılıyor...${NC}"
    docker-compose up -d frontend
    
    # Tüm servislerin hazır olmasını izle
    echo -e "${YELLOW}Tüm servislerin başlaması izleniyor...${NC}"
    docker-compose logs -f &
    LOG_PID=$!
    
    # Kullanıcı Ctrl+C ile çıkabilsin diye biraz bekle
    echo -e "${YELLOW}Servislerin başlatılması izleniyor, devam etmek için bir tuşa basın veya Ctrl+C ile çıkın...${NC}"
    read -t 10 -n 1
    
    # Log process'ini sonlandır
    kill $LOG_PID 2>/dev/null
    
    echo -e "${GREEN}Tüm servisler başlatıldı.${NC}"
    check_status
    
    # Konteyner durumlarını göster
    echo -e "\n${BLUE}Konteyner durumları:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "${GREEN}Flax-ERP başlatıldı. Erişim bilgileri:${NC}"
    echo -e "  Frontend:  http://${SERVER_IP}:${FRONTEND_PORT}"
    echo -e "  Backend:   http://${SERVER_IP}:${BACKEND_PORT}"
    echo -e "  API Docs:  http://${SERVER_IP}:${BACKEND_PORT}/api"
    echo -e "  Kullanıcı: admin@flaxerp.com / admin123"
}

# Sistemi durdur
stop_system() {
    echo -e "${BLUE}Flax-ERP durduruluyor...${NC}"
    docker-compose down
    
    echo -e "${YELLOW}Flax-ERP durduruldu.${NC}"
}

# Logları göster
show_logs() {
    echo -e "${BLUE}Flax-ERP logları gösteriliyor...${NC}"
    echo -e "${YELLOW}Çıkmak için CTRL+C tuşlarına basın.${NC}"
    sleep 1
    docker-compose logs -f
}

# Ana fonksiyon
main() {
    show_banner
    
    local command=${1:-help}
    shift || true
    
    case "$command" in
        start)
            check_docker
            start_system
            ;;
        stop)
            check_docker
            stop_system
            ;;
        restart)
            check_docker
            stop_system
            echo
            start_system
            ;;
        status)
            check_docker
            check_status
            ;;
        logs)
            check_docker
            show_logs
            ;;
        diag|diagnose)
            check_docker
            diagnose_system
            ;;
        fix)
            check_docker
            fix_common_issues
            ;;
        clean)
            check_docker
            clean_frontend
            ;;
        deploy)
            deploy_to_remote
            ;;
        server)
            check_remote_server
            ;;
        remote)
            run_remote_command "$@"
            ;;
        service)
            check_docker
            manage_service "$1" "$2"
            ;;
        rebuild)
            check_docker
            rebuild_system
            ;;
        fix-frontend)
            check_docker
            fix_frontend_permissions
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Hata: Geçersiz komut '$command'${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Çalıştır
main "$@"
