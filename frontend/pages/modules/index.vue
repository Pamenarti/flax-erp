<template>
  <div>
    <h1 class="text-h4 mb-5">Modüller</h1>
    
    <v-tabs v-model="activeTab" background-color="primary" dark grow>
      <v-tab>Tüm Modüller</v-tab>
      <v-tab>Modüllerim</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item>
        <v-container fluid>
          <v-row>
            <v-col
              v-for="module in modules"
              :key="module.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="mx-auto"
                max-width="400"
                height="100%"
                :disabled="module.status === 'development'"
                :outlined="isModuleOwned(module.id)"
              >
                <v-img :src="module.image || '/images/module-placeholder.jpg'" height="180"></v-img>
                
                <v-card-title>
                  {{ module.name }}
                  <v-spacer></v-spacer>
                  <v-chip
                    small
                    :color="getModuleStatusColor(module.status)"
                    text-color="white"
                  >
                    {{ getModuleStatusText(module.status) }}
                  </v-chip>
                </v-card-title>
                
                <v-card-text>
                  <p>{{ module.description }}</p>
                  <v-divider class="my-3"></v-divider>
                  <div class="d-flex align-center">
                    <v-rating
                      :value="module.rating || 4.5"
                      color="amber"
                      dense
                      half-increments
                      readonly
                      size="14"
                    ></v-rating>
                    <span class="ml-2 grey--text text--darken-1">{{ module.reviews || 0 }} değerlendirme</span>
                  </div>
                </v-card-text>
                
                <v-card-actions>
                  <v-chip color="primary" outlined>
                    {{ module.price }} Kredi
                  </v-chip>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    text
                    :disabled="isModuleOwned(module.id) || module.status === 'development'"
                    @click="purchaseModule(module)"
                  >
                    {{ isModuleOwned(module.id) ? 'Satın Alındı' : 'Satın Al' }}
                  </v-btn>
                  <v-btn
                    text
                    :to="`/modules/${module.id}`"
                  >
                    Detaylar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
      
      <v-tab-item>
        <v-container fluid>
          <div v-if="userModules.length === 0" class="text-center my-10">
            <v-icon x-large color="grey">mdi-puzzle-outline</v-icon>
            <h2 class="text-h5 grey--text text--darken-1 mt-4">Henüz satın aldığınız bir modül bulunmamaktadır</h2>
            <v-btn color="primary" class="mt-4" @click="activeTab = 0">
              Modülleri İncele
            </v-btn>
          </div>
          
          <v-row v-else>
            <v-col
              v-for="module in userModules"
              :key="module.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                class="mx-auto"
                max-width="400"
                height="100%"
              >
                <v-img :src="module.image || '/images/module-placeholder.jpg'" height="180"></v-img>
                
                <v-card-title>
                  {{ module.name }}
                  <v-spacer></v-spacer>
                  <v-chip
                    small
                    color="green"
                    text-color="white"
                  >
                    Aktif
                  </v-chip>
                </v-card-title>
                
                <v-card-text>
                  <p>{{ module.description }}</p>
                  <v-divider class="my-3"></v-divider>
                  <p class="text-caption">
                    Aktivasyon Tarihi: {{ formatDate(module.activated_at) }}
                  </p>
                </v-card-text>
                
                <v-card-actions>
                  <v-btn
                    color="primary"
                    block
                    :to="`/modules/${module.id}`"
                  >
                    Modüle Git
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tab-item>
    </v-tabs-items>
    
    <!-- Satın Alma Dialog -->
    <v-dialog v-model="purchaseDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ selectedModule.name }} Modülünü Satın Al
        </v-card-title>
        <v-card-text>
          <p>Bu modülü {{ selectedModule.price }} kredi karşılığında satın alacaksınız.</p>
          <p class="mb-2">Mevcut krediniz: {{ userCredits }}</p>
          <v-alert
            v-if="userCredits < selectedModule.price"
            type="error"
            dense
          >
            Kredi bakiyeniz yetersiz. Lütfen kredi yükleyin.
          </v-alert>
          <v-alert
            v-else
            type="info"
            dense
          >
            Satın alma işleminden sonra kalan krediniz: {{ userCredits - selectedModule.price }} olacaktır.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="purchaseDialog = false">
            İptal
          </v-btn>
          <v-btn
            color="primary"
            :disabled="userCredits < selectedModule.price"
            :loading="purchaseLoading"
            @click="confirmPurchase"
          >
            Satın Al
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
      modules: [],
      userModules: [],
      userCredits: 0,
      purchaseDialog: false,
      purchaseLoading: false,
      selectedModule: {}
    }
  },
  async mounted() {
    try {
      // Tüm modülleri getir
      const modulesResponse = await this.$axios.get('/modules')
      this.modules = modulesResponse.data
      
      // Kullanıcının modüllerini getir
      const userModulesResponse = await this.$axios.get('/user/modules')
      this.userModules = userModulesResponse.data
      
      // Kullanıcının kredilerini getir
      const creditsResponse = await this.$axios.get('/user/credits')
      this.userCredits = creditsResponse.data.amount
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error)
    }
  },
  methods: {
    getModuleStatusColor(status) {
      if (status === 'active') return 'green'
      if (status === 'inactive') return 'orange'
      if (status === 'development') return 'grey'
      return 'primary'
    },
    getModuleStatusText(status) {
      if (status === 'active') return 'Aktif'
      if (status === 'inactive') return 'Pasif'
      if (status === 'development') return 'Geliştiriliyor'
      return status
    },
    isModuleOwned(moduleId) {
      return this.userModules.some(m => m.id === moduleId)
    },
    purchaseModule(module) {
      this.selectedModule = module
      this.purchaseDialog = true
    },
    async confirmPurchase() {
      this.purchaseLoading = true
      try {
        // Modül satın alma API isteği
        await this.$axios.post(`/modules/${this.selectedModule.id}/purchase`)
        
        // Kullanıcı kredilerini güncelle
        const creditsResponse = await this.$axios.get('/user/credits')
        this.userCredits = creditsResponse.data.amount
        
        // Kullanıcı modüllerini güncelle
        const userModulesResponse = await this.$axios.get('/user/modules')
        this.userModules = userModulesResponse.data
        
        this.purchaseDialog = false
        this.$toast.success('Modül başarıyla satın alındı!')
      } catch (error) {
        console.error('Satın alma sırasında hata oluştu:', error)
        this.$toast.error('Satın alma işlemi başarısız oldu')
      } finally {
        this.purchaseLoading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'Belirtilmedi'
      const date = new Date(dateString)
      return date.toLocaleDateString('tr-TR')
    }
  },
  head() {
    return {
      title: 'Modüller'
    }
  }
}
</script>
