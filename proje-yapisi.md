# Flax-ERP Proje Yapısı

## Genel Bakış

Flax-ERP, modüler mimariye sahip bir kurumsal kaynak planlama (ERP) sistemidir. Proje, frontend ve backend olarak iki ana bileşenden oluşur ve modüler bir yapıda geliştirilmiştir.

## Klasör Yapısı

```
flax-erp/
├── backend/               # NestJS backend uygulaması
│   ├── src/               # Kaynak kodlar
│   │   ├── app.module.ts  # Ana modül
│   │   ├── auth/          # Kimlik doğrulama modülü
│   │   ├── users/         # Kullanıcı yönetimi modülü
│   │   ├── credits/       # Kredi sistemi modülü
│   │   └── modules/       # Modül yönetimi
│   ├── package.json       # Bağımlılıklar
│   └── tsconfig.json      # TypeScript konfigürasyonu
│
├── frontend/              # Nuxt.js frontend uygulaması
│   ├── assets/            # Statik dosyalar
│   ├── components/        # Vue bileşenleri
│   ├── layouts/           # Sayfa düzenleri
│   ├── middleware/        # Ara yazılımlar
│   ├── pages/             # Sayfalar
│   ├── plugins/           # Eklentiler
│   ├── static/            # Statik dosyalar
│   ├── nuxt.config.js     # Nuxt konfigürasyonu
│   └── package.json       # Bağımlılıklar
│
├── modules/               # ERP modülleri
│   ├── finance/           # Finans modülü
│   ├── inventory/         # Envanter yönetimi modülü
│   └── [diğer modüller]   # Diğer modüller
│
├── docker/                # Docker yapılandırmaları
│   ├── frontend/          # Frontend Docker yapılandırması
│   └── backend/           # Backend Docker yapılandırması
│
├── scripts/               # Betikler
│   └── start.sh           # Başlatma ve yönetim betiği
│
└── docker-compose.yml     # Docker Compose yapılandırması
```

## Teknoloji Yığını

- **Backend**: NestJS (Node.js), TypeScript
- **Frontend**: Nuxt.js, Vue.js, Vuetify
- **Veritabanı**: PostgreSQL
- **Dağıtım**: Docker & Docker Compose
- **API Dokümantasyonu**: Swagger

## Modüler Yapı

Her modül, kendi içinde bağımsız çalışabilen bir yapıdadır ve aşağıdaki bileşenlere sahiptir:

1. **Backend API**: NestJS controller, service ve entity dosyaları
2. **Frontend UI**: Vue.js bileşenleri ve sayfaları
3. **Veritabanı Modeli**: Entity tanımları

## Modül Geliştirme

Yeni bir modül eklemek için:

1. `modules/` klasörü altında yeni bir klasör oluşturun (örn: `modules/hr/`)
2. Backend için gerekli controller, service ve entity dosyalarını ekleyin
3. Frontend için gerekli bileşenleri ve sayfaları `frontend/pages/modules/[modül-adı]/` altında oluşturun
4. Modülü `backend/src/app.module.ts` dosyasına kaydedin

## Kimlik Doğrulama ve Yetkilendirme

Sistem, JWT tabanlı bir kimlik doğrulama mekanizması kullanır:

- `/auth/login` - Kullanıcı girişi
- `/auth/register` - Yeni kullanıcı kaydı
- `/auth/me` - Mevcut kullanıcı bilgisi

Her API isteği için JWT token kontrolü yapılır.

## Kredi Sistemi

Modüller, kredi sistemi üzerinden aktive edilir:

- Kullanıcılar kredi satın alabilir
- Krediler, modül aktivasyonu için kullanılır
- Kredi işlemleri transaction tablosunda takip edilir

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
