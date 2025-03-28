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
        console.log('Modüller alınmaya çalışılıyor...');ya çalışılıyor...');
        // Önce geçici API uç noktasını denedan API'yi dene
        let response;esponse;
        try {
          response = await this.$api.get('/api/temp-modules');his.$api.get('/api/modules');
          console.log('Geçici API yanıtı:', response.data);
        } catch (tempApiError) {
          console.warn('Geçici API uç noktasına bağlanılamadı:', tempApiError);rror);
           
          // Normal API'yi dene  // Önce fallback dene
          try {
            console.log('Normal API deneniyor...');    console.log('Fallback API deneniyor...');
            response = await this.$api.get('/api/modules');it this.$api.get('/api/modules/fallback');
            console.log('Normal API yanıtı:', response.data);data);
          } catch (apiError) {
            console.warn('Normal API uç noktasına bağlanılamadı:', apiError);:', fallbackError);
               // Son çare olarak varsayılan verileri kullan
            // Son çare olarak fallback'i denerror('Tüm API uç noktaları başarısız');
            try {
              console.log('Fallback API deneniyor...');
              response = await this.$api.get('/api/modules/fallback');
              console.log('Fallback API yanıtı:', response.data);les = response.data;
            } catch (fallbackError) {
              console.warn('Fallback API de çalışmadı:', fallbackError); // Eğer veri boşsa
              // Son çare olarak varsayılan verileri kullan  if (!this.modules || this.modules.length === 0) {
              throw new Error('Tüm API uç noktaları başarısız');      console.warn('API yanıt verdi ancak modül verisi yok, varsayılan modülleri kullanıyoruz.');
            }his.getFallbackModules();
          }
        }(error) {
        onsole.error('Modüller yüklenirken hata oluştu:', error);
        this.modules = response.data;odüller yüklenemedi. Sunucu ile bağlantı kurulamıyor olabilir.';
        lbackModules();
        // Eğer veri boşsa
        if (!this.modules || this.modules.length === 0) {lse;
          console.warn('API yanıt verdi ancak modül verisi yok, varsayılan modülleri kullanıyoruz.');
          this.modules = this.getFallbackModules();
        }
      } catch (error) {llbackModules() {
        console.error('Modüller yüklenirken hata oluştu:', error);sı yoksa gösterilecek varsayılan modüller
        this.error = 'Modüller yüklenemedi. Sunucu ile bağlantı kurulamıyor olabilir.';
        this.modules = this.getFallbackModules();
      } finally {
        this.loading = false;ek Sistem',
      }el sistem bileşenleri ve gösterge paneli',
    },
    isCore: true,
    getFallbackModules() { version: '1.0.0'
      // Sunucu bağlantısı yoksa gösterilecek varsayılan modüller
      return [
        {
          code: 'core', Yönetimi',
          name: 'Çekirdek Sistem',Kullanıcı hesapları ve yetkilendirme',
          description: 'Temel sistem bileşenleri ve gösterge paneli',
          isActive: true,
          isCore: true, version: '1.0.0',
          version: '1.0.0'  dependencies: ['core']
        },  },
        {    {
          code: 'users',
          name: 'Kullanıcı Yönetimi',ame: 'Stok Yönetimi',
          description: 'Kullanıcı hesapları ve yetkilendirme',nter takibi ve stok hareketleri',
          isActive: true,
          isCore: true,  isCore: false,
          version: '1.0.0',
          dependencies: ['core']['core']
        },
        {
          code: 'inventory',
          name: 'Stok Yönetimi',
          description: 'Envanter takibi ve stok hareketleri',
          isActive: false,
          isCore: false,ding = true;
          version: '1.0.0', await this.$api.post(`/api/modules/${moduleId}/enable`);
          dependencies: ['core']
        }success) {
      ];
    },ype: 'success',
       title: 'Başarılı',
    async enableModule(moduleId) {nse.data.message || `Modül etkinleştirilmek üzere işaretlendi.`
      try {
        this.loading = true;tesini güncelle
        // Önce geçici API'yi denechModules();
        let response;
        try {
          response = await this.$api.post(`/api/temp-modules/${moduleId}/enable`); type: 'error',
        } catch (tempApiError) {: 'Hata',
          // Geçici API çalışmazsa normal API'yi deneta.message || 'Modül etkinleştirilemedi.'
          response = await this.$api.post(`/api/modules/${moduleId}/enable`);   });
        }  }
          } catch (error) {
        if (response.data.success) {eştirme hatası:', error);
          this.$notify({s.$notify({
            type: 'success',
            title: 'Başarılı',
            text: response.data.message || `Modül etkinleştirilmek üzere işaretlendi.`  text: 'Modül etkinleştirilemedi. Sunucu ile bağlantı hatası.'
          });
          // Modül listesini güncelle
          await this.fetchModules();;
        } else {
          this.$notify({
            type: 'error',
            title: 'Hata',
            text: response.data.message || 'Modül etkinleştirilemedi.'
          });ding = true;
        } await this.$api.post(`/api/modules/${moduleId}/disable`);
      } catch (error) {
        console.error('Modül etkinleştirme hatası:', error);success) {
        this.$notify({
          type: 'error',ype: 'success',
          title: 'Hata',   title: 'Başarılı',
          text: 'Modül etkinleştirilemedi. Sunucu ile bağlantı hatası.'nse.data.message || `Modül devre dışı bırakılmak üzere işaretlendi.`
        });
      } finally {tesini güncelle
        this.loading = false;chModules();
      }
    },
     type: 'error',
    async disableModule(moduleId) {: 'Hata',
      try {ta.message || 'Modül devre dışı bırakılamadı.'
        this.loading = true;   });
        const response = await this.$api.post(`/api/modules/${moduleId}/disable`);   }
           } catch (error) {
        if (response.data.success) {      console.error('Modül devre dışı bırakma hatası:', error);
          this.$notify({his.$notify({
            type: 'success',          type: 'error',
            title: 'Başarılı',e: 'Hata',
            text: response.data.message || `Modül devre dışı bırakılmak üzere işaretlendi.` 'Modül devre dışı bırakılamadı. Sunucu ile bağlantı hatası.'
          });
          // Modül listesini güncelle     } finally {
          await this.fetchModules();        this.loading = false;
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
          title: 'Hata',rror-container {
          text: 'Modül devre dışı bırakılamadı. Sunucu ile bağlantı hatası.'
        });lumn;
      } finally {
        this.loading = false;nt: center;
      };
    };
  }px;
};
</script>

<style scoped>
.modules-list {px;
  padding: 20px;
}-color: #2196f3;

.loading, .error-container { border: none;
  display: flex;  border-radius: 4px;
  flex-direction: column;ter;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px; display: grid;
  margin: 20px 0;  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
px;
.retry-btn {
  margin-top: 15px;
  padding: 8px 16px;module-card {
  background-color: #2196f3;  border: 1px solid #e0e0e0;
  color: white;x;
  border: none;6px;
  border-radius: 4px;4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-weight: bold;
}.module-header {

.modules-container { center;
  display: grid;x;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;.module-header h2 {
}
;
.module-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;module-version {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);  color: #666;
}

.module-header {
  display: flex;
  align-items: center;.module-status {
  margin-bottom: 10px;
}
em;
.module-header h2 { font-weight: bold;
  margin: 0;}
  font-size: 1.2rem;
  flex-grow: 1;abled {
}olor: #e6f7e6;
 color: #2e7d32;
.module-version {}
  color: #666;
  font-size: 0.8rem;sabled {
  margin: 0 10px;#f7e6e6;
} color: #c62828;
}
.module-status {
  padding: 4px 8px;ion {
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.module-status.enabled {;
  background-color: #e6f7e6;
  color: #2e7d32;
}
ies h4 {
.module-status.disabled {
  background-color: #f7e6e6;rem;
  color: #c62828;
}

.module-description {dependencies ul {
  margin: 10px 0;
  color: #555; 20px;
}

.module-dependencies {
  margin: 10px 0; margin-top: 15px;
  font-size: 0.9rem;  display: flex;
}tent: flex-end;

.module-dependencies h4 {
  margin: 5px 0;utton {
  font-size: 0.9rem;  padding: 8px 16px;
  color: #555;;
}
er;
.module-dependencies ul { font-weight: bold;
  margin: 5px 0;}
  padding-left: 20px;
}
olor: #2196f3;
.module-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
} background-color: #f44336;
  color: white;
button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold; padding: 4px 8px;
}  border-radius: 4px;
size: 0.8rem;
.enable-btn { bold;
  background-color: #2196f3;
  color: white;
}-help {
  margin-top: 30px;



























</style>}  font-style: italic;  color: #666;.note {}  border-radius: 8px;  background-color: #f5f5f5;  padding: 15px;  margin-top: 30px;.modules-help {}  font-weight: bold;  font-size: 0.8rem;  border-radius: 4px;  padding: 4px 8px;  color: #555;  background-color: #e0e0e0;.core-badge {}  color: white;  background-color: #f44336;.disable-btn {  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.note {
  color: #666;
  font-style: italic;
}
</style>
