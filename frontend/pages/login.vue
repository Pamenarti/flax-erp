<template>
  <v-container fluid fill-height class="login-container">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card elevation="10" class="pa-6">
          <v-card-title class="text-h4 text-center">Giriş Yap</v-card-title>
          
          <v-form @submit.prevent="login" ref="form">
            <v-card-text>
              <v-alert v-if="error" type="error" dense dismissible>
                {{ error }}
              </v-alert>

              <v-text-field
                v-model="email"
                label="E-posta"
                prepend-icon="mdi-email"
                type="email"
                :rules="[v => !!v || 'E-posta gerekli', v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin']"
                required
              ></v-text-field>

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

              <div class="d-flex justify-space-between align-center mb-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="Beni hatırla"
                  color="primary"
                  hide-details
                ></v-checkbox>
                <v-btn text small color="primary" to="/forgot-password">
                  Şifremi Unuttum
                </v-btn>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-btn
                block
                color="primary"
                x-large
                type="submit"
                :loading="loading"
              >
                Giriş Yap
              </v-btn>
            </v-card-actions>
          </v-form>

          <v-divider class="my-4"></v-divider>

          <div class="text-center">
            <span class="mr-2">Hesabınız yok mu?</span>
            <v-btn text color="primary" to="/register">
              Kaydol
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
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      if (!this.$refs.form.validate()) return
      
      this.loading = true
      this.error = null
      
      try {
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
        
        // Başarılı giriş sonrası dashboard'a yönlendir
        this.$router.push('/dashboard')
      } catch (error) {
        console.error('Giriş hatası:', error)
        this.error = error.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
      } finally {
        this.loading = false
      }
    }
  },
  head() {
    return {
      title: 'Giriş Yap'
    }
  }
}
</script>

<style scoped>
.login-container {
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px - 36px);
}
</style>
