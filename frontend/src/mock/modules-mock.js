/**
 * Mock modül verileri - geliştirme sırasında API olmadan çalışabilmek için
 */
export const getDefaultModules = () => [
  {
    id: '1',
    code: 'core',
    name: 'Çekirdek Sistem',
    description: 'Temel sistem bileşenleri ve gösterge paneli',
    isActive: true,
    isCore: true,
    version: '1.0.0',
    icon: 'DashboardIcon',
    route: '/dashboard',
    order: 1,
    category: 'Sistem'
  },
  {
    id: '2',
    code: 'users',
    name: 'Kullanıcı Yönetimi',
    description: 'Kullanıcı hesapları ve yetkilendirme',
    isActive: true,
    isCore: true,
    version: '1.0.0',
    icon: 'PeopleIcon',
    route: '/users',
    order: 2,
    category: 'Sistem',
    dependencies: ['core']
  },
  {
    id: '3',
    code: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve stok hareketleri',
    isActive: true, // Mock'ta aktif
    isCore: false,
    version: '1.0.0',
    icon: 'InventoryIcon',
    route: '/inventory',
    order: 3,
    category: 'Operasyon',
    dependencies: ['core']
  },
  {
    id: '4',
    code: 'sales',
    name: 'Satış Yönetimi',
    description: 'Siparişler, müşteriler ve faturalar',
    isActive: false, // Varsayılan olarak kapalı
    isCore: false,
    version: '1.0.0',
    icon: 'ShoppingCartIcon',
    route: '/sales',
    order: 4,
    category: 'Operasyon',
    dependencies: ['core', 'inventory']
  },
  {
    id: '5',
    code: 'purchasing',
    name: 'Satın Alma',
    description: 'Tedarikçiler ve satın alma siparişleri',
    isActive: false, // Varsayılan olarak kapalı
    isCore: false,
    version: '1.0.0',
    icon: 'ShoppingBasketIcon',
    route: '/purchasing',
    order: 5,
    category: 'Operasyon',
    dependencies: ['core', 'inventory']
  },
  {
    id: '6',
    code: 'finance',
    name: 'Finans',
    description: 'Ödemeler, tahsilatlar ve muhasebe',
    isActive: false, // Varsayılan olarak kapalı
    isCore: false,
    version: '1.0.0',
    icon: 'AccountBalanceIcon',
    route: '/finance',
    order: 6,
    category: 'Finans',
    dependencies: ['core']
  },
  {
    id: '7',
    code: 'reports',
    name: 'Raporlar',
    description: 'İş zekası ve raporlama araçları',
    isActive: false, // Varsayılan olarak kapalı
    isCore: false,
    version: '1.0.0',
    icon: 'BarChartIcon',
    route: '/reports',
    order: 7,
    category: 'Analiz',
    dependencies: ['core']
  },
  {
    id: '10',
    code: 'settings',
    name: 'Sistem Ayarları',
    description: 'Uygulama yapılandırması ve tercihler',
    isActive: true,
    isCore: true,
    version: '1.0.0',
    icon: 'SettingsIcon',
    route: '/settings',
    order: 10,
    category: 'Sistem',
    dependencies: ['core']
  }
];
