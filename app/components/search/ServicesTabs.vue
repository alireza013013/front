<template>
  <div class="w-100 d-flex align-center">
    <div
      v-for="service in services"
      :key="service.id"
      class="rounded-lg cursor-pointer d-flex justify-start align-center px-1 py-2 ga-2 service-div"
      :class="`
       ${activeService === service.id ? 'bg-grey700 flex-row w-100 w-sm-25' : 'bg-white flex-column flex-sm-row width-service'}
      `"
      @click="selectService(service.id)"
    >
      <span
        class="d-flex align-center justify-center text-h3"
        :class="activeService === service.id ? 'text-white' : 'text-grey700'"
        aria-hidden="true"
      >
        <span :class="service.icon" />
      </span>

      <div class="d-flex flex-column align-start min-width-0">
        <span
          class="text-h6 text-sm-h5 font-weight-bold d-none d-sm-flex"
          :class="activeService === service.id ? 'text-primary d-flex' : 'text-grey400'"
        >
          {{ $numberFormat(service.id) || '-' }}
        </span>
        <span
          class="d-none d-sm-flex text-h6 text-sm-h5 font-weight-bold text-truncate"
          :class="activeService === service.id ? 'text-white' : 'text-grey700'"
        >
          {{ service.title }}
        </span>
        <span
          class="d-flex d-sm-none text-h6 text-sm-h5 font-weight-bold text-truncate"
          :class="activeService === service.id ? 'text-white' : 'text-grey700'"
        >
          {{ service.shortTitle }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SearchServiceCounts, SearchServiceId } from '@/types/search'
import { SEARCH_SERVICE_OPTIONS } from '@/constants'

withDefaults(defineProps<{
  activeService: SearchServiceId
  serviceCounts?: SearchServiceCounts
}>(), {
  serviceCounts: () => ({}),
})

const emit = defineEmits<{
  change: [serviceId: SearchServiceId]
}>()

const { $numberFormat } = useNuxtApp()
const services = SEARCH_SERVICE_OPTIONS

const selectService = (serviceId: unknown) => {
  if (typeof serviceId !== 'string') return

  emit('change', serviceId as SearchServiceId)
}
</script>

<style scoped>
.service-div{
  transition: 0.5s;
}
.width-service{
  width : 25%
}
@media (max-width: 600px) {
  .width-service{
    width : 20%
  }
}
</style>
