#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Renksiz

echo -e "${BLUE}Flax-ERP Node.js Kurulumu${NC}"
echo "========================================"

# NVM (Node Version Manager) kontrolü
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo -e "${GREEN}NVM zaten kurulu${NC}"
    source "$HOME/.nvm/nvm.sh"
else
    echo -e "${YELLOW}NVM kuruluyor...${NC}"
    # NVM Kurulumu
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    
    # NVM'i aktifleştir
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    echo -e "${GREEN}NVM kuruldu${NC}"
fi

# .nvmrc dosyasından Node.js versiyonunu oku
if [ -f .nvmrc ]; then
    echo -e "${YELLOW}Node.js sürümü kuruluyor (.nvmrc dosyasından)...${NC}"
    nvm install
    nvm use
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js ${NODE_VERSION} kuruldu ve aktif${NC}"
else
    echo -e "${YELLOW}Node.js LTS sürümü kuruluyor...${NC}"
    nvm install --lts
    nvm use --lts
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}Node.js ${NODE_VERSION} kuruldu ve aktif${NC}"
    
    # .nvmrc dosyası oluştur
    node -v > .nvmrc
    echo -e "${GREEN}.nvmrc dosyası oluşturuldu${NC}"
fi

# Npm global paketlerini güncelle
echo -e "${YELLOW}Npm paketleri güncelleniyor...${NC}"
npm install -g npm@latest
npm install -g @nestjs/cli
npm install -g typescript

echo -e "${GREEN}Kurulum tamamlandı!${NC}"
echo -e "${YELLOW}Şimdi projeyi kurmak için şu komutu çalıştırın:${NC}"
echo -e "${BLUE}./scripts/start.sh setup${NC}"
