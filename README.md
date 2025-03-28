# Flax-ERP Projesi

Modüler ERP sistemi. Kredi tabanlı modül aktivasyonu ile istediğiniz kadar modül kullanabilirsiniz.

## Çalıştırma Talimatları

### Gereksinimler

- Docker
- Docker Compose

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/username/flax-erp.git
   cd flax-erp
   ```

2. Başlatma scriptine çalıştırma izni verin:
   ```bash
   chmod +x scripts/start.sh
   ```

3. Geliştirme ortamını kurun:
   ```bash
   ./scripts/start.sh setup
   ```

4. Servisleri başlatın:
   ```bash
   ./scripts/start.sh start
   ```

### Kullanılabilir Komutlar

- `./scripts/start.sh setup` - Geliştirme ortamını kurar
- `./scripts/start.sh start` - Tüm servisleri başlatır
- `./scripts/start.sh stop` - Tüm servisleri durdurur
- `./scripts/start.sh restart` - Tüm servisleri yeniden başlatır
- `./scripts/start.sh status` - Servislerin durumunu gösterir
- `./scripts/start.sh logs` - Servislerin loglarını gösterir
- `./scripts/start.sh install-deps` - Tüm bağımlılıkları yükler
- `./scripts/start.sh clean` - Tüm bağımlılıkları ve kurulum dosyalarını temizler

### Erişim Bilgileri

- Frontend: http://88.218.130.67:3000
- Backend API: http://88.218.130.67:3001/api
- API Dokümantasyonu: http://88.218.130.67:3001/api/docs

## Geliştirme Notları

### Node Modülleri

Bu proje, `node_modules` klasörlerini Git'e dahil etmez. Projeyi klonladıktan sonra aşağıdaki komutları kullanarak bağımlılıkları yükleyin:

```bash
# Frontend bağımlılıklarını yükle
cd frontend
npm install

# Backend bağımlılıklarını yükle
cd ../backend
npm install
```

Alternatif olarak, `./scripts/start.sh setup` komutu tüm bağımlılıkları otomatik olarak yükler.

### Temizleme İşlemi

Tüm node_modules klasörlerini, docker imajlarını ve container'ları, ve derleme çıktılarını temizlemek için:

```bash
./scripts/start.sh clean
```

Bu komut tüm bağımlılıkları ve kurulum dosyalarını temizler. Tamamlanan temizleme işleminden sonra, tekrar kurmak için `./scripts/start.sh setup` komutunu kullanabilirsiniz.

## Teknoloji Yığını

- **Backend**: NestJS (Node.js + TypeScript)
- **Frontend**: Nuxt.js + Vue.js + Vuetify
- **Veritabanı**: PostgreSQL
- **Deployment**: Docker & Docker Compose

## Modüller

- **Finans Yönetimi**: Fatura, müşteri, ödeme yönetimi
- **Envanter Yönetimi**: Ürün, kategori, stok takibi
- **CRM**: Müşteri ilişkileri yönetimi
- **İK Yönetimi**: Personel takibi
- **Proje Yönetimi**: Görev, zaman takibi
- **Raporlama**: İş analitiği ve raporlama

## Lisans

Bu proje özel lisans altında dağıtılmaktadır. Tüm haklar saklıdır.
