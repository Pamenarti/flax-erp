<template>
  <div>
    <h1 class="text-h4 mb-5">İşlem Geçmişi</h1>

    <v-card>
      <v-card-title>
        İşlemleriniz
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Ara"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="transactions"
        :search="search"
        :loading="loading"
        :options.sync="options"
        :server-items-length="totalTransactions"
        :footer-props="{
          'items-per-page-options': [10, 25, 50],
          'items-per-page-text': 'Sayfa başına',
        }"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>İşlem Geçmişi</v-toolbar-title>
            <v-divider class="mx-4" vertical></v-divider>
            <v-btn-toggle
              v-model="filterType"
              mandatory
              class="mr-4"
            >
              <v-btn small value="all">Tümü</v-btn>
              <v-btn small value="credit">Kredi</v-btn>
              <v-btn small value="module">Modül</v-btn>
            </v-btn-toggle>
            
            <v-menu
              ref="dateMenu"
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  small
                  outlined
                  color="primary"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon left>mdi-calendar</v-icon>
                  {{ dateRangeText }}
                </v-btn>
              </template>
              <v-date-picker
                v-model="selectedDates"
                range
                scrollable
                @input="dateMenu = false"
              ></v-date-picker>
            </v-menu>
            
            <v-spacer></v-spacer>
            
            <v-btn
              small
              color="primary"
              outlined
              class="mr-2"
              @click="applyFilters"
            >
              <v-icon left>mdi-filter</v-icon>
              Filtrele
            </v-btn>
            
            <v-btn
              small
              color="grey darken-1"
              outlined
              @click="resetFilters"
            >
              <v-icon left>mdi-refresh</v-icon>
              Sıfırla
            </v-btn>
          </v-toolbar>
        </template>
        
        <template v-slot:item.type="{ item }">
          <v-chip
            small
            :color="getTypeColor(item.type)"
            text-color="white"
          >
            {{ getTypeText(item.type) }}
          </v-chip>
        </template>
        
        <template v-slot:item.amount="{ item }">
          <span :class="getAmountClass(item.type)">
            {{ item.type === 'credit_purchase' ? '+' : '-' }} {{ item.amount }}
          </span>
        </template>
        
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        
        <template v-slot:item.actions="{ item }">
          <v-btn
            x-small
            text
            color="primary"
            @click="showTransactionDetails(item)"
          >
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
        </template>
        
        <template v-slot:no-data>
          <v-alert
            :value="true"
            color="info"
            outlined
          >
            İşlem geçmişi bulunamadı.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- İşlem Detayları Dialog -->
    <v-dialog v-model="detailDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">İşlem Detayları</span>
        </v-card-title>
        
        <v-card-text v-if="selectedTransaction">
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr>
                  <td><strong>İşlem ID</strong></td>
                  <td>{{ selectedTransaction.id }}</td>
                </tr>
                <tr>
                  <td><strong>Tarih</strong></td>
                  <td>{{ formatDateTime(selectedTransaction.date) }}</td>
                </tr>
                <tr>
                  <td><strong>İşlem Türü</strong></td>
                  <td>
                    <v-chip
                      small
                      :color="getTypeColor(selectedTransaction.type)"
                      text-color="white"
                    >
                      {{ getTypeText(selectedTransaction.type) }}
                    </v-chip>
                  </td>
                </tr>
                <tr>
                  <td><strong>Açıklama</strong></td>
                  <td>{{ selectedTransaction.description }}</td>
                </tr>
                <tr>
                  <td><strong>Miktar</strong></td>
                  <td :class="getAmountClass(selectedTransaction.type)">
                    {{ selectedTransaction.type === 'credit_purchase' ? '+' : '-' }}
                    {{ selectedTransaction.amount }} Kredi
                  </td>
                </tr>
                <tr v-if="selectedTransaction.module">
                  <td><strong>Modül</strong></td>
                  <td>{{ selectedTransaction.module.name }}</td>
                </tr>
                <tr v-if="selectedTransaction.payment_method">
                  <td><strong>Ödeme Yöntemi</strong></td>
                  <td>{{ getPaymentMethodText(selectedTransaction.payment_method) }}</td>
                </tr>
                <tr v-if="selectedTransaction.status">
                  <td><strong>Durum</strong></td>
                  <td>
                    <v-chip
                      small
                      :color="getStatusColor(selectedTransaction.status)"
                      text-color="white"
                    >
                      {{ getStatusText(selectedTransaction.status) }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="detailDialog = false"
          >
            Kapat
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
      search: '',
      loading: false,
      totalTransactions: 0,
      transactions: [],
      selectedTransaction: null,
      detailDialog: false,
      dateMenu: false,
      selectedDates: [],
      filterType: 'all',
      
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['date'],
        sortDesc: [true]
      },
      
      headers: [
        { text: 'Tarih', value: 'date' },
        { text: 'İşlem Türü', value: 'type' },
        { text: 'Açıklama', value: 'description' },
        { text: 'Miktar', value: 'amount' },
        { text: 'Durum', value: 'status' },
        { text: 'İşlemler', value: 'actions', sortable: false }
      ]
    }
  },
  computed: {
    dateRangeText() {
      if (!this.selectedDates || this.selectedDates.length === 0) {
        return 'Tarih Seç';
      }
      
      if (this.selectedDates.length === 1) {
        return this.formatDate(this.selectedDates[0]);
      }
      
      return `${this.formatDate(this.selectedDates[0])} - ${this.formatDate(this.selectedDates[1])}`;
    }
  },
  watch: {
    options: {
      handler() {
        this.loadTransactions();
      },
      deep: true
    }
  },
  mounted() {
    this.loadTransactions();
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('tr-TR');
    },
    formatDateTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleString('tr-TR');
    },
    getTypeColor(type) {
      if (type === 'credit_purchase') return 'green';
      if (type === 'module_purchase') return 'blue';
      if (type === 'module_activation') return 'purple';
      if (type === 'refund') return 'orange';
      return 'grey';
    },
    getTypeText(type) {
      if (type === 'credit_purchase') return 'Kredi Alımı';
      if (type === 'module_purchase') return 'Modül Alımı';
      if (type === 'module_activation') return 'Modül Aktivasyonu';
      if (type === 'refund') return 'İade';
      return type;
    },
    getAmountClass(type) {
      if (type === 'credit_purchase' || type === 'refund') return 'success--text';
      return 'error--text';
    },
    getStatusColor(status) {
      if (status === 'completed') return 'green';
      if (status === 'pending') return 'orange';
      if (status === 'failed') return 'red';
      if (status === 'cancelled') return 'grey';
      return 'blue';
    },
    getStatusText(status) {
      if (status === 'completed') return 'Tamamlandı';
      if (status === 'pending') return 'Beklemede';
      if (status === 'failed') return 'Başarısız';
      if (status === 'cancelled') return 'İptal Edildi';
      return status;
    },
    getPaymentMethodText(method) {
      if (method === 'credit_card') return 'Kredi Kartı';
      if (method === 'bank_transfer') return 'Banka Havalesi';
      if (method === 'wallet') return 'Cüzdan';
      return method;
    },
    async loadTransactions() {
      this.loading = true;
      
      try {
        const { page, itemsPerPage, sortBy, sortDesc } = this.options;
        
        // API isteği gönderilir:
        // const response = await this.$axios.get('/user/transactions', {
        //   params: {
        //     page,
        //     limit: itemsPerPage,
        //     sort: sortBy[0] || 'date',
        //     order: sortDesc[0] ? 'DESC' : 'ASC',
        //     type: this.filterType !== 'all' ? this.filterType : undefined,
        //     dateFrom: this.selectedDates[0] || undefined,
        //     dateTo: this.selectedDates[1] || undefined
        //   }
        // });
        
        // Örnek veri (simülasyon):
        const mockTransactions = [
          {
            id: 'TRX123456',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            type: 'credit_purchase',
            description: 'Kredi Satın Alma',
            amount: 100,
            status: 'completed',
            payment_method: 'credit_card'
          },
          {
            id: 'TRX123457',
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            type: 'module_purchase',
            description: 'Finans Modülü Satın Alma',
            amount: 80,
            status: 'completed',
            module: { id: 1, name: 'Finans Modülü' }
          },
          {
            id: 'TRX123458',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            type: 'credit_purchase',
            description: 'Kredi Satın Alma',
            amount: 200,
            status: 'completed',
            payment_method: 'bank_transfer'
          },
          {
            id: 'TRX123459',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            type: 'module_purchase',
            description: 'Stok ve Envanter Modülü Satın Alma',
            amount: 90,
            status: 'completed',
            module: { id: 2, name: 'Stok ve Envanter Modülü' }
          },
          {
            id: 'TRX123460',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            type: 'module_activation',
            description: 'İnsan Kaynakları Modülü Aktivasyonu',
            amount: 0,
            status: 'completed',
            module: { id: 3, name: 'İnsan Kaynakları Modülü' }
          }
        ];
        
        // Filtreleme
        let filteredTransactions = [...mockTransactions];
        if (this.filterType !== 'all') {
          const typePrefix = this.filterType === 'credit' ? 'credit' : 'module';
          filteredTransactions = filteredTransactions.filter(t => t.type.startsWith(typePrefix));
        }
        
        if (this.selectedDates.length === 2) {
          const dateFrom = new Date(this.selectedDates[0]);
          const dateTo = new Date(this.selectedDates[1]);
          filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= dateFrom && transactionDate <= dateTo;
          });
        }
        
        this.transactions = filteredTransactions;
        this.totalTransactions = filteredTransactions.length;
      } catch (error) {
        console.error('İşlem geçmişi yüklenirken hata oluştu:', error);
      } finally {
        this.loading = false;
      }
    },
    showTransactionDetails(transaction) {
      this.selectedTransaction = transaction;
      this.detailDialog = true;
    },
    applyFilters() {
      this.options.page = 1; // İlk sayfaya dön
      this.loadTransactions();
    },
    resetFilters() {
      this.selectedDates = [];
      this.filterType = 'all';
      this.search = '';
      this.options.page = 1;
      this.loadTransactions();
    }
  },
  head() {
    return {
      title: 'İşlem Geçmişi'
    }
  }
}
</script>

<style scoped>
/* Özel stiller buraya */
</style>
