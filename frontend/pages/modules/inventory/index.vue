<template>
  <div>
    <h1 class="text-h4 mb-5">Stok ve Envanter Yönetimi</h1>

    <v-tabs v-model="activeTab" background-color="primary" dark grow>
      <v-tab>Dashboard</v-tab>
      <v-tab>Ürünler</v-tab>
      <v-tab>Kategoriler</v-tab>
      <v-tab>Stok Hareketleri</v-tab>
      <v-tab>Depolar</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <!-- Dashboard -->
      <v-tab-item>
        <v-container fluid>
          <v-row>
            <!-- Özet kartları -->
            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="primary">mdi-package-variant-closed</v-icon>
                  Toplam Ürün
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ totalProducts }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="green">mdi-store</v-icon>
                  Toplam Depo
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ totalWarehouses }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="orange">mdi-alert-circle</v-icon>
                  Kritik Stok
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ lowStockCount }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="blue">mdi-swap-horizontal</v-icon>
                  Bugünkü İşlemler
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ todaysMovementsCount }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Grafik ve raporlar -->
            <v-col cols="12" md="6">
              <v-card class="mb-4" outlined>
                <v-card-title>
                  Stok Hareketi Özeti
                  <v-spacer></v-spacer>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="refreshChart">
                        <v-list-item-title>Yenile</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="exportChart">
                        <v-list-item-title>Dışa Aktar</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-title>
                <v-card-text>
                  <v-img src="/images/inventory/stock-chart.png" height="250"></v-img>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="mb-4" outlined>
                <v-card-title>
                  Ürün Kategorileri
                  <v-spacer></v-spacer>
                  <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="refreshCategories">
                        <v-list-item-title>Yenile</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-title>
                <v-card-text>
                  <v-img src="/images/inventory/categories-chart.png" height="250"></v-img>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Kritik Stok Ürünleri -->
            <v-col cols="12">
              <v-card outlined>
                <v-card-title>
                  Kritik Stok Ürünleri
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text to="/modules/inventory/low-stock">
                    Tümünü Görüntüle
                  </v-btn>
                </v-card-title>
                <v-data-table
                  :headers="lowStockHeaders"
                  :items="lowStockProducts"
                  :items-per-page="5"
                  hide-default-footer
                >
                  <template v-slot:item.totalStock="{ item }">
                    <v-chip
                      small
                      :color="getStockStatusColor(item.totalStock, item.minStockLevel)"
                    >
                      {{ item.totalStock }}
                    </v-chip>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      small
                      text
                      color="primary"
                      :to="`/modules/inventory/products/${item.id}`"
                    >
                      Görüntüle
                    </v-btn>
                    <v-btn
                      small
                      text
                      color="green"
                      @click="openAddStockDialog(item)"
                    >
                      Stok Ekle
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>

      <!-- Ürünler -->
      <v-tab-item>
        <v-container fluid>
          <v-card>
            <v-card-title>
              Ürünler
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Ara"
                single-line
                hide-details
              ></v-text-field>
              <v-btn color="primary" class="ml-4" to="/modules/inventory/products/new">
                <v-icon left>mdi-plus</v-icon>
                Yeni Ürün
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="productHeaders"
              :items="products"
              :search="search"
              :loading="loading"
              :server-items-length="totalProductItems"
              :options.sync="options"
              loading-text="Ürünler yükleniyor... Lütfen bekleyin"
              no-data-text="Henüz ürün bulunmamaktadır"
              class="elevation-1"
            >
              <template v-slot:item.salePrice="{ item }">
                {{ formatCurrency(item.salePrice) }}
              </template>
              <template v-slot:item.totalStock="{ item }">
                <v-chip
                  small
                  :color="getStockStatusColor(item.totalStock, item.minStockLevel)"
                >
                  {{ item.totalStock }}
                </v-chip>
              </template>
              <template v-slot:item.isActive="{ item }">
                <v-chip
                  small
                  :color="item.isActive ? 'green' : 'red'"
                  text-color="white"
                >
                  {{ item.isActive ? 'Aktif' : 'Pasif' }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  small
                  text
                  color="primary"
                  :to="`/modules/inventory/products/${item.id}`"
                >
                  Görüntüle
                </v-btn>
                <v-btn
                  small
                  text
                  color="blue"
                  :to="`/modules/inventory/products/${item.id}/edit`"
                >
                  Düzenle
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-container>
      </v-tab-item>

      <!-- Kategori, Stok Hareketi ve Depo sekmeleri için yer ayırıcılar -->
      <v-tab-item>
        <v-container fluid>
          <h3>Kategoriler sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>

      <v-tab-item>
        <v-container fluid>
          <h3>Stok Hareketleri sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>

      <v-tab-item>
        <v-container fluid>
          <h3>Depolar sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>
    </v-tabs-items>

    <!-- Stok Ekleme Dialog -->
    <v-dialog v-model="addStockDialog" max-width="500px">
      <v-card>
        <v-card-title>Stok Ekle</v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <p>
                  <strong>Ürün:</strong> {{ selectedProduct ? selectedProduct.name : '' }}
                </p>
                <p>
                  <strong>Mevcut Stok:</strong> {{ selectedProduct ? selectedProduct.totalStock : 0 }}
                </p>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="stockMovement.warehouseId"
                  :items="warehouses"
                  item-text="name"
                  item-value="id"
                  label="Depo"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="stockMovement.quantity"
                  label="Miktar"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="stockMovement.reference"
                  label="Referans"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="stockMovement.notes"
                  label="Notlar"
                  rows="3"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="addStockDialog = false">
            İptal
          </v-btn>
          <v-btn 
            color="primary" 
            :loading="saving"
            @click="saveStockMovement"
          >
            Kaydet
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  layout: 'dashboard',
  middleware: 'auth',
  data() {
    return {
      activeTab: 0,
      search: '',
      loading: false,
      saving: false,
      totalProducts: 0,
      totalWarehouses: 0,
      lowStockCount: 0,
      todaysMovementsCount: 0,
      products: [],
      warehouses: [],
      lowStockProducts: [],
      totalProductItems: 0,
      addStockDialog: false,
      selectedProduct: null,
      stockMovement: {
        productId: '',
        warehouseId: '',
        quantity: 1,
        type: 'IN',
        date: new Date().toISOString().substr(0, 10),
        reference: '',
        notes: ''
      },
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['name'],
        sortDesc: [false]
      },
      productHeaders: [
        { text: 'SKU', value: 'sku' },
        { text: 'Ad', value: 'name' },
        { text: 'Kategori', value: 'category.name' },
        { text: 'Satış Fiyatı', value: 'salePrice' },
        { text: 'Toplam Stok', value: 'totalStock' },
        { text: 'Durum', value: 'isActive' },
        { text: 'İşlemler', value: 'actions', sortable: false }
      ],
      lowStockHeaders: [
        { text: 'SKU', value: 'sku' },
        { text: 'Ad', value: 'name' },
        { text: 'Minimum Stok', value: 'minStockLevel' },
        { text: 'Mevcut Stok', value: 'totalStock' },
        { text: 'İşlemler', value: 'actions', sortable: false }
      ]
    }
  },
  watch: {
    options: {
      handler() {
        this.loadProducts()
      },
      deep: true
    }
  },
  mounted() {
    this.loadDashboardData()
    this.loadProducts()
    this.loadLowStockProducts()
    this.loadWarehouses()
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
    },
    getStockStatusColor(currentStock, minStock) {
      if (currentStock <= 0) return 'red'
      if (currentStock < minStock) return 'orange'
      return 'green'
    },
    async loadDashboardData() {
      try {
        // API'den alınabilir, şimdilik örnek veriler
        this.totalProducts = 152
        this.totalWarehouses = 3
        this.lowStockCount = 12
        this.todaysMovementsCount = 28
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata oluştu:', error)
      }
    },
    async loadProducts() {
      this.loading = true
      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options
        
        // Simülasyon verileri
        this.products = [
          {
            id: '1',
            sku: 'P001',
            name: 'USB Bellek 32GB',
            category: { name: 'Bilgisayar Aksesuarları' },
            salePrice: 149.90,
            totalStock: 125,
            minStockLevel: 20,
            isActive: true
          },
          {
            id: '2',
            sku: 'P002',
            name: 'Bluetooth Kulaklık',
            category: { name: 'Ses Sistemleri' },
            salePrice: 249.90,
            totalStock: 48,
            minStockLevel: 15,
            isActive: true
          },
          {
            id: '3',
            sku: 'P003',
            name: 'Kablosuz Mouse',
            category: { name: 'Bilgisayar Aksesuarları' },
            salePrice: 129.90,
            totalStock: 13,
            minStockLevel: 25,
            isActive: true
          },
          {
            id: '4',
            sku: 'P004',
            name: 'Laptop Çantası',
            category: { name: 'Bilgisayar Aksesuarları' },
            salePrice: 179.90,
            totalStock: 32,
            minStockLevel: 10,
            isActive: true
          },
          {
            id: '5',
            sku: 'P005',
            name: 'HDMI Kablo 2m',
            category: { name: 'Kablolar' },
            salePrice: 79.90,
            totalStock: 8,
            minStockLevel: 20,
            isActive: true
          }
        ]
        
        this.totalProductItems = this.products.length
      } catch (error) {
        console.error('Ürünler yüklenirken hata oluştu:', error)
      } finally {
        this.loading = false
      }
    },
    async loadLowStockProducts() {
      try {
        // Simülasyon verileri - kritik stok seviyesinin altındaki ürünler
        this.lowStockProducts = this.products.filter(p => p.totalStock < p.minStockLevel)
      } catch (error) {
        console.error('Kritik stok ürünleri yüklenirken hata oluştu:', error)
      }
    },
    async loadWarehouses() {
      try {
        // Simülasyon verileri
        this.warehouses = [
          { id: '1', name: 'Ana Depo' },
          { id: '2', name: 'İstanbul Şube Deposu' },
          { id: '3', name: 'İzmir Şube Deposu' }
        ]
      } catch (error) {
        console.error('Depolar yüklenirken hata oluştu:', error)
      }
    },
    refreshChart() {
      // Grafik yenileme işlemi
      console.log('Grafik yenileniyor...')
    },
    exportChart() {
      // Grafik dışa aktarma işlemi
      console.log('Grafik dışa aktarılıyor...')
    },
    refreshCategories() {
      // Kategorileri yenileme işlemi
      console.log('Kategoriler yenileniyor...')
    },
    openAddStockDialog(product) {
      this.selectedProduct = product
      this.stockMovement.productId = product.id
      this.addStockDialog = true
    },
    async saveStockMovement() {
      if (!this.stockMovement.warehouseId || !this.stockMovement.quantity) {
        alert('Lütfen tüm zorunlu alanları doldurun')
        return
      }
      
      this.saving = true
      try {
        // API çağrısı yapılır
        // await this.$axios.post('/inventory/stock-movements', this.stockMovement)
        
        // Simülasyon
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Başarılı işlem
        this.addStockDialog = false
        
        // Stok güncelleme simülasyonu
        const productIndex = this.products.findIndex(p => p.id === this.selectedProduct.id)
        if (productIndex !== -1) {
          this.products[productIndex].totalStock += this.stockMovement.quantity
        }
        
        // Kritik stok ürünlerini güncelle
        this.loadLowStockProducts()
        
        // Mesaj göster
        alert('Stok hareketi başarıyla kaydedildi')
        
        // Formu sıfırla
        this.stockMovement = {
          productId: '',
          warehouseId: '',
          quantity: 1,
          type: 'IN',
          date: new Date().toISOString().substr(0, 10),
          reference: '',
          notes: ''
        }
      } catch (error) {
        console.error('Stok hareketi kaydedilirken hata oluştu:', error)
        alert('Stok hareketi kaydedilirken bir hata oluştu')
      } finally {
        this.saving = false
      }
    }
  },
  head() {
    return {
      title: 'Stok ve Envanter Yönetimi'
    }
  }
}
</script>

<style scoped>
/* Özel stiller buraya */
</style>
