# Flax-ERP Proje Yapısı

## Dizin Yapısı

```
flax-erp/
├── frontend/              # Nuxt.js frontend uygulaması
│   ├── components/        # Yeniden kullanılabilir UI bileşenleri
│   ├── layouts/           # Sayfa düzenleri (Default, Dashboard, vb.)
│   ├── middleware/        # Nuxt.js middleware dosyaları
│   ├── modules/           # Modüller için frontend bileşenleri
│   ├── pages/             # Uygulama sayfaları
│   ├── plugins/           # Uygulama eklentileri
│   ├── static/            # Statik dosyalar (favicon, vb.)
│   ├── store/             # Vuex mağazası
│   └── nuxt.config.js     # Nuxt yapılandırması
│
├── backend/               # NestJS backend uygulaması
│   ├── src/
│   │   ├── app.module.ts  # Ana modül
│   │   ├── modules/       # ERP modülleri
│   │   ├── auth/          # Kimlik doğrulama
│   │   ├── users/         # Kullanıcı yönetimi
│   │   ├── credits/       # Kredi sistemi
│   │   └── common/        # Ortak kullanılan dosyalar
│   └── nest-cli.json      # NestJS yapılandırması
│
├── modules/               # ERP modülleri (her modül kendi klasöründe)
│   ├── finance/           # Finans modülü
│   ├── inventory/         # Envanter modülü
│   ├── sales/             # Satış modülü
│   ├── hr/                # İnsan kaynakları modülü
│   └── ...                # Diğer modüller
│
├── docker/                # Docker yapılandırması
│   ├── frontend/          # Frontend Docker dosyaları
│   ├── backend/           # Backend Docker dosyaları
│   └── database/          # Veritabanı Docker dosyaları
│
├── scripts/               # Betikler
│   ├── start.sh           # Ana başlatma betiği
│   └── ...                # Diğer yardımcı betikler
│
├── docker-compose.yml     # Docker Compose yapılandırması
├── .env                   # Ortam değişkenleri
└── README.md              # Proje açıklaması
```

## Veritabanı Şeması (Temel)

```
users                    # Kullanıcılar tablosu
  - id
  - username
  - email
  - password_hash
  - role
  - created_at
  - updated_at

credits                  # Krediler tablosu
  - id
  - user_id
  - amount
  - created_at
  - updated_at

modules                  # Modüller tablosu
  - id
  - name
  - description
  - price
  - status
  - created_at
  - updated_at

user_modules            # Kullanıcı-Modül ilişkisi
  - id
  - user_id
  - module_id
  - activated_at
  - expires_at
  - status

transactions            # Kredi işlemleri
  - id
  - user_id
  - module_id
  - amount
  - type
  - created_at
```
