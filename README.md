# Flax-ERP Sistemi

Flax-ERP, modern teknolojilerle geliştirilmiş, modüler bir kurumsal kaynak planlama sistemidir.

## Yerel Geliştirme Ortamı

Geliştirme ortamına aşağıdaki adreslerden erişebilirsiniz:

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000

## Test Kullanıcısı

Sistemi test etmek için:

- Kullanıcı Adı: `admin@flaxerp.com`
- Şifre: `admin123`

## Başlangıç

### Uygulamayı Yönetme

Uygulamayı kolayca yönetmek için start.sh scriptini kullanabilirsiniz:

```bash
# Uygulamayı başlatmak için:
./start.sh start

# Sistem durumunu kontrol etmek için:
./start.sh status

# Logları görüntülemek için:
./start.sh logs

# Uygulamayı durdurmak için:
./start.sh stop

# Yardım mesajını görmek için:
./start.sh help
```

### Lokal Docker ile Çalıştırma

Docker kurulu bir sistemde:

```bash
# Docker container'larını başlatın
docker-compose up -d
```

Tarayıcınızda http://localhost:8080 adresine giderek uygulamayı görebilirsiniz.

### Manuel Kurulum

1. PostgreSQL veritabanını kurun ve çalıştırın
2. Backend'i başlatın:
   ```bash
   cd backend
   npm install --legacy-peer-deps
   npm run start:dev
   ```
3. Frontend'i başlatın:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

## Mevcut Modüller

Şu an için test edebileceğiniz modüller:

- Kullanıcı Yönetimi (basit)
- Temel Dashboard

## Teknik Detaylar

- Backend: NestJS (TypeScript)
- Frontend: Next.js + React
- Veritabanı: PostgreSQL
- Kimlik Doğrulama: JWT
