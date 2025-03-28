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
    echo -e "${YELLOW}Kullanım:${NC} $0 [komut] [parametre]"
    echo ""
    echo "Komutlar:"
    echo -e "  ${GREEN}setup${NC}     - Geliştirme ortamını kurar (npm bağımlılıkları vb.)"
    echo -e "  ${GREEN}start${NC}     - Tüm servisleri başlatır"
    echo -e "  ${GREEN}stop${NC}      - Tüm servisleri durdurur"
    echo -e "  ${GREEN}restart${NC}   - Tüm servisleri yeniden başlatır"
    echo -e "  ${GREEN}status${NC}    - Servis durumlarını gösterir"
    echo -e "    ${BLUE}└──${NC} ${GREEN}status network${NC}   - Detaylı ağ ve erişim bilgilerini gösterir"
    echo -e "    ${BLUE}└──${NC} ${GREEN}status images${NC}    - Docker imaj durumunu gösterir"
    echo -e "    ${BLUE}└──${NC} ${GREEN}status resources${NC} - Sistem kaynak kullanımını gösterir"
    echo -e "  ${GREEN}logs${NC}      - Servis loglarını gösterir"
    echo -e "  ${GREEN}backend${NC}   - Sadece backend servisini başlatır"
    echo -e "  ${GREEN}frontend${NC}  - Sadece frontend servisini başlatır"
    echo -e "  ${GREEN}db${NC}        - Sadece veritabanı servisini başlatır"
    echo -e "  ${GREEN}install-deps${NC} - Tüm node_modules bağımlılıklarını yükler"
    echo -e "  ${GREEN}clean${NC}     - Tüm bağımlılıkları ve yüklenen dosyaları temizler"
    echo -e "  ${GREEN}setup-node${NC} - Node.js ortamını kurar"
    echo -e "  ${GREEN}fix-webpack${NC} - Webpack bağımlılık sorunlarını çözer"
    echo -e "  ${GREEN}fix-vuetify${NC} - Vuetify SASS import hatalarını çözer"
    echo ""
    echo "Örnekler:"
    echo "  ./scripts/start.sh start               # Tüm servisleri başlatır"
    echo "  ./scripts/start.sh status network      # Detaylı ağ ve erişim kontrolü yapar"
    echo "  ./scripts/start.sh logs frontend       # Frontend loglarını gösterir"
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

# Node.js versiyonunu kontrol et
check_nodejs_version() {
  if [ -f .nvmrc ]; then
    required_version=$(cat .nvmrc)
    current_version=$(node -v 2>/dev/null)
    
    if [ -z "$current_version" ]; then
      echo -e "${RED}[ERROR] Node.js kurulu değil${NC}"
      echo -e "${YELLOW}Node.js kurmak için: ./scripts/start.sh setup-node${NC}"
      return 1
    fi
    
    # v ile başlayan sürüm numarasını düzelt
    required_version="${required_version#v}"
    current_version="${current_version#v}"
    
    # Başlangıç ​​sürüm numaralarını karşılaştır (major sürüm)
    required_major=$(echo $required_version | cut -d. -f1)
    current_major=$(echo $current_version | cut -d. -f1)
    
    if [ "$current_major" -lt "$required_major" ]; then
      echo -e "${RED}[ERROR] Node.js sürümü çok eski. Gerekli: v$required_version, Mevcut: v$current_version${NC}"
      echo -e "${YELLOW}Node.js sürümünü güncellemek için: ./scripts/start.sh setup-node${NC}"
      return 1
    fi
  fi
  
  return 0
}

# Servisleri başlat
start_services() {
    echo -e "${YELLOW}[INFO] Servisler başlatılıyor...${NC}"
    
    # Docker değişikliklerini algıla ve yeniden oluştur
    docker-compose build
    
    # Servisleri başlat
    docker-compose up -d
    
    # Servislerin durumunu kontrol et
    echo -e "${YELLOW}[INFO] Servislerin durumu kontrol ediliyor...${NC}"
    docker-compose ps
    
    # Ağ ayarlarını kontrol et
    echo -e "${YELLOW}[INFO] Ağ ayarları kontrol ediliyor...${NC}"
    docker network ls
    
    # Frontend loglarını göster (sorun teşhisi için)
    echo -e "${YELLOW}[INFO] Frontend logları:${NC}"
    docker-compose logs frontend
    
    # Erişim bilgilerini göster
    echo -e "${GREEN}[SUCCESS] Tüm servisler başlatıldı${NC}"
    echo -e "${BLUE}[INFO] Frontend (yerel): http://localhost:3000${NC}"
    echo -e "${BLUE}[INFO] Frontend (sunucu): http://88.218.130.67:3000${NC}"
    echo -e "${BLUE}[INFO] Backend API: http://88.218.130.67:3001/api${NC}"
    echo -e "${BLUE}[INFO] API Dokümantasyonu: http://88.218.130.67:3001/api/docs${NC}"
    
    # Erişim sorunları için kontrol ipuçları
    echo -e "${YELLOW}[TIP] Eğer frontend'e erişilemiyorsa:${NC}"
    echo -e "  1. Güvenlik duvarı ayarlarını kontrol edin: 'sudo ufw status'"
    echo -e "  2. Portların açık olup olmadığını kontrol edin: 'sudo ss -tulpn | grep 3000'"
    echo -e "  3. Frontend konteyneri çalışıyor mu kontrol edin: 'docker-compose ps'"
    echo -e "  4. Frontend loglarını inceleyin: 'docker-compose logs frontend'"
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
    echo -e "${YELLOW}[INFO] Temel Servis Durumları:${NC}"
    docker-compose ps
     ]; then ]; then
    # Detaylı ağ kontrolü için ek parametre kontrolü"\n${YELLOW}[INFO] Docker ağ durumu:${NC}""\n${YELLOW}[INFO] Docker ağ durumu:${NC}"
    if [ "$1" = "network" ]; then
        echo -e "\n${BLUE}====== DETAYLI AĞ KONTROLÜ ======${NC}"
        if command -v netstat &> /dev/null; then
        echo -e "\n${YELLOW}[INFO] Docker ağ durumu:${NC}"           netstat -tuln           netstat -tuln
        docker network ls
            echo -e "${RED}Netstat komutu bulunamadı veya sistem üzerinde netstat kurulu değil.${NC}"zerinde netstat kurulu değil.${NC}"
        fiOW}[INFO] Ağ bağlantıları:${NC}"
        if command -v ufw &> /dev/null; thendev/null; then Frontend konteynerinin IP adresi:${NC}"
        docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-frontend 2>/dev/null || echo -e "${RED}Frontend konteyneri bulunamadı veya çalışmıyor${NC}"ulunamadı veya herhangi bir bağlantı yok${NC}"
        echo -e "\n${YELLOW}[INFO] Backend konteynerinin IP adresi:${NC}"
        docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-backend 2>/dev/null || echo -e "${RED}Backend konteyneri bulunamadı veya çalışmıyor${NC}" netstat kurulu değil.${NC}"
        echo -e "\n${YELLOW}[INFO] Frontend logları (son 10 satır):${NC}"nde UFW kurulu değil.${NC}"
        docker logs flax-erp-frontend --tail 10 2>/dev/null || echo -e "${RED}Frontend konteyneri logları okunamadı${NC}"
        echo -e "\n${YELLOW}[INFO] Backend logları (son 10 satır):${NC}"ynerinin IP adresi:${NC}"ı durumu:${NC}"
        docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-frontend 2>/dev/null || echo -e "${RED}Frontend konteyneri bulunamadı veya çalışmıyor${NC}"yneri logları okunamadı${NC}"
        echo -e "\n${YELLOW}[INFO] Backend konteynerinin IP adresi:${NC}"
        docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-backend 2>/dev/null || echo -e "${RED}Backend konteyneri bulunamadı veya çalışmıyor${NC}" 2>/dev/null || echo -e "${RED}Frontend yerel olarak erişilebilir değil (localhost:3000)${NC}"
        echo -e "\n${YELLOW}[INFO] Frontend logları (son 10 satır):${NC}"tend IP üzerinden erişilebilir değil (127.0.0.1:3000)${NC}"değil.${NC}"
        docker logs flax-erp-frontend --tail 10 2>/dev/null || echo -e "${RED}Frontend konteyneri logları okunamadı${NC}"
        echo -e "\n${YELLOW}[INFO] Backend logları (son 10 satır):${NC}"}Frontend sunucu IP üzerinden erişilebilir değil (88.218.130.67:3000)${NC}"
        docker logs flax-erp-backend --tail 10 2>/dev/null || echo -e "${RED}Backend konteyneri logları okunamadı${NC}"
        echo -e "\n${YELLOW}[INFO] Port erişim testleri:${NC}"ri bulunamadı veya çalışmıyor${NC}"
        curl -I http://localhost:3000 -m 2 2>/dev/null || echo -e "${RED}Frontend yerel olarak erişilebilir değil (localhost:3000)${NC}"yarlarını kontrol edin: sudo ufw allow 3000/tcp ve sudo ufw allow 3001/tcp"
        curl -I http://127.0.0.1:3000 -m 2 2>/dev/null || echo -e "${RED}Frontend IP üzerinden erişilebilir değil (127.0.0.1:3000)${NC}"varsa: frontend/nuxt.config.js dosyasında server.host ayarını '0.0.0.0' olarak kontrol edin"eynerinin IP adresi:${NC}"
        curl -I http://localhost:3001/api -m 2 2>/dev/null || echo -e "${RED}Backend API yerel olarak erişilebilir değil (localhost:3001/api)${NC}"şmıyor${NC}"
        curl -I http://88.218.130.67:3000 -m 3 2>/dev/null || echo -e "${RED}Frontend sunucu IP üzerinden erişilebilir değil (88.218.130.67:3000)${NC}"n: docker logs flax-erp-frontend --follow"
        echo -e "\n${YELLOW}[ÇÖZÜM ÖNERİLERİ]${NC}"r):${NC}"
        echo -e "  1. Servisler çalışmıyorsa: ./scripts/start.sh restart"
        echo -e "  2. Güvenlik duvarı ayarlarını kontrol edin: sudo ufw allow 3000/tcp ve sudo ufw allow 3001/tcp"
        echo -e "  3. Nuxt.js ayarlarında hata varsa: frontend/nuxt.config.js dosyasında server.host ayarını '0.0.0.0' olarak kontrol edin"
        echo -e "  4. Servisleri yeniden başlatmak için: ./scripts/start.sh stop && ./scripts/start.sh start"
        echo -e "  5. Konteyner loglarını tam görmek için: docker logs flax-erp-frontend --follow"
    fi
    
    if [ "$1" = "images" ]; thenn erişilebilir değil (127.0.0.1:3000)${NC}"
        echo -e "\n${YELLOW}[INFO] Docker imaj durumu:${NC}"erişilebilir değil (localhost:3001/api)${NC}"
        docker images | grep -E 'flax-erp|postgres'rişilebilir değil (88.218.130.67:3000)${NC}"
    fi
            echo -e "\n${YELLOW}[ÇÖZÜM ÖNERİLERİ]${NC}"        echo -e "\n${YELLOW}[INFO] Disk kullanımı:${NC}"
    if [ "$1" = "resources" ]; thenrler çalışmıyorsa: ./scripts/start.sh restart"
        echo -e "\n${YELLOW}[INFO] Docker disk kullanımı:${NC}"llow 3001/tcp"
        docker system dfu varsa: frontend/nuxt.config.js dosyasında server.host ayarını '0.0.0.0' olarak kontrol edin"
        echo -e "\n${YELLOW}[INFO] Konteyner kaynak kullanımı:${NC}"sh stop && ./scripts/start.sh start"
        docker stats --no-streamiçin: docker logs flax-erp-frontend --follow"
        echo -e "\n${YELLOW}[INFO] Disk kullanımı:${NC}"
        df -h
    fiol et
}
${NC}"
# Logları göster
show_logs() {
    echo -e "${YELLOW}[INFO] Servis logları gösteriliyor...${NC}"
    docker-compose logs -f
}esources" ]; then up -d $service_name
 KULLANIMI ======${NC}"ervisi başlatıldı${NC}"
# Belirli bir servisi başlat  echo -e "\n${YELLOW}[INFO] Docker disk kullanımı:${NC}"
start_service() {r system df
    service_name=$1r
    echo -e "${YELLOW}[INFO] $service_name servisi başlatılıyor...${NC}" "\n${YELLOW}[INFO] Konteyner kaynak kullanımı:${NC}"{
    docker-compose up -d $service_name stats --no-stream
    echo -e "${GREEN}[SUCCESS] $service_name servisi başlatıldı${NC}"
}NC}"
        df -h    REQUIRED_NODE_VERSION="20.11.1"  # .nvmrc dosyasında belirtilen versiyon
# Node.js versiyonunu kontrol et ve gerekirse kur
setup_nodejs() {
    print_logothen
    echo -e "${BLUE}Node.js Kurulumu${NC}"echo -e "${GREEN}NVM zaten kurulu${NC}"
    echo "========================================"}        export NVM_DIR="$HOME/.nvm"
    REQUIRED_NODE_VERSION="20.11.1"  # .nvmrc dosyasında belirtilen versiyon ] && \. "$NVM_DIR/nvm.sh"
# Logları göster    else
    # NVM (Node Version Manager) kontrolüuyor...${NC}"
    if [ -s "$HOME/.nvm/nvm.sh" ]; then...${NC}"
        echo -e "${GREEN}NVM zaten kurulu${NC}"h/nvm/v0.39.5/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"r
    else
        echo -e "${YELLOW}NVM kuruluyor...${NC}"
        # NVM Kurulumu
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash...${NC}"
        mpose up -d $service_name
        # NVM'i aktifleştir
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
        echo -e "${GREEN}NVM kuruldu${NC}"ejs() {se $REQUIRED_NODE_VERSION
    fi   print_logo
C}"ümleri belirterek
    # Node.js sürümünü yükle==="..${NC}"
    echo -e "${YELLOW}Node.js $REQUIRED_NODE_VERSION sürümü kuruluyor...${NC}"RSION="20.11.1"  # .nvmrc dosyasında belirtilen versiyonpm@10.2.4
    nvm install $REQUIRED_NODE_VERSION
    nvm use $REQUIRED_NODE_VERSION
    
    # Global paketleri yükle, fakat sürümleri belirterek        echo -e "${GREEN}NVM zaten kurulu${NC}"    NODE_VERSION=$(node -v)
    echo -e "${YELLOW}Npm paketleri yükleniyor...${NC}"
    npm install -g npm@10.2.4
    npm install -g @nestjs/cli@10.2.1ulum tamamlandı!${NC}"
    npm install -g typescript@5.3.3uyor...${NC}"
    
    NODE_VERSION=$(node -v)stall.sh | bash
    echo -e "${GREEN}Node.js ${NODE_VERSION} kuruldu ve aktif${NC}"
    echo -e "${GREEN}NPM $(npm -v) versiyonu kuruldu${NC}"
    echo -e "${GREEN}Kurulum tamamlandı!${NC}"vm"iyon Düzeltme${NC}"
}  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"ho "========================================"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
# Webpack sorunlarını düzelt
fix_webpack() {
    print_logo
    echo -e "${BLUE}Webpack Versiyon Düzeltme${NC}"e
    echo "========================================"

    if [ ! -d "frontend" ]; thenREQUIRED_NODE_VERSION
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
        return 1 sürümleri belirterek0 yükleniyor...${NC}"
    fi paketleri yükleniyor...${NC}"
0 --save-dev
    cd frontend
5.3.3ibi diğer ilgili paketleri de düzelt
    # Webpack v4'ü yüklelılıklar düzeltiliyor...${NC}"
    echo -e "${YELLOW}Webpack 4.46.0 yükleniyor...${NC}"
    npm uninstall webpack   echo -e "${GREEN}Node.js ${NODE_VERSION} kuruldu ve aktif${NC}"   npm install webpack-dev-middleware@^4.3.0 --save-dev
    npm install webpack@4.46.0 --save-devREEN}NPM $(npm -v) versiyonu kuruldu${NC}"
    {NC}"zeltildi!${NC}"
    # webpack-dev-middleware gibi diğer ilgili paketleri de düzelt
    echo -e "${YELLOW}İlgili bağımlılıklar düzeltiliyor...${NC}"
    npm uninstall webpack-dev-middleware
    npm install webpack-dev-middleware@^4.3.0 --save-dev
    
    echo -e "${GREEN}Webpack versiyonu düzeltildi!${NC}"
    echo -e "${YELLOW}Projeyi yeniden oluşturun:${NC}"
    echo -e "${BLUE}./scripts/start.sh restart${NC}"
    cd ..    if [ ! -d "frontend" ]; then    echo -e "${BLUE}Vuetify SASS Import Düzeltme${NC}"
}rontend dizini bulunamadı${NC}"=================="

# Vuetify SASS hatalarını düzeltd" ]; then
fix_vuetify_sass() {
    print_logo
    echo -e "${BLUE}Vuetify SASS Import Düzeltme${NC}"
    echo "========================================"
4.46.0 yükleniyor...${NC}"
    if [ ! -d "frontend" ]; then
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
        return 1
    fi
 -e "${YELLOW}İlgili bağımlılıklar düzeltiliyor...${NC}"
    # assets dizini kontrolü
    if [ ! -d "frontend/assets" ]; then.3.0 --save-devss dosyası oluşturuluyor...${NC}"
        echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
        mkdir -p frontend/assets versiyonu düzeltildi!${NC}"
    fi
/start.sh restart${NC}"styles.sass';
    # variables.scss oluşturma
    echo -e "${YELLOW}[INFO] variables.scss dosyası oluşturuluyor...${NC}"
    cat > frontend/assets/variables.scss << EOF
// Vuetify için değişkenler
// Tema renklerini burada özelleştirebilirsiniz
@import '~vuetify/src/styles/styles.sass';
ho -e "${BLUE}Vuetify SASS Import Düzeltme${NC}": #2196F3;
// Ana renklerecho "========================================"ccess: #4CAF50;
\$primary: #3F51B5;
\$secondary: #00796B;
\$accent: #FFC107;] Frontend dizini bulunamadı${NC}"
\$error: #F44336;
\$info: #2196F3;
\$success: #4CAF50;
\$warning: #FF9800;

// Tema ayarları}[INFO] frontend/assets dizini oluşturuluyor...${NC}"CESS] variables.scss dosyası oluşturuldu: frontend/assets/variables.scss${NC}"
\$body-font-family: 'Roboto', sans-serif;
\$heading-font-family: 'Roboto', sans-serif;
\$border-radius-root: 4px;
EOF
LLOW}[INFO] variables.scss dosyası oluşturuluyor...${NC}"lıklarını yükle
    echo -e "${GREEN}[SUCCESS] variables.scss dosyası oluşturuldu: frontend/assets/variables.scss${NC}"
    echo -e "${YELLOW}[INFO] Şimdi servisleri yeniden başlatabilirsiniz:${NC}"
    echo -e "${BLUE}./scripts/start.sh restart${NC}"// Tema renklerini burada özelleştirebilirsiniz    echo -e "${YELLOW}[INFO] Tüm node_modules bağımlılıkları yükleniyor...${NC}"
}
arı
# Tüm NPM bağımlılıklarını yükle{YELLOW}[INFO] Frontend bağımlılıkları yükleniyor...${NC}"
install_dependencies() {
    print_logo0796B;tend
    echo -e "${YELLOW}[INFO] Tüm node_modules bağımlılıkları yükleniyor...${NC}"
    
    # Frontend bağımlılıklarıları yüklendi${NC}"
    echo -e "${YELLOW}[INFO] Frontend bağımlılıkları yükleniyor...${NC}"
    if [ -d "frontend" ]; then9800;e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
        cd frontend
        npm instalları
        cd ..
        echo -e "${GREEN}[SUCCESS] Frontend bağımlılıkları yüklendi${NC}"
    else
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
    fil
    sı oluşturuldu: frontend/assets/variables.scss${NC}"
    # Backend bağımlılıkları:${NC}""
    echo -e "${YELLOW}[INFO] Backend bağımlılıkları yükleniyor...${NC}"echo -e "${BLUE}./scripts/start.sh restart${NC}"else
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        echo -e "${GREEN}[SUCCESS] Backend bağımlılıkları yüklendi${NC}"
    elseho -e "${YELLOW}[INFO] Tüm node_modules bağımlılıkları yükleniyor...${NC}" [ -d "modules" ]; then
        echo -e "${RED}[ERROR] Backend dizini bulunamadı${NC}"
    fi
    mlılıkları yükleniyor...${NC}"{module_dir} bağımlılıkları yükleniyor...${NC}"
    # Modül bağımlılıkları
    echo -e "${YELLOW}[INFO] Modül bağımlılıkları kontrol ediliyor...${NC}"
    if [ -d "modules" ]; then
        for module_dir in modules/*/; do  cd ..          echo -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"
            if [ -f "${module_dir}package.json" ]; thenklendi${NC}"
                echo -e "${YELLOW}[INFO] ${module_dir} bağımlılıkları yükleniyor...${NC}"
                cd "${module_dir}"] Frontend dizini bulunamadı${NC}"
                npm install
                cd ../../
                echo -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"
            fiho -e "${YELLOW}[INFO] Backend bağımlılıkları yükleniyor...${NC}"
        doneif [ -d "backend" ]; thenm bağımlılıkları ve yüklenen dosyaları temizle
    fi
    
    echo -e "${GREEN}[SUCCESS] Tüm bağımlılıklar yüklendi${NC}"
}rı yüklendi${NC}"

# Tüm bağımlılıkları ve yüklenen dosyaları temizlee node_modules klasörlerini silecek. Devam etmek istiyor musunuz? (E/H): " confirm
clean_all() {fiif [[ $confirm != [Ee] ]]; then
    print_logo
    echo -e "${YELLOW}[INFO] Temizleme işlemi başlatılıyor...${NC}"
     ediliyor...${NC}"
    # Onay mekanizması
    read -p "Bu işlem tüm Docker imajlarını, container'ları, ve node_modules klasörlerini silecek. Devam etmek istiyor musunuz? (E/H): " confirm
    if [[ $confirm != [Ee] ]]; thenson" ]; theneri durduruluyor ve container'lar siliniyor...${NC}"
        echo -e "${YELLOW}[INFO] Temizleme işlemi iptal edildi${NC}"ı yükleniyor...${NC}"
        return        cd "${module_dir}" -e "${GREEN}[SUCCESS] Docker servisleri durduruldu ve container'lar silindi${NC}"
    fi
              cd ../../Node modules klasörlerini sil
    # Docker container ve imajlarını durdur ve sil      echo -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"e "${YELLOW}[INFO] node_modules klasörleri siliniyor...${NC}"
    echo -e "${YELLOW}[INFO] Docker servisleri durduruluyor ve container'lar siliniyor...${NC}"
    docker-compose down -v --rmi all --remove-orphans
    echo -e "${GREEN}[SUCCESS] Docker servisleri durduruldu ve container'lar silindi${NC}"
     Frontend node_modules siliniyor...${NC}"
    # Node modules klasörlerini sil}"
    echo -e "${YELLOW}[INFO] node_modules klasörleri siliniyor...${NC}"SS] Frontend node_modules silindi${NC}"
    fi
    # Frontend node_modules
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}[INFO] Frontend node_modules siliniyor...${NC}"   print_logo   if [ -d "backend/node_modules" ]; then
        rm -rf frontend/node_modules  echo -e "${YELLOW}[INFO] Temizleme işlemi başlatılıyor...${NC}"      echo -e "${YELLOW}[INFO] Backend node_modules siliniyor...${NC}"
        echo -e "${GREEN}[SUCCESS] Frontend node_modules silindi${NC}"
    fi[SUCCESS] Backend node_modules silindi${NC}"
    u işlem tüm Docker imajlarını, container'ları, ve node_modules klasörlerini silecek. Devam etmek istiyor musunuz? (E/H): " confirm
    # Backend node_modules
    if [ -d "backend/node_modules" ]; then    echo -e "${YELLOW}[INFO] Temizleme işlemi iptal edildi${NC}"# Modüllerin node_modules klasörlerini sil
        echo -e "${YELLOW}[INFO] Backend node_modules siliniyor...${NC}"hen
        rm -rf backend/node_modules
        echo -e "${GREEN}[SUCCESS] Backend node_modules silindi${NC}"
    fi
    
    # Modüllerin node_modules klasörlerini silpose down -v --rmi all --remove-orphans
    if [ -d "modules" ]; thenUCCESS] Docker servisleri durduruldu ve container'lar silindi${NC}"sörlerini sil
        echo -e "${YELLOW}[INFO] Modül node_modules klasörleri siliniyor...${NC}"
        find modules -name "node_modules" -type d -exec rm -rf {} +e d -exec rm -rf {} +ini sil
        echo -e "${GREEN}[SUCCESS] Modül node_modules klasörleri silindi${NC}" "build" -type d -exec rm -rf {} +ELLOW}[INFO] node_modules klasörleri siliniyor...${NC}"
    finuxt" -type d -exec rm -rf {} +
    
    # Dist ve build klasörlerini siles" ]; then
    echo -e "${YELLOW}[INFO] Derleme çıktıları siliniyor...${NC}"es siliniyor...${NC}"
    find . -name "dist" -type d -exec rm -rf {} +
    find . -name "build" -type d -exec rm -rf {} +
    find . -name ".nuxt" -type d -exec rm -rf {} +en
    echo -e "${GREEN}[SUCCESS] Derleme çıktıları silindi${NC}" volume'ları siliniyor: $volumes${NC}"
    
    # Docker volume'ları listeleS] Docker volume'ları silindi${NC}"s" ]; then
    echo -e "${YELLOW}[INFO] Docker volume'ları kontrol ediliyor...${NC}"niyor...${NC}"
    volumes=$(docker volume ls -q --filter name=flax-erp)  echo -e "${YELLOW}[INFO] Silinecek Docker volume'u bulunamadı${NC}"  rm -rf backend/node_modules
    if [ -n "$volumes" ]; thens silindi${NC}"
        echo -e "${YELLOW}[INFO] Docker volume'ları siliniyor: $volumes${NC}"
        docker volume rm $volumes
        echo -e "${GREEN}[SUCCESS] Docker volume'ları silindi${NC}"
    else
        echo -e "${YELLOW}[INFO] Silinecek Docker volume'u bulunamadı${NC}"
    fie "${GREEN}[SUCCESS] .env dosyası silindi${NC}"odules -name "node_modules" -type d -exec rm -rf {} +
    S] Modül node_modules klasörleri silindi${NC}"
    # .env dosyasını sil
    if [ -f ".env" ]; then
        echo -e "${YELLOW}[INFO] .env dosyası siliniyor...${NC}"FO] Tüm bağımlılıklar ve kurulum dosyaları silindi. Yeniden başlatmak için './scripts/start.sh setup' komutunu kullanabilirsiniz.${NC}"rlerini sil
        rm -f .envarı siliniyor...${NC}"
        echo -e "${GREEN}[SUCCESS] .env dosyası silindi${NC}"
    fi
    setup_dev_environment() {    find . -name ".nuxt" -type d -exec rm -rf {} +
    echo -e "${GREEN}[SUCCESS] Temizleme işlemi tamamlandı!${NC}"
    echo -e "${YELLOW}[INFO] Tüm bağımlılıklar ve kurulum dosyaları silindi. Yeniden başlatmak için './scripts/start.sh setup' komutunu kullanabilirsiniz.${NC}"
}
ker volume'ları kontrol ediliyor...${NC}"
# Geliştirme ortamını kur command -v docker-compose &> /dev/null; thename=flax-erp)
setup_dev_environment() {
    print_logo.com/get-docker/${NC}"umes${NC}"
    echo -e "${YELLOW}[INFO] Geliştirme ortamı kuruluyor...${NC}"r Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"es
    
    # Docker kontrol
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; thenı${NC}"
        echo -e "${RED}[ERROR] Docker ve Docker Compose yüklü değil${NC}"lumunu yap
        echo -e "${YELLOW}Docker kurulumu için: https://docs.docker.com/get-docker/${NC}"
        echo -e "${YELLOW}Docker Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"
        exit 1
    fi
    
    # Node.js kurulumunu yapy SASS hatalarını önlemek için variables.scss dosyasını oluştur -e "${GREEN}[SUCCESS] .env dosyası silindi${NC}"
    setup_nodejs{NC}"
    
    # .env dosyasını kontrol et   # assets dizini kontrolü   echo -e "${GREEN}[SUCCESS] Temizleme işlemi tamamlandı!${NC}"
    check_env_file    if [ ! -d "frontend/assets" ]; then    echo -e "${YELLOW}[INFO] Tüm bağımlılıklar ve kurulum dosyaları silindi. Yeniden başlatmak için './scripts/start.sh setup' komutunu kullanabilirsiniz.${NC}"
    ruluyor...${NC}"
    # Vuetify SASS hatalarını önlemek için variables.scss dosyasını oluşturssets
    echo -e "${YELLOW}[INFO] Vuetify variables.scss dosyası oluşturuluyor...${NC}"amını kur
    
    # assets dizini kontrolües.scss oluşturmao
    if [ ! -d "frontend/assets" ]; thend/assets/variables.scss << EOFLLOW}[INFO] Geliştirme ortamı kuruluyor...${NC}"
        echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
        mkdir -p frontend/assets
    fi
    
    # variables.scss oluşturmaurulumu için: https://docs.docker.com/get-docker/${NC}"
    cat > frontend/assets/variables.scss << EOFimary: #3F51B5;    echo -e "${YELLOW}Docker Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"
// Vuetify için değişkenler
// Tema renklerini burada özelleştirebilirsiniz
@import '~vuetify/src/styles/styles.sass';
fo: #2196F3;# Node.js kurulumunu yap
// Ana renkler
\$primary: #3F51B5;
\$secondary: #00796B;  # .env dosyasını kontrol et
\$accent: #FFC107;
\$error: #F44336;
\$info: #2196F3;ly: 'Roboto', sans-serif;hatalarını önlemek için variables.scss dosyasını oluştur
\$success: #4CAF50;ı oluşturuluyor...${NC}"
\$warning: #FF9800;

// Tema ayarlarıCCESS] Vuetify variables.scss dosyası oluşturuldu${NC}"W}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
\$body-font-family: 'Roboto', sans-serif;
\$heading-font-family: 'Roboto', sans-serif;
\$border-radius-root: 4px;hen
EOFYELLOW}[INFO] frontend/assets/css dizini oluşturuluyor...${NC}"s oluşturma
ss << EOF
    echo -e "${GREEN}[SUCCESS] Vuetify variables.scss dosyası oluşturuldu${NC}"
    elleştirebilirsiniz
    # CSS ana dosyasını oluşturs oluşturmatify/src/styles/styles.sass';
    if [ ! -d "frontend/assets/css" ]; thensets/css/main.css << EOF
        echo -e "${YELLOW}[INFO] frontend/assets/css dizini oluşturuluyor...${NC}"obal CSS */
        mkdir -p frontend/assets/css
    fi
    07;
    # main.css oluşturmaoto', sans-serif;
    cat > frontend/assets/css/main.css << EOF
/* Frontend global CSS */
html, body {ve, .page-leave-active {00;
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
}ge-leave-to {amily: 'Roboto', sans-serif;

.page-enter-active, .page-leave-active {
  transition: opacity 0.3s;yası oluşturuldu${NC}"
}

.page-enter, .page-leave-to {
  opacity: 0;arı yükleLLOW}[INFO] frontend/assets/css dizini oluşturuluyor...${NC}"
}pendencies-p frontend/assets/css
EOF

    echo -e "${GREEN}[SUCCESS] CSS dosyası oluşturuldu${NC}"FO] Docker imajları oluşturuluyor...${NC}"
    e buildd/assets/css/main.css << EOF
    # Tüm bağımlılıkları yükle
    install_dependencies{GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"
    leri başlatmak için: ./scripts/start.sh start${NC}"
    # Docker imajlarını oluştur
    echo -e "${YELLOW}[INFO] Docker imajları oluşturuluyor...${NC}"s-serif;
    docker-compose build
    
    echo -e "${GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"dırtive, .page-leave-active {
    echo -e "${BLUE}[INFO] Servisleri başlatmak için: ./scripts/start.sh start${NC}"
}
e kontrolü
# Ana fonksiyon; thenleave-to {
main() {
    # Logo yazdır
    print_logo
     oluşturuldu${NC}"
    # Parametre kontrolüleme
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi;imajlarını oluştur
    
    # Komut işleme
    case "$1" in
        help){GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"
            show_help            check_env_file    echo -e "${BLUE}[INFO] Servisleri başlatmak için: ./scripts/start.sh start${NC}"
            ;;            start_services}
        setup)            ;;
            setup_dev_environment        stop)# Ana fonksiyon
            ;;            stop_servicesmain() {
        start)            ;;    # Logo yazdır
            check_env_file
            start_services    restart_services
            ;;rolü
        stop))q 0 ]; then
            stop_services        show_status $2  # $2 parametresi - network, images, resources değerlerini alabilir    show_help
            ;;
        restart)
            restart_serviceslogs
            ;;leme
        status)  backend)se "$1" in
            show_status $2  # $2 parametresi ekledim - network, images, resources değerlerini alabilir        start_service backend    help)
            ;;
        logs))
            show_logstart_service frontend)
            ;;nment
        backend)
            start_service backendart_service db
            ;;
        frontend)l-deps)art_services
            start_service frontendstall_dependencies
            ;;
        db)
            start_service dbean_all
            ;;;rt)
        install-deps)
            install_dependenciestup_nodejs
            ;;
        clean)ametresi ekledim - network, images, resources değerlerini alabilir
            clean_allx_webpack
            ;;
        setup-node)
            setup_nodejsx_vuetify_sass
            ;;;nd)
        fix-webpack)d
            fix_webpackho -e "${RED}[ERROR] Bilinmeyen komut: $1${NC}"
            ;;_help)
        fix-vuetify)
            fix_vuetify_sass
            ;;
        *)
            echo -e "${RED}[ERROR] Bilinmeyen komut: $1${NC}"
            show_helpalıştırtall-deps)
            exit 1            ;;    esac}# Scripti çalıştırmain "$@"