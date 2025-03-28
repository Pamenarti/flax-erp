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
