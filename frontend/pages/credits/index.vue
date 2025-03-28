<template>
  <div>
    <h1 class="text-h4 mb-5">Kredi Satın Al</h1>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            Kredi Paketleri
          </v-card-title>
          <v-card-text>
            <p class="mb-4">
              Kredi satın alarak istediğiniz modülleri aktifleştirebilirsiniz. 
              Satın aldığınız krediler hesabınıza anında tanımlanır.
            </p>

            <v-row>
              <v-col 
                cols="12" 
                sm="6" 
                md="4" 
                v-for="(pkg, index) in creditPackages" 
                :key="index"
                class="mb-4"
              >
                <v-card 
                  class="d-flex flex-column h-100 package-card"
                  :class="{ 'best-value': pkg.isBestValue }"
                  outlined
                  :elevation="pkg.isBestValue ? 10 : 2"
                >
                  <div v-if="pkg.isBestValue" class="best-value-badge">
                    En Çok Tercih Edilen
                  </div>
                  <v-card-title class="primary--text">
                    {{ pkg.name }}
                  </v-card-title>
                  <v-card-text class="flex-grow-1">
                    <div class="text-h4 font-weight-bold text-center mb-4">
                      {{ formatCurrency(pkg.price) }}
                    </div>
                    <div class="text-center mb-3">
                      <v-chip color="primary" outlined>
                        {{ pkg.credits }} Kredi
                      </v-chip>
                    </div>
                    <v-divider class="my-3"></v-divider>
                    <ul class="pl-4">
                      <li v-for="(feature, featureIndex) in pkg.features" :key="featureIndex">
                        {{ feature }}
                      </li>
                    </ul>
                  </v-card-text>
                  <v-card-actions class="pa-4">
                    <v-btn 
                      block 
                      color="primary" 
                      :outlined="!pkg.isBestValue"
                      @click="selectPackage(pkg)"
                    >
                      Satın Al
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            Özel Kredi Paketi
          </v-card-title>
          <v-card-text>
            <p>İhtiyacınız olan miktarda kredi satın alabilirsiniz.</p>
            
            <v-row align="center" class="mb-4">
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="customAmount"
                  label="Kredi Miktarı"
                  type="number"
                  min="10"
                  :rules="[v => !!v || 'Kredi miktarı gerekli', v => v >= 10 || 'Minimum 10 kredi']"
                  outlined
                  @input="calculateCustomPackage"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-h5 font-weight-medium">
                  Toplam: {{ formatCurrency(customPackagePrice) }}
                </div>
              </v-col>
            </v-row>
            
            <v-btn 
              color="primary" 
              :disabled="customAmount < 10" 
              @click="selectCustomPackage"
            >
              Satın Al
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            Mevcut Krediniz
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="amber" large class="mr-2">mdi-coin</v-icon>
              <span class="text-h4">{{ userCredits }}</span>
            </div>
            <p class="mt-4">
              Bu krediler ile modül satın alabilir ve aktivasyonlarını gerçekleştirebilirsiniz.
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title>
            Son İşlemler
          </v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="(transaction, index) in recentTransactions" :key="index">
                <v-list-item-icon>
                  <v-icon :color="transaction.type === 'credit_purchase' ? 'green' : 'red'">
                    {{ transaction.type === 'credit_purchase' ? 'mdi-plus-circle' : 'mdi-minus-circle' }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ transaction.description }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(transaction.date) }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <span :class="transaction.type === 'credit_purchase' ? 'success--text' : 'error--text'">
                    {{ transaction.type === 'credit_purchase' ? '+' : '-' }}{{ transaction.amount }} Kredi
                  </span>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            Yardım ve Destek
          </v-card-title>
          <v-card-text>
            <p>Kredi satın alma veya kullanımı ile ilgili sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>
            <v-btn block text color="primary" class="mt-3" to="/support">
              <v-icon left>mdi-help-circle</v-icon>
              Destek İste
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ödeme Dialog -->
    <v-dialog v-model="paymentDialog" max-width="600px">
      <v-card>
        <v-card-title class="headline">
          Ödeme
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            <b>{{ selectedPackage ? selectedPackage.name : 'Özel Paket' }}</b> için ödeme işlemi gerçekleştiriliyor.
          </p>
          <p class="mb-4">
            <b>Toplam Tutar:</b> {{ formatCurrency(selectedPackage ? selectedPackage.price : customPackagePrice) }}
          </p>
          <p class="mb-4">
            <b>Alınacak Kredi:</b> {{ selectedPackage ? selectedPackage.credits : customAmount }}
          </p>

          <v-tabs v-model="paymentTab">
            <v-tab>Kredi Kartı</v-tab>
            <v-tab>Havale/EFT</v-tab>
          </v-tabs>

          <v-tabs-items v-model="paymentTab">
            <v-tab-item>
              <v-form ref="creditCardForm" class="mt-4">
                <v-text-field
                  v-model="paymentDetails.cardName"
                  label="Kart Üzerindeki İsim"
                  :rules="[v => !!v || 'Kart sahibi ismi gerekli']"
                  outlined
                ></v-text-field>
                
                <v-text-field
                  v-model="paymentDetails.cardNumber"
                  label="Kart Numarası"
                  :rules="[v => !!v || 'Kart numarası gerekli', v => /^\d{16}$/.test(v) || 'Geçerli bir kart numarası girin']"
                  outlined
                  maxlength="16"
                ></v-text-field>
                
                <v-row>
                  <v-col cols="6">
                    <v-select
                      v-model="paymentDetails.expiryMonth"
                      :items="monthOptions"
                      label="Son Kullanma Ay"
                      :rules="[v => !!v || 'Ay gerekli']"
                      outlined
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-select
                      v-model="paymentDetails.expiryYear"
                      :items="yearOptions"
                      label="Son Kullanma Yıl"
                      :rules="[v => !!v || 'Yıl gerekli']"
                      outlined
                    ></v-select>
                  </v-col>
                </v-row>
                
                <v-text-field
                  v-model="paymentDetails.cvv"
                  label="CVV"
                  type="password"
                  :rules="[v => !!v || 'CVV gerekli', v => /^\d{3,4}$/.test(v) || 'Geçerli bir CVV girin']"
                  outlined
                  maxlength="4"
                ></v-text-field>
              </v-form>
            </v-tab-item>
            
            <v-tab-item>
              <v-container class="mt-4">
                <p>Aşağıdaki banka hesaplarımıza havale/EFT yapabilirsiniz:</p>
                
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>XYZ Bank</v-list-item-title>
                      <v-list-item-subtitle>
                        Hesap Sahibi: Flax ERP Ltd.Şti.<br>
                        IBAN: TR12 3456 7890 1234 5678 9012 34
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>ABC Bank</v-list-item-title>
                      <v-list-item-subtitle>
                        Hesap Sahibi: Flax ERP Ltd.Şti.<br>
                        IBAN: TR98 7654 3210 9876 5432 1098 76
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                
                <p class="mt-4">
                  Ödeme açıklamasına kullanıcı adınızı veya e-posta adresinizi yazmayı unutmayın.
                  Ödemeniz kontrol edildikten sonra kredileriniz hesabınıza tanımlanacaktır.
                </p>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn 
            color="grey darken-1" 
            text 
            @click="paymentDialog = false"
          >
            İptal
          </v-btn>
          <v-btn 
            color="primary" 
            :disabled="paymentTab === 1"
            :loading="processingPayment"
            @click="processPayment"
          >
            {{ paymentTab === 0 ? 'Ödemeyi Tamamla' : 'Bildirimi Gönder' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ödeme Başarılı Dialog -->
    <v-dialog v-model="successDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">
          Ödeme Başarılı
        </v-card-title>
        <v-card-text class="text-center pa-5">
          <v-icon color="success" size="64">mdi-check-circle</v-icon>
          <p class="text-h6 mt-3">
            Ödemeniz başarıyla gerçekleştirildi!
          </p>
          <p>
            {{ selectedPackage ? selectedPackage.credits : customAmount }} kredi hesabınıza eklendi.
            Yeni krediniz: {{ userCredits + (selectedPackage ? selectedPackage.credits : customAmount) }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="confirmSuccess">
            Tamam
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
      userCredits: 50,
      customAmount: 50,
      customPackagePrice: 50,
      selectedPackage: null,
      paymentDialog: false,
      successDialog: false,
      processingPayment: false,
      paymentTab: 0,
      paymentDetails: {
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      },
      creditPackages: [
        {
          id: 1,
          name: 'Başlangıç Paketi',
          credits: 100,
          price: 100,
          features: [
            'Tek seferlik modül alımı için uygun',
            'Anında kredi aktarımı',
            '1 ay geçerlilik süresi'
          ]
        },
        {
          id: 2,
          name: 'Standart Paket',
          credits: 500,
          price: 450,
          isBestValue: true,
          features: [
            '%10 indirimli paket',
            'Çoklu modül aktivasyonu için uygun',
            'Anında kredi aktarımı',
            '3 ay geçerlilik süresi'
          ]
        },
        {
          id: 3,
          name: 'Premium Paket',
          credits: 1000,
          price: 850,
          features: [
            '%15 indirimli paket',
            'Tüm modülleri kullanmak için ideal',
            'Anında kredi aktarımı',
            '6 ay geçerlilik süresi',
            '7/24 öncelikli destek'
          ]
        }
      ],
      recentTransactions: [
        {
          type: 'credit_purchase',
          description: 'Kredi satın alma',
          amount: 100,
          date: '2023-10-15'
        },
        {
          type: 'module_purchase',
          description: 'Finans Modülü satın alma',
          amount: 100,
          date: '2023-10-15'
        },
        {
          type: 'credit_purchase',
          description: 'Kredi satın alma',
          amount: 250,
          date: '2023-09-22'
        },
        {
          type: 'module_purchase',
          description: 'Stok Modülü satın alma',
          amount: 80,
          date: '2023-09-20'
        }
      ],
      monthOptions: [
        '01', '02', '03', '04', '05', '06', 
        '07', '08', '09', '10', '11', '12'
      ],
      yearOptions: []
    }
  },
  created() {
    // Son Kullanma Yılı seçeneklerini oluştur (şu anki yıl + 10 yıl)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.yearOptions.push((currentYear + i).toString());
    }
  },
  async mounted() {
    try {
      // Kullanıcı kredisini API'den al (simülasyon için sabit değer kullanıyoruz)
      // const response = await this.$axios.get('/credits')
      // this.userCredits = response.data.amount;
      
      // Kullanıcı işlem geçmişini al (simülasyon için sabit değer kullanıyoruz)
      // const transactionsResponse = await this.$axios.get('/credits/transactions')
      // this.recentTransactions = transactionsResponse.data;
    } catch (error) {
      console.error('Kredi bilgileri alınırken hata oluştu:', error);
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
      }).format(amount);
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR');
    },
    calculateCustomPackage() {
      // Basit bir hesaplama: 1 kredi = 1 TL
      // Gerçek uygulamada daha karmaşık bir fiyatlandırma olabilir
      this.customPackagePrice = this.customAmount;
    },
    selectPackage(pkg) {
      this.selectedPackage = pkg;
      this.paymentDialog = true;
    },
    selectCustomPackage() {
      this.selectedPackage = null;
      this.paymentDialog = true;
    },
    async processPayment() {
      if (this.paymentTab === 0 && !this.$refs.creditCardForm.validate()) {
        return;
      }
      
      this.processingPayment = true;
      
      try {
        // API çağrısı yapılır (simülasyon için)
        // await this.$axios.post('/credits/purchase', {
        //   amount: this.selectedPackage ? this.selectedPackage.credits : this.customAmount,
        //   paymentMethod: this.paymentTab === 0 ? 'credit_card' : 'bank_transfer',
        //   paymentDetails: this.paymentTab === 0 ? this.paymentDetails : null
        // });
        
        // Simülasyon için timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this.paymentDialog = false;
        this.successDialog = true;
        
        // Gerçek uygulamada API'den güncel kredi bilgisini alırdık
        // Şimdilik manuel güncelleme yapıyoruz
        // const response = await this.$axios.get('/credits');
        // this.userCredits = response.data.amount;
      } catch (error) {
        console.error('Ödeme işlemi sırasında hata oluştu:', error);
        // Kullanıcıya hata mesajı göster
        alert('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        this.processingPayment = false;
      }
    },
    confirmSuccess() {
      // Başarılı ödeme sonrası kredi miktarını güncelle (simülasyon)
      const creditAmount = this.selectedPackage ? this.selectedPackage.credits : this.customAmount;
      this.userCredits += creditAmount;
      
      // Yeni işlemi işlem geçmişine ekle
      this.recentTransactions.unshift({
        type: 'credit_purchase',
        description: 'Kredi satın alma',
        amount: creditAmount,
        date: new Date().toISOString().split('T')[0]
      });
      
      this.successDialog = false;
      
      // Form ve seçimleri sıfırla
      this.selectedPackage = null;
      this.paymentTab = 0;
      this.paymentDetails = {
        cardName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      };
    }
  },
  head() {
    return {
      title: 'Kredi Satın Al'
    }
  }
}
</script>

<style scoped>
.package-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
}

.best-value {
  border: 2px solid #1976D2 !important;
}

.best-value-badge {
  position: absolute;
  top: 10px;
  right: 0;
  background-color: #1976D2;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
  transform: rotate(0deg);
  z-index: 1;
}
</style>
