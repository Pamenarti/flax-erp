<template>
  <v-app>
    <v-app-bar app elevate-on-scroll color="primary" dark>
      <v-toolbar-title>
        <router-link to="/dashboard" class="white--text text-decoration-none">
          Flax ERP - Dashboard
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item to="/profile">
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$auth.logout()">
            <v-list-item-title>Çıkış Yap</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-0 dashboard-container">
        <v-row no-gutters>
          <v-col cols="12" md="9">
            <v-container class="px-6 py-4">
              <nuxt />
            </v-container>
          </v-col>
          <v-col cols="12" md="3">
            <!-- Sağ tarafta sidebar -->
            <v-navigation-drawer permanent right width="100%">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="text-h6">
                    {{ $auth.user?.username }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Krediler: {{ userCredits }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-divider></v-divider>

              <v-list dense nav>
                <v-list-item to="/dashboard">
                  <v-list-item-icon>
                    <v-icon>mdi-view-dashboard</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Dashboard</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item to="/modules">
                  <v-list-item-icon>
                    <v-icon>mdi-puzzle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Modüller</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-group prepend-icon="mdi-folder-multiple" value="true">
                  <template v-slot:activator>
                    <v-list-item-title>Modüllerim</v-list-item-title>
                  </template>

                  <v-list-item v-if="userModules.length === 0" to="/modules">
                    <v-list-item-content>
                      <v-list-item-title>Modül Satın Al</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-for="module in userModules" :key="module.id" :to="`/modules/${module.id}`">
                    <v-list-item-content>
                      <v-list-item-title>{{ module.name }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>

                <v-list-item to="/credits">
                  <v-list-item-icon>
                    <v-icon>mdi-cash</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Kredi Satın Al</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item to="/profile">
                  <v-list-item-icon>
                    <v-icon>mdi-account</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Profil</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-navigation-drawer>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer app padless>
      <v-col class="text-center" cols="12">
        {{ new Date().getFullYear() }} — <strong>Flax ERP</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DashboardLayout',
  middleware: 'auth',
  data() {
    return {
      userModules: [],
      userCredits: 0
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
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error)
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: calc(100vh - 64px - 36px);
}
</style>
