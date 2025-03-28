<template>
  <div class="modules-list">
    <h1>Sistem Modülleri</h1>
    <div v-if="loading" class="loading">
      <p>Modüller yükleniyor...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="fetchModules" class="retry-btn">Yeniden Dene</button>
    </div>
    
    <div v-else class="modules-container">
      <div v-for="module in modules" :key="module.code || module.name" class="module-card">
        <div class="module-header">
          <h2>{{ module.name }}</h2>
          <span class="module-version">v{{ module.version }}</span>
          <div class="module-status" :class="{ 'enabled': module.isActive || module.isEnabled, 'disabled': !(module.isActive || module.isEnabled) }">
            {{ (module.isActive || module.isEnabled) ? 'Etkin' : 'Devre Dışı' }}
          </div>
        </div>
        
        <p class="module-description">{{ module.description }}</p>
        
        <div v-if="module.dependencies && module.dependencies.length > 0" class="module-dependencies">
          <h4>Bağımlılıklar:</h4>
          <ul>
            <li v-for="dep in module.dependencies" :key="dep">{{ dep }}</li>
          </ul>
        </div>
        
        <div class="module-actions">
          <button 
            v-if="!module.isActive && !module.isEnabled && !module.isCore" 
            @click="enableModule(module.id || module.code || module.name)" 
            class="enable-btn">
            Etkinleştir
          </button>
          <button 
            v-else-if="(module.isActive || module.isEnabled) && !module.isCore" 
            @click="disableModule(module.id || module.code || module.name)" 
            class="disable-btn">
            Devre Dışı Bırak
          </button>
          <span v-else-if="module.isCore" class="core-badge">
            Çekirdek Modül
          </span>
        </div>
      </div>
    </div>
    
    <div class="modules-help">
      <p class="note">Not: Modül değişikliklerinin etkili olması için sistem yöneticinize başvurun. 
      Modüllerin etkinleştirilmesi sunucu tarafında .env dosyasında ENABLED_MODULES ayarını gerektirmektedir.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModulesList',
  data() {
    return {
      modules: [],
      loading: true,
      error: null
    };
  },
  created() {
    this.fetchModules();
  },
  methods: {
    async fetchModules() {
      this.loading = true;
      this.error = null;
      
      try {
        console.log('Modüller alınmaya çalışılıyor...');
        
        // Tüm olası URL'leri deneyecek bir yardımcı fonksiyon
        const tryUrls = async (urls) => {
          let lastError = null;
          
          for (const url of urls) {
            try {
              console.log(`URL deneniyor: ${url}`);
              const response = await this.$api.get(url);
              console.log(`Başarılı yanıt (${url}):`, response.data);
              return response;
            } catch (error) {
              console.warn(`Hata (${url}):`, error.message);
              lastError = error;
            }
          }
          
          throw lastError || new Error('Tüm URL\'ler başarısız oldu');
        };
        
        // Denenecek URL'ler - önce api/modules dizisi
        const urls = [
          '/api/modules',
          '/modules',
          '/api/temp-modules',
          '/api/modules/fallback'
        ];
        
        const response = await tryUrls(urls);
        this.modules = response.data;
        
        // Eğer veri boşsa
        if (!this.modules || this.modules.length === 0) {
          console.warn('API yanıt verdi ancak modül verisi yok, varsayılan modülleri kullanıyoruz.');
          this.modules = this.getFallbackModules();
        }
      } catch (error) {
        console.error('Modüller yüklenirken hata oluştu:', error);
        this.error = 'Modüller yüklenemedi. Sunucu ile bağlantı kurulamıyor olabilir.';
        this.modules = this.getFallbackModules();
      } finally {
        this.loading = false;
      }
    },
    
    async enableModule(moduleId) {
      try {
        this.loading = true;
        
        // Tüm olası URL'leri deneme
        const urls = [
          `/api/modules/${moduleId}/enable`,
          `/modules/${moduleId}/enable`,
          `/api/temp-modules/${moduleId}/enable`
        ];
        
        let response = null;
        let lastError = null;
        
        for (const url of urls) {
          try {
            console.log(`Modül etkinleştirme isteği gönderiliyor: ${url}`);
            response = await this.$api.post(url);
            console.log(`Başarılı yanıt:`, response.data);
            break; // Başarılı olursa döngüden çık
          } catch (error) {
            console.warn(`Hata (${url}):`, error.message);
            lastError = error;
          }
        }
        
        if (!response) {
          throw lastError || new Error('Tüm URL\'ler başarısız oldu');
        }
        
        if (response.data.success) {
          this.$notify({
            type: 'success',
            title: 'Başarılı',
            text: response.data.message || `Modül etkinleştirilmek üzere işaretlendi.`
          });
          await this.fetchModules();
        } else {
          this.$notify({
            type: 'error',
            title: 'Hata',
            text: response.data.message || 'Modül etkinleştirilemedi.'
          });
        }
      } catch (error) {
        console.error('Modül etkinleştirme hatası:', error);
        this.$notify({
          type: 'error',
          title: 'Hata',
          text: 'Modül etkinleştirilemedi. Sunucu ile bağlantı hatası.'
        });
      } finally {
        this.loading = false;
      }
    },
    
    async disableModule(moduleId) {
      try {
        this.loading = true;
        
        // Tüm olası URL'leri deneme
        const urls = [
          `/api/modules/${moduleId}/disable`,
          `/modules/${moduleId}/disable`,
          `/api/temp-modules/${moduleId}/disable`
        ];
        
        let response = null;
        let lastError = null;
        
        for (const url of urls) {
          try {
            console.log(`Modül devre dışı bırakma isteği gönderiliyor: ${url}`);
            response = await this.$api.post(url);
            console.log(`Başarılı yanıt:`, response.data);
            break; // Başarılı olursa döngüden çık
          } catch (error) {
            console.warn(`Hata (${url}):`, error.message);
            lastError = error;
          }
        }
        
        if (!response) {
          throw lastError || new Error('Tüm URL\'ler başarısız oldu');
        }
        
        if (response.data.success) {
          this.$notify({
            type: 'success',
            title: 'Başarılı',
            text: response.data.message || `Modül devre dışı bırakılmak üzere işaretlendi.`
          });
          await this.fetchModules();
        } else {
          this.$notify({
            type: 'error',
            title: 'Hata',
            text: response.data.message || 'Modül devre dışı bırakılamadı.'
          });
        }
      } catch (error) {
        console.error('Modül devre dışı bırakma hatası:', error);
        this.$notify({
          type: 'error',
          title: 'Hata',
          text: 'Modül devre dışı bırakılamadı. Sunucu ile bağlantı hatası.'
        });
      } finally {
        this.loading = false;
      }
    },
    getFallbackModules() {
      // Sunucu bağlantısı yoksa gösterilecek varsayılan modüller
      return [
        {
          code: 'core',
          name: 'Çekirdek Sistem',
          description: 'Temel sistem bileşenleri ve gösterge paneli',
          isActive: true,
          isCore: true,
          version: '1.0.0',
          dependencies: ['core']
        },
        {
          code: 'users',
          name: 'Kullanıcı Yönetimi',
          description: 'Kullanıcı hesapları ve yetkilendirme',
          isActive: true,
          isCore: true,
          version: '1.0.0',
          dependencies: ['core']
        },
        {
          code: 'inventory',
          name: 'Stok Yönetimi',
          description: 'Envanter takibi ve stok hareketleri',
          isActive: false,
          isCore: false,
          version: '1.0.0',
          dependencies: ['core']
        }
      ];
    }
  }
};
</script>

<style scoped>
.modules-list {
  padding: 20px;
}

.loading, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 20px 0;
}

.retry-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.modules-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.module-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.module-header h2 {
  margin: 0;
  font-size: 1.2rem;
  flex-grow: 1;
}

.module-version {
  color: #666;
  font-size: 0.8rem;
  margin: 0 10px;
}

.module-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.module-status.enabled {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.module-status.disabled {
  background-color: #f7e6e6;
  color: #c62828;
}

.module-description {
  margin: 10px 0;
  color: #555;
}

.module-dependencies {
  margin: 10px 0;
  font-size: 0.9rem;
}

.module-dependencies h4 {
  margin: 5px 0;
  font-size: 0.9rem;
  font-weight: bold;
}

.module-dependencies ul {
  margin: 5px 0;
  padding-left: 20px;
}

.module-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.enable-btn {
  background-color: #2196f3;
  color: white;
}

.disable-btn {
  background-color: #f44336;
  color: white;
}

.modules-help {
  margin-top: 30px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.note {
  color: #666;
  font-style: italic;
}

.core-badge {
  font-weight: bold;
  font-size: 0.8rem;
  border-radius: 4px;
  padding: 4px 8px;
  color: white;
  background-color: #f44336;
}
</style>
