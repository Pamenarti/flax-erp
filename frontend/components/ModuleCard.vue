<template>
  <v-card
    class="module-card mx-auto"
    max-width="400"
    height="100%"
    :disabled="module.status === 'development'"
    :outlined="owned"
  >
    <v-img 
      :src="module.image || '/images/module-placeholder.jpg'" 
      height="180" 
      gradient="to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6)"
    >
      <v-chip
        class="status-chip ma-2"
        small
        :color="moduleStatusColor"
        text-color="white"
      >
        {{ moduleStatusText }}
      </v-chip>
    </v-img>
    
    <v-card-title>{{ module.name }}</v-card-title>
    
    <v-card-text>
      <p>{{ module.description }}</p>
      <v-divider class="my-3"></v-divider>
      <div class="d-flex align-center">
        <v-rating
          :value="module.rating || 4.5"
          color="amber"
          dense
          half-increments
          readonly
          size="14"
        ></v-rating>
        <span class="ml-2 grey--text text--darken-1">{{ module.reviews || 0 }} değerlendirme</span>
      </div>
    </v-card-text>
    
    <v-card-actions>
      <v-chip color="primary" outlined>
        {{ module.price }} Kredi
      </v-chip>
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        text
        :disabled="owned || module.status === 'development'"
        @click="$emit('purchase', module)"
      >
        {{ owned ? 'Satın Alındı' : 'Satın Al' }}
      </v-btn>
      <v-btn
        text
        :to="`/modules/${module.id}`"
      >
        Detaylar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'ModuleCard',
  props: {
    module: {
      type: Object,
      required: true
    },
    owned: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    moduleStatusColor() {
      if (this.module.status === 'active') return 'green'
      if (this.module.status === 'inactive') return 'orange'
      if (this.module.status === 'development') return 'grey'
      return 'primary'
    },
    moduleStatusText() {
      if (this.module.status === 'active') return 'Aktif'
      if (this.module.status === 'inactive') return 'Pasif'
      if (this.module.status === 'development') return 'Geliştiriliyor'
      return this.module.status
    }
  }
}
</script>

<style scoped>
.module-card {
  transition: transform 0.2s;
}
.module-card:hover {
  transform: translateY(-5px);
}
.status-chip {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
