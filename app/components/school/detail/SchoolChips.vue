<template>
  <div
    v-if="chips.length"
    class="d-flex ga-2 overflow-x-auto school-chips"
  >
    <v-chip
      v-for="chip in chips"
      :key="chip.key"
      :to="chip.to"
      :color="chip.rank === 1 ? 'generalSearchSchool' : 'grey700'"
      :variant="chip.rank === 1 ? 'tonal' : 'flat'"
      :class="['flex-shrink-0 font-weight-medium gtext-t5', { 'bg-grey100': chip.rank !== 1 }]"
    >
      <template #prepend>
        <v-icon
          :color="chip.iconColor"
          size="18"
          class="mr-1"
          aria-hidden="true"
        >
          md:workspace_premium
        </v-icon>
      </template>
      {{ chip.label }}
    </v-chip>
  </div>
</template>

<script setup>
const props = defineProps({
  contentData: {
    type: Object,
    required: true,
  },
})

// "#2 in Vanuatu" - each links to the school list for that area. Areas without a rank are
// already in the breadcrumb and the location line, so they don't get a chip.
// The three medal colors are the ones this page has always used for country/state/city.
const chips = computed(() => [
  { key: 'country', title: props.contentData.countryTitle, rank: props.contentData.countryRank, iconColor: '#FA0369' },
  { key: 'state', title: props.contentData.stateTitle, rank: props.contentData.stateRank, iconColor: '#FB6514' },
  { key: 'city', title: props.contentData.cityTitle, rank: props.contentData.cityRank, iconColor: '#4E5BA6' },
]
  .filter(chip => chip.title && chip.rank)
  .map(chip => ({
    ...chip,
    label: `#${chip.rank} in ${chip.title}`,
    to: buildSchoolListUrl(chip.key, props.contentData),
  })))
</script>

<style scoped>
.school-chips {
  scrollbar-width: none;
}

.school-chips::-webkit-scrollbar {
  display: none;
}
</style>
