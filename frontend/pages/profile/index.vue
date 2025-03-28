<template>
  <div>
    <h1 class="text-h4 mb-5">Profil Ayarları</h1>

    <v-row>
      <v-col cols="12" md="4">
        <!-- Profil Kartı -->
        <v-card class="mb-4">
          <v-card-text class="text-center">
            <v-avatar size="150" class="mb-4">
              <v-img
                :src="profilePicture || '/images/avatars/default-avatar.png'"
                alt="Profil Resmi"
              >
                <template v-slot:placeholder>
                  <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center"
                  >
                    <v-icon
                      size="100"
                      color="grey lighten-2"
                    >
                      mdi-account
                    </v-icon>
                  </v-row>
                </template>
              </v-img>
            </v-avatar>
            
            <h2 class="text-h5">{{ user.username }}</h2>
            <p class="subtitle-1 grey--text">{{ user.email }}</p>
            
            <v-divider class="my-3"></v-divider>
            
            <div class="d-flex align-center justify-center my-3">
              <v-icon color="amber" left>mdi-coin</v-icon>
              <span class="text-h6">{{ userCredits }} Kredi</span>
            </div>
            
            <v-btn
              color="primary"
              outlined
              to="/credits"
              block
            >
              <v-icon left>mdi-cash-plus</v-icon>
              Kredi Satın Al
            </v-btn>
          </v-card-text>
        </v-card>
        
        <!-- Kullanım İstatistikleri -->
        <v-card>
          <v-card-title>Kullanım İstatistikleri</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-puzzle</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Aktif Modüller</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small>{{ userModules.length }}</v-chip>
                </v-list-item-action>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-calendar-check</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Üyelik Başlangıcı</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small>{{ formatDate(user.created_at) }}</v-chip>
                </v-list-item-action>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-icon>
                  <v-icon>mdi-login</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Son Giriş</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small>{{ formatDate(user.last_login) }}</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card class="mb-4">
          <v-tabs v-model="activeTab">
            <v-tab>Kişisel Bilgiler</v-tab>
            <v-tab>Şifre Değiştir</v-tab>
            <v-tab>Bildirim Ayarları</v-tab>
          </v-tabs>
          
          <v-tabs-items v-model="activeTab">
            <!-- Kişisel Bilgiler -->
            <v-tab-item>
              <v-card-text>
                <v-alert
                  v-if="profileSuccess"
                  type="success"
                  dense
                  dismissible
                  class="mb-4"
                >
                  Profiliniz başarıyla güncellendi!
                </v-alert>
                
                <v-alert
                  v-if="profileError"
                  type="error"
                  dense
                  dismissible
                  class="mb-4"
                >
                  {{ profileError }}
                </v-alert>
                
                <v-form ref="profileForm" @submit.prevent="updateProfile">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.username"
                        label="Kullanıcı Adı"
                        outlined
                        :rules="[v => !!v || 'Kullanıcı adı gerekli']"
                        required
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.email"
                        label="E-posta"
                        outlined
                        :rules="emailRules"
                        required
                        disabled
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.firstName"
                        label="Ad"
                        outlined
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.lastName"
                        label="Soyad"
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.phone"
                        label="Telefon"
                        outlined
                      ></v-text-field>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.company"
                        label="Şirket"
                        outlined
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col cols="12">
                      <v-textarea
                        v-model="profileData.address"
                        label="Adres"
                        outlined
                        rows="3"
                      ></v-textarea>
                    </v-col>
                  </v-row>
                  
                  <v-row>
                    <v-col cols="12">
                      <v-file-input
                        v-model="profilePictureFile"
                        label="Profil Resmi"
                        prepend-icon="mdi-camera"
                        outlined
                        accept="image/*"
                        truncate-length="25"
                        @change="previewProfilePicture"
                      ></v-file-input>
                    </v-col>
                  </v-row>
                  
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="updating"
                    class="mt-4"
                  >
                    Profili Güncelle
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-tab-item>
            
            <!-- Şifre Değiştir -->
            <v-tab-item>
              <v-card-text>
                <v-alert
                  v-if="passwordSuccess"
                  type="success"
                  dense
                  dismissible
                  class="mb-4"
                >
                  Şifreniz başarıyla değiştirildi!
                </v-alert>
                
                <v-alert
                  v-if="passwordError"
                  type="error"
                  dense
                  dismissible
                  class="mb-4"
                >
                  {{ passwordError }}
                </v-alert>
                
                <v-form ref="passwordForm" @submit.prevent="updatePassword">
                  <v-text-field
                    v-model="passwordData.currentPassword"
                    label="Mevcut Şifre"
                    :append-icon="showCurrentPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    @click:append="showCurrentPassword = !showCurrentPassword"
                    outlined
                    :rules="[v => !!v || 'Mevcut şifre gerekli']"
                    required
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwordData.newPassword"
                    label="Yeni Şifre"
                    :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showNewPassword ? 'text' : 'password'"
                    @click:append="showNewPassword = !showNewPassword"
                    outlined
                    :rules="passwordRules"
                    required
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwordData.confirmPassword"
                    label="Yeni Şifre Tekrar"
                    :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    @click:append="showConfirmPassword = !showConfirmPassword"
                    outlined
                    :rules="[
                      v => !!v || 'Şifre tekrarı gerekli',
                      v => v === passwordData.newPassword || 'Şifreler eşleşmiyor'
                    ]"
                    required
                  ></v-text-field>
                  
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="updatingPassword"
                    class="mt-4"
                  >
                    Şifreyi Değiştir
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-tab-item>
            
            <!-- Bildirim Ayarları -->
            <v-tab-item>
              <v-card-text>
                <v-alert
                  v-if="notificationSuccess"
                  type="success"
                  dense
                  dismissible
                  class="mb-4"
                >
                  Bildirim ayarlarınız güncellendi!
                </v-alert>
                
                <p class="subtitle-1 mb-4">Bildirim tercihlerinizi yönetin</p>
                
                <v-list>
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="notificationSettings.email" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>E-posta Bildirimleri</v-list-item-title>
                      <v-list-item-subtitle>Güncellemeler, kampanyalar ve bildirimleri e-posta ile alın</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="notificationSettings.sms" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>SMS Bildirimleri</v-list-item-title>
                      <v-list-item-subtitle>Önemli bildirimleri SMS ile alın</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="notificationSettings.newModules" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Yeni Modüller</v-list-item-title>
                      <v-list-item-subtitle>Yeni modüller yayınlandığında haber alın</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-action>
                      <v-switch v-model="notificationSettings.updates" color="primary"></v-switch>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Güncellemeler</v-list-item-title>
                      <v-list-item-subtitle>Modül güncellemeleri hakkında bilgi alın</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                
                <v-btn
                  color="primary"
                  @click="updateNotificationSettings"
                  :loading="updatingNotifications"
                  class="mt-4"
                >
                  Bildirimleri Güncelle
                </v-btn>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
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
      activeTab: 0,
      userCredits: 0,
      userModules: [],
      profilePicture: null,
      profilePictureFile: null,
      user: {},
      
      // Form verileri
      profileData: {
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        company: '',
        address: ''
      },
      
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      
      notificationSettings: {
        email: true,
        sms: false,
        newModules: true,
        updates: true
      },
      
      // UI kontrolleri
      updating: false,
      updatingPassword: false,
      updatingNotifications: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      
      // Başarı/hata mesajları
      profileSuccess: false,
      profileError: null,
      passwordSuccess: false,
      passwordError: null,
      notificationSuccess: false,
      
      // Form kuralları
      emailRules: [
        v => !!v || 'E-posta gerekli',
        v => /.+@.+\..+/.test(v) || 'Geçerli bir e-posta adresi girin'
      ],
      passwordRules: [
        v => !!v || 'Şifre gerekli',
        v => v.length >= 8 || 'Şifre en az 8 karakter olmalıdır',
        v => /[A-Z]/.test(v) || 'En az bir büyük harf içermelidir',
        v => /[0-9]/.test(v) || 'En az bir rakam içermelidir'
      ]
    }
  },
  async mounted() {
    try {
      // Kullanıcı bilgilerini getir
      const userResponse = await this.$axios.get('/auth/me');
      this.user = userResponse.data;
      
      // Form verilerini doldur
      this.profileData = {
        username: this.user.username || '',
        email: this.user.email || '',
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        phone: this.user.phone || '',
        company: this.user.company || '',
        address: this.user.address || ''
      };
      
      // Profil resmini getir
      this.profilePicture = this.user.profilePicture || null;
      
      // Kullanıcı kredilerini getir
      const creditsResponse = await this.$axios.get('/user/credits');
      this.userCredits = creditsResponse.data.amount;
      
      // Kullanıcı modüllerini getir
      const modulesResponse = await this.$axios.get('/user/modules');
      this.userModules = modulesResponse.data;
      
      // Bildirim ayarlarını getir
      // const notificationsResponse = await this.$axios.get('/user/notification-settings');
      // this.notificationSettings = notificationsResponse.data;
    } catch (error) {
      console.error('Profil verileri alınırken hata oluştu:', error);
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'Belirtilmedi';
      return new Date(date).toLocaleDateString('tr-TR');
    },
    previewProfilePicture(file) {
      if (!file) {
        this.profilePicture = null;
        return;
      }
      
      // Dosyayı Base64'e çevir ve önizleme için kullan
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.profilePicture = reader.result;
      };
    },
    async updateProfile() {
      if (!this.$refs.profileForm.validate()) return;
      
      this.updating = true;
      this.profileSuccess = false;
      this.profileError = null;
      
      try {
        // Profil verilerini güncelle
        // const formData = new FormData();
        // Object.keys(this.profileData).forEach(key => {
        //   formData.append(key, this.profileData[key]);
        // });
        
        // Profil resmi varsa ekle
        // if (this.profilePictureFile) {
        //   formData.append('profilePicture', this.profilePictureFile);
        // }
        
        // API isteği
        // await this.$axios.put('/user/profile', formData, {
        //   headers: {
        //     'Content-Type': 'multipart/form-data'
        //   }
        // });
        
        // Simülasyon
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Başarı mesajı göster
        this.profileSuccess = true;
      } catch (error) {
        console.error('Profil güncellenirken hata oluştu:', error);
        this.profileError = error.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      } finally {
        this.updating = false;
      }
    },
    async updatePassword() {
      if (!this.$refs.passwordForm.validate()) return;
      
      this.updatingPassword = true;
      this.passwordSuccess = false;
      this.passwordError = null;
      
      try {
        // API isteği
        // await this.$axios.put('/user/change-password', {
        //   currentPassword: this.passwordData.currentPassword,
        //   newPassword: this.passwordData.newPassword
        // });
        
        // Simülasyon
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Başarı mesajı göster
        this.passwordSuccess = true;
        
        // Formu temizle
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        console.error('Şifre değiştirilirken hata oluştu:', error);
        this.passwordError = error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu';
      } finally {
        this.updatingPassword = false;
      }
    },
    async updateNotificationSettings() {
      this.updatingNotifications = true;
      
      try {
        // API isteği
        // await this.$axios.put('/user/notification-settings', this.notificationSettings);
        
        // Simülasyon
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Başarı mesajı göster
        this.notificationSuccess = true;
      } catch (error) {
        console.error('Bildirim ayarları güncellenirken hata oluştu:', error);
      } finally {
        this.updatingNotifications = false;
      }
    }
  },
  head() {
    return {
      title: 'Profil Ayarları'
    }
  }
}
</script>

<style scoped>
/* Özel stiller buraya */
</style>
