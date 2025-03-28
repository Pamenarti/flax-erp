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
    echo -e "${GREEN}[SUCCESS] Tüm servisler yeniden başlatıldı${NC}"}[INFO] Temel Servis Durumları:${NC}"
}   docker-compose ps
    
# Servis durumlarını göster kontrolü için ek parametre kontrolü
show_status() { = "network" ]; then
    echo -e "${YELLOW}[INFO] Servis durumları:${NC}"
    docker-compose ps
}       echo -e "\n${YELLOW}[INFO] Docker ağ durumu:${NC}"
        docker network ls
# Logları göster
show_logs() {\n${YELLOW}[INFO] Ağ bağlantıları:${NC}"
    echo -e "${YELLOW}[INFO] Servis logları gösteriliyor...${NC}"-v netstat &> /dev/null; then
    docker-compose logs -fo -e "${RED}Netstat komutu bulunamadı veya herhangi bir bağlantı yok${NC}"
}
 netstat kurulu değil.${NC}"
# Belirli bir servisi başlat       fi
start_service() {        
    service_name=$1ı durumu:${NC}"
    echo -e "${YELLOW}[INFO] $service_name servisi başlatılıyor...${NC}"nd -v ufw &> /dev/null; then
    docker-compose up -d $service_namew status
    echo -e "${GREEN}[SUCCESS] $service_name servisi başlatıldı${NC}"
}istem üzerinde UFW kurulu değil.${NC}"
        fi
# Node.js versiyonunu kontrol et ve gerekirse kur
setup_nodejs() {        echo -e "\n${YELLOW}[INFO] Frontend konteynerinin IP adresi:${NC}"
    print_logorkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-frontend 2>/dev/null || echo -e "${RED}Frontend konteyneri bulunamadı veya çalışmıyor${NC}"
    echo -e "${BLUE}Node.js Kurulumu${NC}"
    echo "========================================"eynerinin IP adresi:${NC}"
.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' flax-erp-backend 2>/dev/null || echo -e "${RED}Backend konteyneri bulunamadı veya çalışmıyor${NC}"
    REQUIRED_NODE_VERSION="20.11.1"  # .nvmrc dosyasında belirtilen versiyon
echo -e "\n${YELLOW}[INFO] Frontend logları (son 10 satır):${NC}"
    # NVM (Node Version Manager) kontrolü2>/dev/null || echo -e "${RED}Frontend konteyneri logları okunamadı${NC}"
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        echo -e "${GREEN}NVM zaten kurulu${NC}"
        export NVM_DIR="$HOME/.nvm"docker logs flax-erp-backend --tail 10 2>/dev/null || echo -e "${RED}Backend konteyneri logları okunamadı${NC}"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    elsePort erişim testleri:${NC}"
        echo -e "${YELLOW}NVM kuruluyor...${NC}"| echo -e "${RED}Frontend yerel olarak erişilebilir değil (localhost:3000)${NC}"
        # NVM Kurulumurontend IP üzerinden erişilebilir değil (127.0.0.1:3000)${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bashcurl -I http://localhost:3001/api -m 2 2>/dev/null || echo -e "${RED}Backend API yerel olarak erişilebilir değil (localhost:3001/api)${NC}"
        -m 3 2>/dev/null || echo -e "${RED}Frontend sunucu IP üzerinden erişilebilir değil (88.218.130.67:3000)${NC}"
        # NVM'i aktifleştir  
        export NVM_DIR="$HOME/.nvm"        echo -e "\n${YELLOW}[ÇÖZÜM ÖNERİLERİ]${NC}"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"rler çalışmıyorsa: ./scripts/start.sh restart"
        [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"ufw allow 3001/tcp"
        u varsa: frontend/nuxt.config.js dosyasında server.host ayarını '0.0.0.0' olarak kontrol edin"
        echo -e "${GREEN}NVM kuruldu${NC}"unları için: ./scripts/start.sh stop && ./scripts/start.sh start"
    fi    echo -e "5. Konteyner loglarını tam görmek için: docker logs flax-erp-frontend --follow"

    # Node.js sürümünü yükle
    echo -e "${YELLOW}Node.js $REQUIRED_NODE_VERSION sürümü kuruluyor...${NC}"ol et
    nvm install $REQUIRED_NODE_VERSION
    nvm use $REQUIRED_NODE_VERSIONCKER İMAJ DURUMU ======${NC}"
        docker images | grep -E 'flax-erp|postgres'
    # Global paketleri yükle, fakat sürümleri belirterek
    echo -e "${YELLOW}Npm paketleri yükleniyor...${NC}"
    npm install -g npm@10.2.4
    npm install -g @nestjs/cli@10.2.1    if [ "$1" = "resources" ]; then
    npm install -g typescript@5.3.3 KULLANIMI ======${NC}"
           echo -e "\n${YELLOW}[INFO] Docker disk kullanımı:${NC}"
    NODE_VERSION=$(node -v)        docker system df
    echo -e "${GREEN}Node.js ${NODE_VERSION} kuruldu ve aktif${NC}"
    echo -e "${GREEN}NPM $(npm -v) versiyonu kuruldu${NC}" "\n${YELLOW}[INFO] Konteyner kaynak kullanımı:${NC}"
 stats --no-stream
    echo -e "${GREEN}Kurulum tamamlandı!${NC}"
}{NC}"
        df -h
# Webpack sorunlarını düzelt
fix_webpack() {
    print_logo
    echo -e "${BLUE}Webpack Versiyon Düzeltme${NC}"
    echo "========================================"}

    if [ ! -d "frontend" ]; then# Logları göster
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
        return 1...${NC}"
    fif

    cd frontend

    # Webpack v4'ü yükle
    echo -e "${YELLOW}Webpack 4.46.0 yükleniyor...${NC}"
    npm uninstall webpacktılıyor...${NC}"
    npm install webpack@4.46.0 --save-dev    docker-compose up -d $service_name
latıldı${NC}"
    # webpack-dev-middleware gibi diğer ilgili paketleri de düzelt
    echo -e "${YELLOW}İlgili bağımlılıklar düzeltiliyor...${NC}"
    npm uninstall webpack-dev-middleware# Node.js versiyonunu kontrol et ve gerekirse kur
    npm install webpack-dev-middleware@^4.3.0 --save-devejs() {
   print_logo
    echo -e "${GREEN}Webpack versiyonu düzeltildi!${NC}"    echo -e "${BLUE}Node.js Kurulumu${NC}"
    echo -e "${YELLOW}Projeyi yeniden oluşturun:${NC}"=================="
    echo -e "${BLUE}./scripts/start.sh restart${NC}"
ODE_VERSION="20.11.1"  # .nvmrc dosyasında belirtilen versiyon
    cd ..
}
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
# Vuetify SASS hatalarını düzelten kurulu${NC}"
fix_vuetify_sass() {
    print_logoVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    echo -e "${BLUE}Vuetify SASS Import Düzeltme${NC}"se
    echo "========================================"        echo -e "${YELLOW}NVM kuruluyor...${NC}"

    if [ ! -d "frontend" ]; thencontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
        return 1
    fi  export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    # assets dizini kontrolümpletion" ] && \. "$NVM_DIR/bash_completion"
    if [ ! -d "frontend/assets" ]; then
        echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
        mkdir -p frontend/assets
    fi

    # variables.scss oluşturma    echo -e "${YELLOW}Node.js $REQUIRED_NODE_VERSION sürümü kuruluyor...${NC}"
    echo -e "${YELLOW}[INFO] variables.scss dosyası oluşturuluyor...${NC}"l $REQUIRED_NODE_VERSION
    cat > frontend/assets/variables.scss << EOFED_NODE_VERSION
// Vuetify için değişkenler
// Tema renklerini burada özelleştirebilirsinizleri yükle, fakat sürümleri belirterek
@import '~vuetify/src/styles/styles.sass';LLOW}Npm paketleri yükleniyor...${NC}"
-g npm@10.2.4
// Ana renkler@nestjs/cli@10.2.1
\$primary: #3F51B5;typescript@5.3.3
\$secondary: #00796B;    
\$accent: #FFC107;=$(node -v)
\$error: #F44336;ON} kuruldu ve aktif${NC}"
\$info: #2196F3; kuruldu${NC}"
\$success: #4CAF50;
\$warning: #FF9800; echo -e "${GREEN}Kurulum tamamlandı!${NC}"
}
// Tema ayarları
\$body-font-family: 'Roboto', sans-serif;
\$heading-font-family: 'Roboto', sans-serif;
\$border-radius-root: 4px;   print_logo
EOF    echo -e "${BLUE}Webpack Versiyon Düzeltme${NC}"
=================="
    echo -e "${GREEN}[SUCCESS] variables.scss dosyası oluşturuldu: frontend/assets/variables.scss${NC}"
    echo -e "${YELLOW}[INFO] Şimdi servisleri yeniden başlatabilirsiniz:${NC}""frontend" ]; then
    echo -e "${BLUE}./scripts/start.sh restart${NC}"
}    return 1

# Tüm NPM bağımlılıklarını yükle
install_dependencies() {
    print_logo
    echo -e "${YELLOW}[INFO] Tüm node_modules bağımlılıkları yükleniyor...${NC}"yükle
    ${YELLOW}Webpack 4.46.0 yükleniyor...${NC}"
    # Frontend bağımlılıkları
    echo -e "${YELLOW}[INFO] Frontend bağımlılıkları yükleniyor...${NC}"install webpack@4.46.0 --save-dev
    if [ -d "frontend" ]; then
        cd frontendwebpack-dev-middleware gibi diğer ilgili paketleri de düzelt
        npm installecho -e "${YELLOW}İlgili bağımlılıklar düzeltiliyor...${NC}"
        cd ..v-middleware
        echo -e "${GREEN}[SUCCESS] Frontend bağımlılıkları yüklendi${NC}"
    else
        echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"EN}Webpack versiyonu düzeltildi!${NC}"
    fiOW}Projeyi yeniden oluşturun:${NC}"
    ${BLUE}./scripts/start.sh restart${NC}"
    # Backend bağımlılıkları
    echo -e "${YELLOW}[INFO] Backend bağımlılıkları yükleniyor...${NC}".
    if [ -d "backend" ]; then
        cd backend
        npm installetify SASS hatalarını düzelt
        cd ..
        echo -e "${GREEN}[SUCCESS] Backend bağımlılıkları yüklendi${NC}"
    elseASS Import Düzeltme${NC}"
        echo -e "${RED}[ERROR] Backend dizini bulunamadı${NC}"=========="
    fi
    
    # Modül bağımlılıklarıntend dizini bulunamadı${NC}"
    echo -e "${YELLOW}[INFO] Modül bağımlılıkları kontrol ediliyor...${NC}"
    if [ -d "modules" ]; then
        for module_dir in modules/*/; do
            if [ -f "${module_dir}package.json" ]; thenizini kontrolü
                echo -e "${YELLOW}[INFO] ${module_dir} bağımlılıkları yükleniyor...${NC}"d "frontend/assets" ]; then
                cd "${module_dir}"  echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
                npm install    mkdir -p frontend/assets
                cd ../../
                echo -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"
            fi    # variables.scss oluşturma
        doneı oluşturuluyor...${NC}"
    fintend/assets/variables.scss << EOF
    n değişkenler
    echo -e "${GREEN}[SUCCESS] Tüm bağımlılıklar yüklendi${NC}"
}ort '~vuetify/src/styles/styles.sass';

# Tüm bağımlılıkları ve yüklenen dosyaları temizle
clean_all() {
    print_logo
    echo -e "${YELLOW}[INFO] Temizleme işlemi başlatılıyor...${NC}"107;
    r: #F44336;
    # Onay mekanizmasıfo: #2196F3;
    read -p "Bu işlem tüm Docker imajlarını, container'ları, ve node_modules klasörlerini silecek. Devam etmek istiyor musunuz? (E/H): " confirm
    if [[ $confirm != [Ee] ]]; then
        echo -e "${YELLOW}[INFO] Temizleme işlemi iptal edildi${NC}"
        return
    fidy-font-family: 'Roboto', sans-serif;
    ns-serif;
    # Docker container ve imajlarını durdur ve sil
    echo -e "${YELLOW}[INFO] Docker servisleri durduruluyor ve container'lar siliniyor...${NC}"
    docker-compose down -v --rmi all --remove-orphans
    echo -e "${GREEN}[SUCCESS] Docker servisleri durduruldu ve container'lar silindi${NC}"ss dosyası oluşturuldu: frontend/assets/variables.scss${NC}"
    {NC}"
    # Node modules klasörlerini silsh restart${NC}"
    echo -e "${YELLOW}[INFO] node_modules klasörleri siliniyor...${NC}"
    
    # Frontend node_modulesm NPM bağımlılıklarını yükle
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}[INFO] Frontend node_modules siliniyor...${NC}"
        rm -rf frontend/node_modules..${NC}"
        echo -e "${GREEN}[SUCCESS] Frontend node_modules silindi${NC}"
    fi
    ho -e "${YELLOW}[INFO] Frontend bağımlılıkları yükleniyor...${NC}"
    # Backend node_modulesif [ -d "frontend" ]; then
    if [ -d "backend/node_modules" ]; then
        echo -e "${YELLOW}[INFO] Backend node_modules siliniyor...${NC}"
        rm -rf backend/node_modules
        echo -e "${GREEN}[SUCCESS] Backend node_modules silindi${NC}"${NC}"
    fi
      echo -e "${RED}[ERROR] Frontend dizini bulunamadı${NC}"
    # Modüllerin node_modules klasörlerini silfi
    if [ -d "modules" ]; then
        echo -e "${YELLOW}[INFO] Modül node_modules klasörleri siliniyor...${NC}"
        find modules -name "node_modules" -type d -exec rm -rf {} +rı yükleniyor...${NC}"
        echo -e "${GREEN}[SUCCESS] Modül node_modules klasörleri silindi${NC}"
    fi
    
    # Dist ve build klasörlerini sil    cd ..
    echo -e "${YELLOW}[INFO] Derleme çıktıları siliniyor...${NC}"S] Backend bağımlılıkları yüklendi${NC}"
    find . -name "dist" -type d -exec rm -rf {} +
    find . -name "build" -type d -exec rm -rf {} +{NC}"
    find . -name ".nuxt" -type d -exec rm -rf {} +
    echo -e "${GREEN}[SUCCESS] Derleme çıktıları silindi${NC}"
    
    # Docker volume'ları listele..${NC}"
    echo -e "${YELLOW}[INFO] Docker volume'ları kontrol ediliyor...${NC}" -d "modules" ]; then
    volumes=$(docker volume ls -q --filter name=flax-erp)
    if [ -n "$volumes" ]; then      if [ -f "${module_dir}package.json" ]; then
        echo -e "${YELLOW}[INFO] Docker volume'ları siliniyor: $volumes${NC}"            echo -e "${YELLOW}[INFO] ${module_dir} bağımlılıkları yükleniyor...${NC}"
        docker volume rm $volumesdule_dir}"
        echo -e "${GREEN}[SUCCESS] Docker volume'ları silindi${NC}"l
    else
        echo -e "${YELLOW}[INFO] Silinecek Docker volume'u bulunamadı${NC}"ho -e "${GREEN}[SUCCESS] ${module_dir} bağımlılıkları yüklendi${NC}"
    fi
      done
    # .env dosyasını silfi
    if [ -f ".env" ]; then
        echo -e "${YELLOW}[INFO] .env dosyası siliniyor...${NC}"
        rm -f .env
        echo -e "${GREEN}[SUCCESS] .env dosyası silindi${NC}"
    fiüklenen dosyaları temizle
    
    echo -e "${GREEN}[SUCCESS] Temizleme işlemi tamamlandı!${NC}"
    echo -e "${YELLOW}[INFO] Tüm bağımlılıklar ve kurulum dosyaları silindi. Yeniden başlatmak için './scripts/start.sh setup' komutunu kullanabilirsiniz.${NC}"}"
}
sı
# Geliştirme ortamını kur silecek. Devam etmek istiyor musunuz? (E/H): " confirm
setup_dev_environment() {
    print_logo
    echo -e "${YELLOW}[INFO] Geliştirme ortamı kuruluyor...${NC}"
    
    # Docker kontrol
    if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then# Docker container ve imajlarını durdur ve sil
        echo -e "${RED}[ERROR] Docker ve Docker Compose yüklü değil${NC}" Docker servisleri durduruluyor ve container'lar siliniyor...${NC}"
        echo -e "${YELLOW}Docker kurulumu için: https://docs.docker.com/get-docker/${NC}"se down -v --rmi all --remove-orphans
        echo -e "${YELLOW}Docker Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"echo -e "${GREEN}[SUCCESS] Docker servisleri durduruldu ve container'lar silindi${NC}"
        exit 1
    fi klasörlerini sil
    echo -e "${YELLOW}[INFO] node_modules klasörleri siliniyor...${NC}"
    # Node.js kurulumunu yap
    setup_nodejs
    odules" ]; then
    # .env dosyasını kontrol etnd node_modules siliniyor...${NC}"
    check_env_file
    S] Frontend node_modules silindi${NC}"
    # Vuetify SASS hatalarını önlemek için variables.scss dosyasını oluştur
    echo -e "${YELLOW}[INFO] Vuetify variables.scss dosyası oluşturuluyor...${NC}"    
    # assets dizini kontrolü
    if [ ! -d "frontend/assets" ]; then
        echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"INFO] Backend node_modules siliniyor...${NC}"
        mkdir -p frontend/assets
    fi node_modules silindi${NC}"
    fi
    # variables.scss oluşturma
    cat > frontend/assets/variables.scss << EOFde_modules klasörlerini sil
// Vuetify için değişkenler ]; then
// Tema renklerini burada özelleştirebilirsiniz{YELLOW}[INFO] Modül node_modules klasörleri siliniyor...${NC}"
@import '~vuetify/src/styles/styles.sass';les -name "node_modules" -type d -exec rm -rf {} +
"${GREEN}[SUCCESS] Modül node_modules klasörleri silindi${NC}"
// Ana renkler
\$primary: #3F51B5;
\$secondary: #00796B;    # Dist ve build klasörlerini sil
\$accent: #FFC107;ELLOW}[INFO] Derleme çıktıları siliniyor...${NC}"
\$error: #F44336;-rf {} +
\$info: #2196F3;f {} +
\$success: #4CAF50;type d -exec rm -rf {} +
\$warning: #FF9800; echo -e "${GREEN}[SUCCESS] Derleme çıktıları silindi${NC}"

// Tema ayarları# Docker volume'ları listele
\$body-font-family: 'Roboto', sans-serif;cker volume'ları kontrol ediliyor...${NC}"
\$heading-font-family: 'Roboto', sans-serif;name=flax-erp)
\$border-radius-root: 4px;
EOFker volume'ları siliniyor: $volumes${NC}"
    echo -e "${GREEN}[SUCCESS] Vuetify variables.scss dosyası oluşturuldu${NC}"  docker volume rm $volumes
        echo -e "${GREEN}[SUCCESS] Docker volume'ları silindi${NC}"
    # CSS ana dosyasını oluştur
    if [ ! -d "frontend/assets/css" ]; thencker volume'u bulunamadı${NC}"
        echo -e "${YELLOW}[INFO] frontend/assets/css dizini oluşturuluyor...${NC}"
        mkdir -p frontend/assets/css
    fiosyasını sil
    .env" ]; then
    # main.css oluşturmav dosyası siliniyor...${NC}"
    cat > frontend/assets/css/main.css << EOF       rm -f .env
/* Frontend global CSS */        echo -e "${GREEN}[SUCCESS] .env dosyası silindi${NC}"
html, body {
  margin: 0;
  padding: 0;   echo -e "${GREEN}[SUCCESS] Temizleme işlemi tamamlandı!${NC}"
  font-family: 'Roboto', sans-serif;Tüm bağımlılıklar ve kurulum dosyaları silindi. Yeniden başlatmak için './scripts/start.sh setup' komutunu kullanabilirsiniz.${NC}"
}

.page-enter-active, .page-leave-active {eliştirme ortamını kur
  transition: opacity 0.3s;
}print_logo
.page-enter, .page-leave-to {eliştirme ortamı kuruluyor...${NC}"
  opacity: 0;
}# Docker kontrol
EOFdev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}[SUCCESS] CSS dosyası oluşturuldu${NC}"${NC}"
    W}Docker kurulumu için: https://docs.docker.com/get-docker/${NC}"
    # Tüm bağımlılıkları yükle    echo -e "${YELLOW}Docker Compose kurulumu için: https://docs.docker.com/compose/install/${NC}"
    install_dependencies
    
    # Docker imajlarını oluştur   
    echo -e "${YELLOW}[INFO] Docker imajları oluşturuluyor...${NC}"    # Node.js kurulumunu yap
    docker-compose builds
    
    echo -e "${GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"ını kontrol et
    echo -e "${BLUE}[INFO] Servisleri başlatmak için: ./scripts/start.sh start${NC}"file
}
arını önlemek için variables.scss dosyasını oluştur
# Ana fonksiyonFO] Vuetify variables.scss dosyası oluşturuluyor...${NC}"
main() {ni kontrolü
    # Logo yazdır"frontend/assets" ]; then
    print_logo  echo -e "${YELLOW}[INFO] frontend/assets dizini oluşturuluyor...${NC}"
        mkdir -p frontend/assets
    # Parametre kontrolü
    if [ $# -eq 0 ]; then
        show_helpes.scss oluşturma
        exit 0sets/variables.scss << EOF
    fin değişkenler
    rini burada özelleştirebilirsiniz
    # Komut işlemees.sass';
    case "$1" in
        help)
            show_help
            ;;
        setup)107;
            setup_dev_environment336;
            ;;
        start)AF50;
            check_env_file00;
            start_services
            ;;rı
        stop)ily: 'Roboto', sans-serif;
            stop_services'Roboto', sans-serif;
            ;;s-root: 4px;
        restart)
            restart_services[SUCCESS] Vuetify variables.scss dosyası oluşturuldu${NC}"
            ;;
        status)syasını oluştur
            show_statuss" ]; then
            ;;e "${YELLOW}[INFO] frontend/assets/css dizini oluşturuluyor...${NC}"
        logs)frontend/assets/css
            show_logs
            ;;
        backend)css oluşturma
            start_service backends/main.css << EOF
            ;;obal CSS */
        frontend)
            start_service frontend
            ;;
        db) 'Roboto', sans-serif;
            start_service db
            ;;
        install-deps) .page-leave-active {
            install_dependencies3s;
            ;;
        clean)eave-to {
            clean_all
            ;;
        setup-node)
            setup_nodejsS] CSS dosyası oluşturuldu${NC}"
            ;;
        fix-webpack)bağımlılıkları yükle
            fix_webpack
            ;;
        fix-vuetify)arını oluştur
            fix_vuetify_sass{YELLOW}[INFO] Docker imajları oluşturuluyor...${NC}"
            ;;er-compose build
        *)   
            echo -e "${RED}[ERROR] Bilinmeyen komut: $1${NC}"    echo -e "${GREEN}[SUCCESS] Geliştirme ortamı kurulumu tamamlandı${NC}"
            show_helpE}[INFO] Servisleri başlatmak için: ./scripts/start.sh start${NC}"
            exit 1
            ;;






main "$@"# Scripti çalıştır}    esac# Ana fonksiyon
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
            show_status $2  # $2 parametresi ekledim - network, images, resources değerlerini alabilir
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


















main "$@"# Scripti çalıştır}    esac            ;;            exit 1            show_help            echo -e "${RED}[ERROR] Bilinmeyen komut: $1${NC}"        *)            ;;            fix_vuetify_sass        fix-vuetify)            ;;            fix_webpack        fix-webpack)            ;;        clean)
            clean_all
            ;;
        setup-node)
            setup_nodejs