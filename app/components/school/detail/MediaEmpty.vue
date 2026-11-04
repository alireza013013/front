<template>
  <v-card
    flat
    rounded="lg"
    color="grey100"
    class="media-empty w-100 h-100 d-flex flex-column align-center justify-center ga-1 text-center text-grey500"
    @click="emit('click')"
  >
    <v-icon
      size="36"
      aria-hidden="true"
    >
      {{ icon }}
    </v-icon>
    <span class="text-grey800 font-weight-bold media-empty__title">{{ title }}</span>
    <span class="text-info font-weight-medium">{{ action }}</span>
    <small v-if="hint">{{ hint }}</small>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  title: string
  action: string
  hint?: string
}>(), { hint: '' })
const emit = defineEmits<{ click: [] }>()
</script>

<style scoped>
.media-empty {
  border: 2px dashed rgb(var(--v-theme-grey300));
  font-size: 14px;
}

.media-empty__title {
  font-size: 15px;
}
</style>
