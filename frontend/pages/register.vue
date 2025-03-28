<template>
  <v-container fluid fill-height class="register-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card elevation="10" class="pa-6">
          <v-card-title class="text-h4 text-center">Hesap Oluştur</v-card-title>
          
          <v-stepper v-model="step" vertical>
            <v-stepper-step :complete="step > 1" step="1">
              Hesap Bilgileri
              <small>Kişisel bilgilerinizi girin</small>
            </v-stepper-step>

            <v-stepper-content step="1">
              <v-form ref="form1" @submit.prevent="goToStep2">
                <v-alert v-if="error" type="error" dense dismissible>
                  {{ error }}
                </v-alert>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="username"
                      label="Kullanıcı Adı"
                      prepend-icon="mdi-account"
                      :rules="[v => !!v || 'Kullanıcı adı gerekli', v => v.length >= 3 || 'En az 3 karakter olmalıdır']"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="email"
                      label="E-posta"
                      prepend-icon="mdi-email"
                      type="email"
                      :rules="[v => !!v || 'E-posta gerekli', v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin']"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="password"
                      label="Şifre"
                      prepend-icon="mdi-lock"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPassword ? 'text' : 'password'"
                      @click:append="showPassword = !showPassword"
                      :rules="[v => !!v || 'Şifre gerekli', v => v.length >= 6 || 'Şifre en az 6 karakter olmalıdır']"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="confirmPassword"
                      label="Şifre Tekrar"
                      prepend-icon="mdi-lock-check"
                      :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      @click:append="showConfirmPassword = !showConfirmPassword"
                      :rules="[
                        v => !!v || 'Şifre tekrarı gerekli',
                        v => v === password || 'Şifreler eşleşmiyor'
                      ]"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-btn color="primary" block x-large type="submit" :loading="loading">
                  Devam Et
                </v-btn>
              </v-form>
            </v-stepper-content>

            <v-stepper-step :complete="step > 2" step="2">
              Kullanım Şartları
              <small>Kullanım şartlarını ve gizlilik politikasını kabul edin</small>
            </v-stepper-step>

            <v-stepper-content step="2">
              <v-card class="mb-5" outlined>
                <v-card-text class="terms-text">
                  <h3>Kullanım Şartları</h3>
                  <p>Bu hizmetleri kullanarak, Flax-ERP'nin Kullanım Şartları ve Gizlilik Politikası'nı kabul etmiş olursunuz.</p>
                  
                  <h4>1. Hizmet Kullanımı</h4>
                  <p>Flax-ERP hizmetlerini kullanırken tüm yerel, ulusal ve uluslararası kanunlara ve düzenlemelere uymayı kabul ediyorsunuz.</p>
                  
                  <h4>2. Hesap Güvenliği</h4>
                  <p>Hesabınızın güvenliğinden ve hesabınız altında gerçekleştirilen tüm aktivitelerden siz sorumlusunuz.</p>
                  
                  <h4>3. Ödeme ve Abonelikler</h4>
                  <p>Kredi satın alma ve modül aktivasyonu işlemleri geri alınamaz. Ancak yasal hakkınız olan 14 günlük cayma süreniz vardır.</p>
                  
                  <h4>4. Veri Kullanımı</h4>
                  <p>Flax-ERP, hizmet kalitesini artırmak için anonim kullanım verilerini toplayabilir ve analiz edebilir.</p>
                  
                  <h3>Gizlilik Politikası</h3>
                  <p>Kişisel verileriniz, Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir. Detaylı bilgi için Gizlilik Politikamızı inceleyebilirsiniz.</p>
                </v-card-text>
              </v-card>

              <v-checkbox
                v-model="agreeTerms"
                color="primary"
                :rules="[v => !!v || 'Kullanım şartlarını kabul etmelisiniz']"
                label="Kullanım şartlarını ve gizlilik politikasını okudum ve kabul ediyorum"
                required
              ></v-checkbox>

              <div class="d-flex justify-space-between mt-5">
                <v-btn text @click="step = 1">
                  Geri
                </v-btn>
                <v-btn 
                  color="primary" 
                  :disabled="!agreeTerms" 
                  :loading="loading"
                  @click="register"
                >
                  Kaydol
                </v-btn>
              </div>
            </v-stepper-content>

            <v-stepper-step step="3">
              Tamamlandı
              <small>Hesabınız başarıyla oluşturuldu</small>
            </v-stepper-step>

            <v-stepper-content step="3">
              <v-card class="mb-5 text-center py-5" outlined>
                <v-icon size="80" color="success">mdi-check-circle</v-icon>
                <v-card-title class="d-flex justify-center">Hesabınız Oluşturuldu!</v-card-title>
                <v-card-text>
                  <p>Flax-ERP ailesine hoş geldiniz. Hesabınız başarıyla oluşturuldu.</p>
                  <p>Sizi dashboard sayfanıza yönlendiriyoruz...</p>
                </v-card-text>
              </v-card>

              <v-btn color="primary" block x-large to="/dashboard">
                Dashboard'a Git
              </v-btn>
            </v-stepper-content>
          </v-stepper>

          <div v-if="step < 3" class="mt-6 text-center">
            <span class="mr-2">Zaten bir hesabınız var mı?</span>
            <v-btn text color="primary" to="/login">
              Giriş Yap
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  layout: 'default',
  middleware: 'guest',
  data() {
    return {
      step: 1,
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      agreeTerms: false,
      loading: false,
      error: null
    }
  },
  methods: {
    goToStep2() {
      if (this.$refs.form1.validate()) {
        this.step = 2
      }
    },
    async register() {
      if (!this.agreeTerms) return
      
      this.loading = true
      this.error = null
      
      try {
        // Kayıt API isteği
        await this.$axios.post('/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        })
        
        // Otomatik giriş
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        
        // Başarılı kayıt ve giriş
        this.step = 3
        
        // 3 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          this.$router.push('/dashboard')
        }, 3000)
      } catch (error) {
        console.error('Kayıt hatası:', error)
        this.error = error.response?.data?.message || 'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.'
        this.step = 1 // Hatada ilk adıma dön
      } finally {
        this.loading = false
      }
    }
  },
  head() {
    return {
      title: 'Kaydol'
    }
  }
}
</script>

<style scoped>
.register-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px - 36px);
}
.terms-text {
  max-height: 300px;
  overflow-y: auto;
}
</style>
