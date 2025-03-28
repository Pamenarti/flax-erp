<template>
  <v-app>
    <v-app-bar app elevate-on-scroll color="primary" dark>
      <v-toolbar-title>
        <router-link to="/" class="white--text text-decoration-none">
          Flax ERP
        </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!$auth.loggedIn" text to="/login">
        Giriş Yap
      </v-btn>
      <v-btn v-if="!$auth.loggedIn" text to="/register">
        Kaydol
      </v-btn>
      <v-btn v-if="$auth.loggedIn" text to="/dashboard">
        Dashboard
      </v-btn>
      <v-btn v-if="$auth.loggedIn" text @click="$auth.logout()">
        Çıkış Yap
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="main-container">
        <nuxt />
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
  name: 'DefaultLayout'
}
</script>
