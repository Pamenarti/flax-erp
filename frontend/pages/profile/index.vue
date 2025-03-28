<template>
  <div>
    <h1 class="text-h4 mb-5">Profil</h1>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-text class="text-center">
            <v-avatar size="120" color="primary">
              <span class="white--text text-h4">{{ userInitials }}</span>
            </v-avatar>
            <h2 class="text-h5 mt-4">{{ user.username }}</h2>
            <p class="text-body-1 grey--text">{{ user.email }}</p>
            <v-btn
              small
              outlined
              color="primary"
              class="mt-2"
              @click="uploadAvatarDialog = true"
            >
              <v-icon left>mdi-camera</v-icon>
              Profil Fotoğrafı Değiştir
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Kredi Bakiyesi
              </v-list-item-title>
              <v-list-item-subtitle>
                Mevcut krediniz
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-chip color="primary" outlined>
                {{ userCredits }} Kredi
              </v-chip>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn text block color="primary" to="/credits">
              <v-icon left>mdi-cash-plus</v-icon>
              Kredi Satın Al
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-h6">
                Aktif Modüller
              </v-list-item-title>
              <v-list-item-subtitle>
                Kullandığınız modüller
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-chip color="success" outlined>
                {{ userModules.length }}
              </v-chip>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="module in userModules" :key="module.id" :to="`/modules/${module.id}`">
              <v-list-item-icon>
                <v-icon color="primary">mdi-puzzle</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ module.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="userModules.length === 0">
              <v-list-item-content>
                <v-list-item-title class="text-center grey--text">Henüz modül satın almadınız</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn text block color="success" to="/modules">
              <v-icon left>mdi-puzzle-plus</v-icon>
              Modülleri İncele
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon left color="primary">mdi-account-edit</v-icon>
            Profil Bilgileri
          </v-card-title>
          <v-card-text>
            <v-form ref="profileForm" @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.username"
                    label="Kullanıcı Adı"
                    :rules="[v => !!v || 'Kullanıcı adı gerekli', v => v.length >= 3 || 'En az 3 karakter olmalıdır']"
                    required
                    :loading="updating"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.email"
                    label="E-posta Adresi"
                    type="email"
                    :rules="[v => !!v || 'E-posta gerekli', v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin']"
                    required
                    :loading="updating"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.fullName"
                    label="Tam Ad"
                    :loading="updating"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profileData.phone"
                    label="Telefon"
                    :loading="updating"
                    :disabled="updating"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="profileData.companyInfo"
                    label="Şirket Bilgisi"
                    rows="3"
                    :loading="updating"
                    :disabled="updating"
                  ></v-textarea>
                </v-col>
              </v-row>
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="updating"
              >
                Bilgileri Güncelle
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-lock</v-icon>
            Şifre Değiştir
          </v-card-title>
          <v-card-text>
            <v-form ref="passwordForm" @submit.prevent="updatePassword">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="passwordData.currentPassword"
                    label="Mevcut Şifre"
                    type="password"
                    :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showCurrentPassword = !showCurrentPassword"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    :rules="[v => !!v || 'Mevcut şifre gerekli']"
                    required
                    :loading="updatingPassword"
                    :disabled="updatingPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.newPassword"
                    label="Yeni Şifre"
                    :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showNewPassword = !showNewPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    :rules="[
                      v => !!v || 'Yeni şifre gerekli',
                      v => v.length >= 8 || 'Şifre en az 8 karakter olmalıdır',
                      v => /\d/.test(v) || 'Şifre en az bir rakam içermelidir',
                      v => /[A-Z]/.test(v) || 'Şifre en az bir büyük harf içermelidir'
                    ]"
                    required
                    :loading="updatingPassword"
                    :disabled="updatingPassword"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordData.confirmPassword"
                    label="Yeni Şifre (Tekrar)"
                    :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showConfirmPassword = !showConfirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    :rules="[
                      v => !!v || 'Şifre tekrarı gerekli',
                      v => v === passwordData.newPassword || 'Şifreler eşleşmiyor'
                    ]"
                    required
                    :loading="updatingPassword"
                    :disabled="updatingPassword"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-btn 
                color="primary" 
                type="submit" 
                :loading="updatingPassword"
              >
                Şifreyi Güncelle
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Profil Fotoğrafı Değiştirme Dialog -->
    <v-dialog v-model="uploadAvatarDialog" max-width="500px">
      <v-card>
        <v-card-title>Profil Fotoğrafı Değiştir</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="avatarFile"
            accept="image/*"
            label="Profil Fotoğrafı Seçin"
            prepend-icon="mdi-camera"
            show-size
            truncate-length="15"
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="uploadAvatarDialog = false">
            İptal
          </v-btn>
          <v-btn 
            color="primary" 
            @click="uploadAvatar"
            :loading="uploadingAvatar"
            :disabled="!avatarFile"
          >
            Yükle
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
      user: {
        username: '',
        email: ''
      },
      userCredits: 0,
      userModules: [],
      profileData: {
        username: '',
        email: '',
        fullName: '',
        phone: '',
        companyInfo: ''
      },
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      updating: false,
      updatingPassword: false,
      uploadAvatarDialog: false,
      avatarFile: null,
      uploadingAvatar: false
    }
  },
  computed: {
    userInitials() {
      if (!this.user.username) return '?';
      return this.user.username.charAt(0).toUpperCase();
    }
  },
  async mounted() {
    await this.loadUserData();
  },
  methods: {
    async loadUserData() {
      try {
        // Gerçek API çağrısı yerine simülasyon
        /*
        const userResponse = await this.$axios.get('/auth/me');
        this.user = userResponse.data;
        
        const creditsResponse = await this.$axios.get('/user/credits');
        this.userCredits = creditsResponse.data.amount;
        
        const modulesResponse = await this.$axios.get('/user/modules');
        this.userModules = modulesResponse.data;
        */
        
        // Simülasyon verileri
        this.user = this.$auth.user || {
          username: 'kullanici',
          email: 'kullanici@example.com'
        };
        
        this.userCredits = 150;
        
        this.userModules = [
          { id: 1, name: 'Finans Modülü' },
          { id: 2, name: 'Stok ve Envanter Modülü' }
        ];
        
        // Profil formunu başlangıç verileriyle doldur
        this.profileData = {
          username: this.user.username,
          email: this.user.email,
          fullName: this.user.fullName || '',
          phone: this.user.phone || '',
          companyInfo: this.user.companyInfo || ''
        };
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata oluştu:', error);
      }
    },
    async updateProfile() {
      if (!this.$refs.profileForm.validate()) return;
      
      this.updating = true;
      
      try {
        // Simülasyon için timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gerçek API çağrısı
        // const response = await this.$axios.put('/users/profile', this.profileData);
        
        // Kullanıcı verilerini güncelle
        this.user = {
          ...this.user,
          ...this.profileData
        };
        
        // Auth store'u güncelle
        this.$auth.setUser(this.user);
        
        // Başarı mesajı göster
        this.$toast?.success('Profil bilgileri başarıyla güncellendi') || alert('Profil bilgileri başarıyla güncellendi');
      } catch (error) {
        console.error('Profil güncellenirken hata oluştu:', error);
        this.$toast?.error('Profil güncellenirken bir hata oluştu') || alert('Profil güncellenirken bir hata oluştu');
      } finally {
        this.updating = false;
      }
    },
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return;
      
      this.updatingPassword = true;
      
      try {
        // Simülasyon için timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Gerçek API çağrısı
        // const response = await this.$axios.put('/users/password', {
        //   currentPassword: this.passwordData.currentPassword,
        //   newPassword: this.passwordData.newPassword
        // });
        
        // Başarı mesajı göster
        this.$toast?.success('Şifreniz başarıyla güncellendi') || alert('Şifreniz başarıyla güncellendi');
        
        // Formu temizle
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        console.error('Şifre güncellenirken hata oluştu:', error);
        this.$toast?.error('Şifre güncellenirken bir hata oluştu') || alert('Şifre güncellenirken bir hata oluştu');
      } finally {
        this.updatingPassword = false;
      }
    },
    async uploadAvatar() {
      if (!this.avatarFile) return;
      
      this.uploadingAvatar = true;
      
      try {
        // Simülasyon için timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Gerçek API çağrısı için FormData oluştur
        // const formData = new FormData();
        // formData.append('avatar', this.avatarFile);
        // const response = await this.$axios.post('/users/avatar', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data'
        //   }
        // });
        
        // İşlem başarılı
        this.uploadAvatarDialog = false;
        this.avatarFile = null;
        
        // Başarı mesajı göster
        this.$toast?.success('Profil fotoğrafı başarıyla güncellendi') || alert('Profil fotoğrafı başarıyla güncellendi');
        
        // Kullanıcı verilerini yeniden yükle
        await this.loadUserData();
      } catch (error) {
        console.error('Profil fotoğrafı yüklenirken hata oluştu:', error);
        this.$toast?.error('Profil fotoğrafı yüklenirken bir hata oluştu') || alert('Profil fotoğrafı yüklenirken bir hata oluştu');
      } finally {
        this.uploadingAvatar = false;
      }
    }
  },
  head() {
    return {
      title: 'Profil'
    }
  }
}
</script>
