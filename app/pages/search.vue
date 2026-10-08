<template>
  <v-container class="margin-top-handle">
    <v-row
      align="center"
    >
      <v-col
        cols="12"
        sm="6"
      >
        <h1 class="text-h5 text-md-h4 font-weight-bold text-grey700">
          Find the right learning resource
        </h1>
      </v-col>

      <v-col
        cols="12"
        sm="6"
        class="d-flex justify-md-end py-1"
      >
        <v-text-field
          v-model="keyword"
          label="Search anything...."
          variant="outlined"
          color="primary"
          density="compact"
          hide-details
          class="custom-search-text-field w-100"
          max-width="420"
        >
          <template #append>
            <v-btn
              icon
              color="primary"
              width="50"
              class="rounded-ts rounded-te-xl rounded-be-xl rounded-bs h-100 ml-n2"
              flat
            >
              <v-icon
                size="x-large"
                icon="md:search"
                color="grey800"
              />
            </v-btn>
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-row align="start">
      <v-col
        cols="12"
        md="3"
      >
        <div class="d-md-none mb-1">
          <search-services-tabs
            :active-service="activeService"
            @change="setService"
          />
        </div>

        <search-filter-panel
          :filters="filters"
          @select-filter="selectFilter"
          @reset="resetFilters"
        />
      </v-col>

      <v-col
        cols="12"
        md="9"
      >
        <div class="d-none d-md-flex mb-4">
          <search-services-tabs
            :active-service="activeService"
            @change="setService"
          />
        </div>

        <v-sheet
          rounded="lg"
          border
          class="pa-6 bg-white min-results-box"
        >
          <span class="text-body-1 text-grey600">
            Results area will be implemented in the next step.
          </span>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const keyword = ref('')

const {
  activeService,
  filters,
  selectFilter,
  resetFilters,
  setService,
} = useSearchFilters()

useHead({
  title: 'Search',
})
</script>

<style scoped>
.margin-top-handle {
  margin-top: 64px;
  min-height: calc(100vh - 64px);
}

.min-results-box {
  min-height: 320px;
}

:deep(.custom-search-text-field .v-field__outline__start) {
  border-radius: 24px 0 0 24px !important;
  flex: 0 0 30px !important;
}

:deep(.custom-search-text-field .v-field__outline__end) {
  border-radius: 0 4px 4px 0 !important;
}
</style>
