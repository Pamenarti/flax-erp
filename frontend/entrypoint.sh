#!/bin/sh
set -e

# İzinleri düzelt - doğrudan script çağırmak yerine burada yapıyoruz
echo "Fixing Next.js directory permissions..."
mkdir -p .next
chmod -R 777 /usr/src/app/.next
rm -rf /usr/src/app/.next/cache

# Node modules izinlerini kontrol et
if [ -d "/usr/src/app/node_modules" ]; then
  echo "Checking node_modules permissions..."
  chmod -R 755 /usr/src/app/node_modules
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
