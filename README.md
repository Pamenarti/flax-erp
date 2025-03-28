# Flax-ERP Projesi

Flax-ERP, modüler bir kurumsal kaynak planlama sistemidir. Web tabanlı platform üzerinden üyelik sistemi ile çeşitli modüller sağlar.

## Özellikler

- Şık ve modern kullanıcı arayüzü
- Modüler yapı ile genişletilebilir sistem
- Kredi tabanlı modül satın alma sistemi
- PostgreSQL veritabanı altyapısı
- Sağ tarafta yer alan sidebar navigasyon
- Kullanıcı dostu dashboard

## Teknolojiler

- **Frontend**: Nuxt.js, Vue.js
- **Backend**: Node.js, NestJS
- **Veritabanı**: PostgreSQL
- **Konteynerizasyon**: Docker, Docker Compose

## Başlangıç

Projeyi başlatmak için aşağıdaki adımları izleyin:

1. Projeyi klonlayın:
   ```
   git clone https://github.com/kullanici/flax-erp.git
   cd flax-erp
   ```

2. Geliştirme ortamını kurun:
   ```
   chmod +x scripts/start.sh
   ./scripts/start.sh setup
   ```

3. Servisleri başlatın:
   ```
   ./scripts/start.sh start
   ```

4. Tarayıcınızda aşağıdaki URL'lere erişin:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Adminer (DB Yönetimi): http://localhost:8080

## Modüler Yapı

Tüm ERP modülleri `modules/` dizini altında geliştirilir. Her modül aşağıdaki bileşenlere sahiptir:

1. Backend API endpoint'leri
2. Frontend UI bileşenleri
3. Veritabanı modelleri

## Yönetim Betiği

`./scripts/start.sh` betiği ile projeyi yönetebilirsiniz:

- `setup`: Geliştirme ortamını kurar
- `start`: Tüm servisleri başlatır
- `stop`: Tüm servisleri durdurur
- `restart`: Tüm servisleri yeniden başlatır
- `status`: Çalışan servislerin durumunu gösterir
- `logs`: Servis loglarını görüntüler
- `frontend`: Frontend servisini yeniden başlatır
- `backend`: Backend servisini yeniden başlatır
- `db`: Veritabanı servisini yeniden başlatır
- `shell`: Belirli bir servis için shell açar (örn: `./scripts/start.sh shell backend`)

## Sunucu Bilgileri

Canlı sunucumuz: 88.218.130.67
