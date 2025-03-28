#!/bin/bash

# Renk tanımlamaları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Renksiz

echo -e "${BLUE}Flax-ERP Webpack Versiyon Düzeltme${NC}"
echo "========================================"

cd frontend

# Webpack v4'ü yükle
echo -e "${YELLOW}Webpack 4.46.0 yükleniyor...${NC}"
npm uninstall webpack
npm install webpack@4.46.0 --save-dev

# webpack-dev-middleware gibi diğer ilgili paketleri de düzelt
npm uninstall webpack-dev-middleware
npm install webpack-dev-middleware@^4.3.0 --save-dev

echo -e "${GREEN}Webpack versiyonu düzeltildi!${NC}"
echo -e "${YELLOW}Projeyi yeniden oluşturun:${NC}"
echo -e "${BLUE}./scripts/start.sh restart${NC}"

cd ..
