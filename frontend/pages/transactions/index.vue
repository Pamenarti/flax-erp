<template>
  <div>
    <h1 class="text-h4 mb-5">İşlem Geçmişi</h1>
    
    <v-card>
      <v-card-title>
        Kredi İşlemleri
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Ara"
          single-line
          hide-details
          class="mx-4"
        ></v-text-field>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="transactions"
        :search="search"
        :loading="loading"
        :server-items-length="totalTransactions"
        :options.sync="options"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'items-per-page-text': 'Sayfa başına satır:'
        }"
        loading-text="İşlemler yükleniyor... Lütfen bekleyin"
        no-data-text="İşlem geçmişi bulunamadı"
      >
        <template v-slot:item.type="{ item }">
          <v-chip
            small
            :color="item.type === 'credit_purchase' ? 'green' : 'blue'"
            text-color="white"
          >
            {{ getTransactionTypeText(item.type) }}
          </v-chip>
        </template>
        <template v-slot:item.amount="{ item }">
          <span :class="item.type === 'credit_purchase' ? 'success--text' : 'primary--text'">
            {{ item.type === 'credit_purchase' ? '+' : '-' }} {{ item.amount }}
          </span>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  layout: 'dashboard',
  middleware: 'auth',
  data() {
    return {
      search: '',
      loading: false,
      transactions: [],
      totalTransactions: 0,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true]
      },
      headers: [
        { text: 'İşlem Tipi', value: 'type', sortable: true },
        { text: 'Miktar', value: 'amount', sortable: true },
        { text: 'Açıklama', value: 'description', sortable: true },
        { text: 'Tarih', value: 'created_at', sortable: true }
      ]
    }
  },
  watch: {
    options: {
      handler() {
        this.loadTransactions()
      },
      deep: true
    }
  },
  mounted() {
    this.loadTransactions()
  },
  methods: {
    getTransactionTypeText(type) {
      if (type === 'credit_purchase') return 'Kredi Alımı'
      if (type === 'module_purchase') return 'Modül Alımı'
      return type
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async loadTransactions() {
      this.loading = true
      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options
        
        // Gerçek API çağrısı
        // const response = await this.$axios.get('/credits/transactions', {
        //   params: {
        //     page,
        //     limit: itemsPerPage,
        //     sort: sortBy[0] || 'created_at',
        //     order: sortDesc[0] ? 'DESC' : 'ASC'
        //   }
        // })
        // this.transactions = response.data.data
        // this.totalTransactions = response.data.meta.total
        
        // Simülasyon verileri
        this.transactions = [
          {
            id: '1',
            type: 'credit_purchase',
            amount: 100,
            description: 'Kredi satın alma',
            created_at: '2023-10-15T14:30:00'
          },
          {
            id: '2',
            type: 'module_purchase',
            amount: 100,
            description: 'Finans Modülü satın alma',
            created_at: '2023-10-15T14:45:00'
          },
          {
            id: '3',
            type: 'credit_purchase',
            amount: 500,
            description: 'Kredi satın alma - Standart Paket',
            created_at: '2023-09-22T10:15:00'
          },
          {
            id: '4',
            type: 'module_purchase',
            amount: 80,
            description: 'Stok Modülü satın alma',
            created_at: '2023-09-20T15:30:00'
          },
          {
            id: '5',
            type: 'credit_purchase',
            amount: 50,
            description: 'Kredi satın alma - Özel Paket',
            created_at: '2023-09-10T09:45:00'
          }
        ]
        this.totalTransactions = this.transactions.length
      } catch (error) {
        console.error('İşlem geçmişi yüklenirken hata oluştu:', error)
        this.$toast.error('İşlem geçmişi yüklenirken bir hata oluştu')
      } finally {
        this.loading = false
      }
    }
  },
  head() {
    return {
      title: 'İşlem Geçmişi'
    }
  }
}
</script>
