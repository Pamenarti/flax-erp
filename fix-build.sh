#!/bin/bash

# Renkli log mesajları için
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Flax-ERP Build Sorunu Düzeltme${NC}"
echo "----------------------------"

# TypeScript dosyalarını kontrol et ve oluştur
if [ ! -f "backend/tsconfig.json" ]; then
    echo -e "${YELLOW}Backend TypeScript konfigürasyon dosyası bulunamadı. Oluşturuluyor...${NC}"
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
    echo -e "${GREEN}tsconfig.json oluşturuldu.${NC}"
fi

if [ ! -f "backend/tsconfig.build.json" ]; then
    echo -e "${YELLOW}Backend tsconfig.build.json dosyası bulunamadı. Oluşturuluyor...${NC}"
    cat > backend/tsconfig.build.json << 'EOF'
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
EOF
    echo -e "${GREEN}tsconfig.build.json oluşturuldu.${NC}"
fi

# Docker imajlarını temizle
echo -e "${YELLOW}Mevcut Docker imajları temizleniyor...${NC}"
docker-compose down
docker system prune -f

# Yeniden başlat
echo -e "${YELLOW}Sistemi yeniden başlatma...${NC}"
docker-compose up -d

echo -e "${GREEN}İşlem tamamlandı. Durumu kontrol etmek için:${NC}"
echo -e "${BLUE}./start.sh status${NC}"
