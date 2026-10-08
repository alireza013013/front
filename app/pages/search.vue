<template>
  <main class="bg-grey25 search-page">
    <v-container class="py-6 py-md-8">
      <v-row
        align="center"
        class="mb-6"
      >
        <v-col
          cols="12"
          md="6"
        >
          <h1 class="text-h5 text-md-h4 font-weight-bold text-brandNavy">
            Find the right learning resource
          </h1>
          <p class="text-body-1 text-grey600 mt-2 mb-0">
            Search and filter past papers, study materials, exams, and tutorials.
          </p>
        </v-col>

        <v-col
          cols="12"
          md="6"
          class="d-flex justify-md-end"
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
                variant="text"
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
          <div class="d-md-none mb-3">
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
  </main>
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
.search-page {
  min-height: calc(100vh - 64px);
  padding-top: 64px;
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
