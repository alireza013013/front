<template>
  <div class="w-100 d-flex flex-column ga-4 mt-4">
    <div class="d-flex flex-column ga-2">
      <v-skeleton-loader
        height="32"
        width="170"
      />
      <v-skeleton-loader
        height="22"
        width="240"
      />
    </div>

    <div class="d-flex flex-column flex-md-row ga-2">
      <v-card
        v-for="item in 3"
        :key="item"
        class="d-flex align-center ga-3 pa-3 flex-grow-1"
        rounded="lg"
        border
        elevation="0"
      >
        <v-skeleton-loader
          height="42"
          width="36"
          class="rounded"
        />

        <div class="d-flex flex-column ga-1 flex-grow-1">
          <v-skeleton-loader
            height="20"
            width="80"
          />
          <v-skeleton-loader
            height="16"
            width="70"
          />
          <v-skeleton-loader
            height="16"
            width="125"
          />
        </div>

        <v-skeleton-loader
          height="34"
          width="34"
          class="rounded-lg"
        />
      </v-card>
    </div>
  </div>
</template>
