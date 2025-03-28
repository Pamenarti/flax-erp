<template>
  <div>
    <h1 class="text-h4 mb-5">Finans Yönetimi</h1>

    <v-tabs v-model="activeTab" background-color="primary" dark grow>
      <v-tab>Dashboard</v-tab>
      <v-tab>Faturalar</v-tab>
      <v-tab>Müşteriler</v-tab>
      <v-tab>Ödemeler</v-tab>
      <v-tab>Raporlar</v-tab>
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
                  <v-icon left color="primary">mdi-cash-multiple</v-icon>
                  Toplam Gelir
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ formatCurrency(totalIncome) }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="green">mdi-bank</v-icon>
                  Toplanan Ödeme
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ formatCurrency(totalPaid) }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="orange">mdi-cash-clock</v-icon>
                  Açık Bakiye
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ formatCurrency(totalIncome - totalPaid) }}
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card class="mb-4" outlined>
                <v-card-title class="subtitle-1">
                  <v-icon left color="red">mdi-calendar-alert</v-icon>
                  Vadesi Geçenler
                </v-card-title>
                <v-card-text class="text-h5 text-center">
                  {{ formatCurrency(overdueAmount) }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Grafikler -->
            <v-col cols="12" md="6">
              <v-card class="mb-4" outlined>
                <v-card-title>
                  Aylık Gelir Özeti
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-img src="/images/finance/income-chart.png" height="250"></v-img>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card class="mb-4" outlined>
                <v-card-title>
                  En Çok İş Yapılan Müşteriler
                  <v-spacer></v-spacer>
                  <v-btn icon>
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <v-img src="/images/finance/customer-chart.png" height="250"></v-img>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Son faturalar -->
            <v-col cols="12">
              <v-card outlined>
                <v-card-title>
                  Son Faturalar
                  <v-spacer></v-spacer>
                  <v-btn color="primary" text to="/modules/finance/invoices">
                    Tüm Faturalar
                  </v-btn>
                </v-card-title>
                <v-data-table
                  :headers="invoiceHeaders"
                  :items="recentInvoices"
                  :items-per-page="5"
                  hide-default-footer
                >
                  <template v-slot:item.total_amount="{ item }">
                    {{ formatCurrency(item.total_amount) }}
                  </template>
                  <template v-slot:item.status="{ item }">
                    <v-chip
                      small
                      :color="getStatusColor(item.status)"
                      text-color="white"
                    >
                      {{ getStatusText(item.status) }}
                    </v-chip>
                  </template>
                  <template v-slot:item.actions="{ item }">
                    <v-btn
                      small
                      text
                      color="primary"
                      :to="`/modules/finance/invoices/${item.id}`"
                    >
                      Görüntüle
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>

      <!-- Faturalar -->
      <v-tab-item>
        <v-container fluid>
          <v-card>
            <v-card-title>
              Faturalar
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Ara"
                single-line
                hide-details
              ></v-text-field>
              <v-btn color="primary" class="ml-4" to="/modules/finance/invoices/new">
                <v-icon left>mdi-plus</v-icon>
                Yeni Fatura
              </v-btn>
            </v-card-title>
            <v-data-table
              :headers="invoiceHeaders"
              :items="invoices"
              :search="search"
              :loading="loading"
              :server-items-length="totalInvoices"
              :options.sync="options"
              loading-text="Faturalar yükleniyor... Lütfen bekleyin"
              no-data-text="Henüz fatura bulunmamaktadır"
            >
              <template v-slot:item.total_amount="{ item }">
                {{ formatCurrency(item.total_amount) }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  small
                  :color="getStatusColor(item.status)"
                  text-color="white"
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn
                  small
                  text
                  color="primary"
                  :to="`/modules/finance/invoices/${item.id}`"
                >
                  Görüntüle
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-container>
      </v-tab-item>

      <!-- Diğer sekmelerin içeriği... -->
      <v-tab-item>
        <v-container fluid>
          <h3>Müşteriler sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>

      <v-tab-item>
        <v-container fluid>
          <h3>Ödemeler sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>

      <v-tab-item>
        <v-container fluid>
          <h3>Raporlar sayfası geliyor...</h3>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
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
      totalInvoices: 0,
      invoices: [],
      recentInvoices: [],
      totalIncome: 45000,
      totalPaid: 32500,
      overdueAmount: 5800,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['invoice_date'],
        sortDesc: [true]
      },
      invoiceHeaders: [
        { text: 'Fatura No', value: 'invoice_number' },
        { text: 'Müşteri', value: 'customer.name' },
        { text: 'Tarih', value: 'invoice_date' },
        { text: 'Vade', value: 'due_date' },
        { text: 'Tutar', value: 'total_amount' },
        { text: 'Durum', value: 'status' },
        { text: 'İşlemler', value: 'actions', sortable: false }
      ]
    }
  },
  watch: {
    options: {
      handler() {
        this.loadInvoices()
      },
      deep: true
    }
  },
  mounted() {
    this.loadInvoices()
    this.loadRecentInvoices()
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
    },
    getStatusColor(status) {
      if (status === 'paid') return 'green'
      if (status === 'sent') return 'blue'
      if (status === 'draft') return 'grey'
      if (status === 'overdue') return 'red'
      if (status === 'cancelled') return 'black'
      return 'primary'
    },
    getStatusText(status) {
      if (status === 'paid') return 'Ödendi'
      if (status === 'sent') return 'Gönderildi'
      if (status === 'draft') return 'Taslak'
      if (status === 'overdue') return 'Gecikmiş'
      if (status === 'cancelled') return 'İptal'
      return status
    },
    async loadInvoices() {
      this.loading = true
      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options
        
        // Gerçek bir API çağrısı:
        // const response = await this.$axios.get('/finance/invoices', {
        //   params: {
        //     page,
        //     limit: itemsPerPage,
        //     sort: sortBy[0] || 'invoice_date',
        //     order: sortDesc[0] ? 'DESC' : 'ASC',
        //     search: this.search
        //   }
        // })
        
        // Simülasyon verileri
        const mockInvoices = [
          {
            id: '1',
            invoice_number: 'INV-2023-001',
            customer: { name: 'ABC Teknoloji Ltd.' },
            invoice_date: '2023-09-15',
            due_date: '2023-10-15',
            total_amount: 5000,
            status: 'paid'
          },
          {
            id: '2',
            invoice_number: 'INV-2023-002',
            customer: { name: 'XYZ Mühendislik A.Ş.' },
            invoice_date: '2023-09-20',
            due_date: '2023-10-20',
            total_amount: 7500,
            status: 'sent'
          },
          {
            id: '3',
            invoice_number: 'INV-2023-003',
            customer: { name: 'Yılmaz İnşaat' },
            invoice_date: '2023-09-25',
            due_date: '2023-10-25',
            total_amount: 12000,
            status: 'sent'
          },
          {
            id: '4',
            invoice_number: 'INV-2023-004',
            customer: { name: 'Anadolu Holding' },
            invoice_date: '2023-09-05',
            due_date: '2023-10-05',
            total_amount: 3500,
            status: 'overdue'
          },
          {
            id: '5',
            invoice_number: 'INV-2023-005',
            customer: { name: 'Kaplan Otomotiv' },
            invoice_date: '2023-09-10',
            due_date: '2023-10-10',
            total_amount: 9800,
            status: 'draft'
          }
        ]
        
        this.invoices = mockInvoices
        this.totalInvoices = mockInvoices.length
      } catch (error) {
        console.error('Faturalar yüklenirken hata oluştu:', error)
      } finally {
        this.loading = false
      }
    },
    async loadRecentInvoices() {
      try {
        // Gerçek bir API çağrısı:
        // const response = await this.$axios.get('/finance/invoices/recent')
        
        // Simülasyon verileri - en son 3 fatura
        this.recentInvoices = this.invoices.slice(0, 3)
      } catch (error) {
        console.error('Son faturalar yüklenirken hata oluştu:', error)
      }
    }
  },
  head() {
    return {
      title: 'Finans Yönetimi'
    }
  }
}
</script>

<style scoped>
/* Özel stiller buraya */
</style>
