<template>
  <div>
    <section class="hero">
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" md="6" class="text-center text-md-left">
            <h1 class="text-h2 font-weight-bold mb-4">
              Flax ERP Modüler Yönetim Sistemi
            </h1>
            <p class="text-h5 mb-6">
              İşletmenizi yönetmek için ihtiyacınız olan tüm modüller tek bir platformda.
              İhtiyacınıza göre modülleri seçin ve kullanmaya başlayın.
            </p>
            <v-btn x-large color="primary" class="mr-4" to="/register">
              Hemen Başlayın
            </v-btn>
            <v-btn x-large outlined to="/modules">
              Modülleri İnceleyin
            </v-btn>
          </v-col>
          <v-col cols="12" md="6" class="text-center">
            <v-img src="/images/hero-image.svg" alt="ERP Dashboard" max-width="500" class="mx-auto"></v-img>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="features py-12 grey lighten-4">
      <v-container>
        <h2 class="text-h3 text-center mb-10">Öne Çıkan Modüller</h2>
        <v-row>
          <v-col v-for="module in featuredModules" :key="module.id" cols="12" md="4">
            <v-card class="mx-auto" max-width="400" height="100%">
              <v-img :src="module.image" height="200"></v-img>
              <v-card-title>{{ module.name }}</v-card-title>
              <v-card-text>
                <p>{{ module.description }}</p>
                <div class="mt-4">
                  <v-chip color="primary" outlined>{{ module.price }} Kredi</v-chip>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" text to="/login">
                  Satın Al
                </v-btn>
                <v-btn text :to="`/modules/${module.id}`">
                  Detaylar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="testimonials py-12">
      <v-container>
        <h2 class="text-h3 text-center mb-10">Müşteri Yorumları</h2>
        <v-row>
          <v-col cols="12" md="4" v-for="(testimonial, index) in testimonials" :key="index">
            <v-card class="mx-auto" max-width="400" height="100%">
              <v-card-text>
                <p class="text-h6 font-italic">
                  "{{ testimonial.text }}"
                </p>
              </v-card-text>
              <v-card-actions>
                <v-list-item class="grow">
                  <v-list-item-avatar color="grey darken-3">
                    <v-img class="elevation-6" :src="testimonial.avatar"></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ testimonial.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ testimonial.company }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="cta py-12 primary">
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h3 white--text mb-6">İşletmenizi Dijitalleştirmeye Hazır Mısınız?</h2>
            <p class="text-h5 white--text mb-8">
              Flax ERP ile iş süreçlerinizi daha verimli hale getirin.
            </p>
            <v-btn x-large color="white" class="primary--text" to="/register">
              Ücretsiz Hesap Oluşturun
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </div>
</template>

<script>
export default {
  layout: 'default',
  data() {
    return {
      featuredModules: [
        {
          id: 1,
          name: 'Finans Yönetimi',
          description: 'Tüm finansal işlemlerinizi tek bir yerden yönetin. Faturalarınızı, ödemelerinizi ve nakit akışınızı kolayca takip edin.',
          price: 100,
          image: '/images/finance-module.jpg'
        },
        {
          id: 2,
          name: 'Stok ve Envanter',
          description: 'Stok seviyelerinizi gerçek zamanlı izleyin, stok maliyetlerinizi optimize edin ve envanter yönetiminizi otomatikleştirin.',
          price: 80,
          image: '/images/inventory-module.jpg'
        },
        {
          id: 3,
          name: 'Satış Yönetimi',
          description: 'Müşteri ilişkilerinizi geliştirin, satış süreçlerinizi optimize edin ve satış performansınızı artırın.',
          price: 90,
          image: '/images/sales-module.jpg'
        }
      ],
      testimonials: [
        {
          name: 'Ahmet Yılmaz',
          company: 'ABC Teknoloji',
          text: 'Flax ERP ile şirketimizin süreçlerini çok daha verimli hale getirdik. Özellikle muhasebe modülü iş yükümüzü %40 azalttı.',
          avatar: '/images/avatar-1.jpg'
        },
        {
          name: 'Ayşe Kaya',
          company: 'XYZ Lojistik',
          text: 'Modüler yapısı sayesinde sadece ihtiyacımız olan özellikleri kullanıyoruz. Bu da maliyetlerimizi önemli ölçüde düşürdü.',
          avatar: '/images/avatar-2.jpg'
        },
        {
          name: 'Mehmet Demir',
          company: 'Demir Holding',
          text: 'Kullanıcı dostu arayüzü ve kapsamlı raporlama özellikleri ile karar verme süreçlerimiz artık çok daha hızlı ve verimli.',
          avatar: '/images/avatar-3.jpg'
        }
      ]
    }
  },
  head() {
    return {
      title: 'Ana Sayfa'
    }
  }
}
</script>

<style scoped>
.hero {
  padding: 80px 0;
  background: linear-gradient(to right, #f5f5f5, #e0e0e0);
}

section {
  padding: 60px 0;
}

.cta {
  background: linear-gradient(to right, #1976D2, #1565C0);
}
</style>
