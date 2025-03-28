# Flax-ERP Live Test Ortamı Sorun Giderme Kılavuzu

Bu kılavuz, Flax-ERP live test ortamıyla ilgili yaygın sorunları çözmek için adımlar sağlar.

## 1. Konteynerler Çalışmıyor veya Erişilemiyor

### Belirtiler:
- "Frontend/Backend: Kısmen çalışıyor (HTTP 000offline)" mesajı
- Docker ps komutunda konteynerler görünmüyor

### Çözüm:
1. **Docker servislerini yeniden başlatın**:
   ```bash
   ./start.sh restart
   ```

2. **Sunucuda Docker servisini yeniden başlatın**:
   ```bash
   ssh root@88.218.130.67 "systemctl restart docker"
   ```

3. **Firewall kurallarını kontrol edin**:
   ```bash
   ssh root@88.218.130.67 "ufw status"
   # Portlar açık değilse:
   ssh root@88.218.130.67 "ufw allow 3000/tcp && ufw allow 8080/tcp"
   ```

## 2. PostgreSQL Bağlantı Hataları

### Belirtiler:
- Backend loglarında "connection to PostgreSQL failed" hataları
- Konteynerler başlıyor ama kısa süre sonra kapanıyor

### Çözüm:
1. **PostgreSQL volume'unu temizleyin**:
   ```bash
   ssh root@88.218.130.67 "cd /home/flax-erp && docker-compose down -v && docker-compose up -d"
   ```

2. **PostgreSQL ayarlarını kontrol edin**:
   ```bash
   ssh root@88.218.130.67 "cat /home/flax-erp/.env | grep DB_"
   ```

## 3. Backend API Erişim Sorunları

### Belirtiler:
- Frontend çalışıyor ama API'ye bağlanamıyor
- API adresleri yanlış yapılandırılmış olabilir

### Çözüm:
1. **Frontend API yapılandırmasını kontrol edin**:
   ```bash
   ssh root@88.218.130.67 "cat /home/flax-erp/frontend/src/config/api.js"
   ```

2. **CORS ayarlarını kontrol edin**:
   ```bash
   ssh root@88.218.130.67 "cat /home/flax-erp/backend/src/main.ts | grep -A10 'enableCors'"
   ```

## 4. Docker Disk Alanı Sorunları

### Belirtiler:
- "no space left on device" hataları
- Konteynerler başlatılamıyor

### Çözüm:
1. **Docker disk alanını temizleyin**:
   ```bash
   ssh root@88.218.130.67 "docker system prune -af"
   ```

2. **Disk kullanımını kontrol edin**:
   ```bash
   ssh root@88.218.130.67 "df -h"
   ```

## 5. Kapsamlı Diagnostik ve Onarım

Sorunun ne olduğundan emin değilseniz, otomatik tanılama ve onarım araçlarını kullanın:

```bash
# Detaylı tanılama için:
./start.sh diag

# Yaygın sorunları otomatik onarım için:
./start.sh fix
```

## 6. Sıfırdan Başlama

Sorunlar devam ederse, projeyi sıfırdan yeniden yükleyin:

```bash
ssh root@88.218.130.67 "cd /home/flax-erp && docker-compose down -v"
./deploy-prod.sh
```

## 7. İletişim Bilgileri

Çözülemeyen sorunlar için yardım isteyin:

- Proje Yöneticisi: proje@flaxerp.com
- Sistem Yöneticisi: admin@flaxerp.com
- Telefon: +90 555 123 4567
