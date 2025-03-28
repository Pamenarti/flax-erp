<template>
  <div>
    <h1 class="text-h4 mb-5">Hoş Geldiniz, {{ $auth.user?.username }}</h1>

    <v-row>
      <v-col cols="12" md="6" lg="3">
        <v-card class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Bakiye</div>
              <v-list-item-title class="text-h4 mb-1">
                {{ userCredits }} Kredi
              </v-list-item-title>
              <v-list-item-subtitle>Mevcut bakiyeniz</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar size="60" color="primary">
              <v-icon dark large>mdi-cash-multiple</v-icon>
            </v-list-item-avatar>
          </v-list-item>
          <v-card-actions>
            <v-btn text color="primary" to="/credits">
              Kredi Satın Al
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Modüller</div>
              <v-list-item-title class="text-h4 mb-1">
                {{ userModules.length }}
              </v-list-item-title>
              <v-list-item-subtitle>Aktif modül sayısı</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar size="60" color="green">
              <v-icon dark large>mdi-puzzle</v-icon>
            </v-list-item-avatar>
          </v-list-item>
          <v-card-actions>
            <v-btn text color="green" to="/modules">
              Modülleri Görüntüle
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Son İşlem</div>
              <v-list-item-title class="text-h4 mb-1">
                {{ lastTransaction ? lastTransaction.date : 'Yok' }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ lastTransaction ? lastTransaction.description : 'Henüz işlem yapmadınız' }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar size="60" color="orange">
              <v-icon dark large>mdi-clock-outline</v-icon>
            </v-list-item-avatar>
          </v-list-item>
          <v-card-actions>
            <v-btn text color="orange" to="/transactions">
              Tüm İşlemler
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <v-card class="mx-auto" outlined>
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Destek</div>
              <v-list-item-title class="text-h4 mb-1">
                7/24
              </v-list-item-title>
              <v-list-item-subtitle>Müşteri desteği</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar size="60" color="blue">
              <v-icon dark large>mdi-headset</v-icon>
            </v-list-item-avatar>
          </v-list-item>
          <v-card-actions>
            <v-btn text color="blue" to="/support">
              Destek Al
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Aktif Modülleriniz
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
            :items="userModules"
            :search="search"
            :loading="loading"
            loading-text="Modüller yükleniyor... Lütfen bekleyin"
            no-data-text="Henüz aktif modülünüz bulunmamaktadır"
          >
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" small>
                {{ item.status }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn small text color="primary" :to="`/modules/${item.id}`">
                Görüntüle
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  layout: 'dashboard',
  middleware: 'auth',
  data() {
    return {
      userCredits: 0,
      userModules: [],
      lastTransaction: null,
      search: '',
      loading: true,
      headers: [
        { text: 'Modül Adı', value: 'name' },
        { text: 'Açıklama', value: 'description' },
        { text: 'Aktivasyon Tarihi', value: 'activated_at' },
        { text: 'Durum', value: 'status' },
        { text: 'İşlemler', value: 'actions', sortable: false }
      ]
    }
  },
  async mounted() {
    try {
      // Kullanıcı modüllerini getir
      const moduleResponse = await this.$axios.get('/user/modules')
      this.userModules = moduleResponse.data
      
      // Kullanıcı kredilerini getir
      const creditResponse = await this.$axios.get('/user/credits')
      this.userCredits = creditResponse.data.amount
      
      // Son işlemi getir
      const transactionResponse = await this.$axios.get('/user/transactions/last')
      this.lastTransaction = transactionResponse.data
      
      this.loading = false
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error)
      this.loading = false
    }
  },
  methods: {
    getStatusColor(status) {
      if (status === 'active') return 'green'
      if (status === 'inactive') return 'orange'
      if (status === 'expired') return 'red'
      return 'grey'
    }
  },
  head() {
    return {
      title: 'Dashboard'
    }
  }
}
</script>
