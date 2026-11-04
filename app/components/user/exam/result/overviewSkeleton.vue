<template>
  <v-card
    class="w-100 mt-4 pa-4"
    flat
    rounded="lg"
    border
  >
    <div class="w-100 d-flex align-center justify-space-between ga-2 flex-wrap">
      <div class="d-flex align-center ga-2">
        <v-skeleton-loader
          height="24"
          width="24"
          class="rounded-lg"
        />
        <v-skeleton-loader
          height="24"
          width="110"
        />
      </div>

      <v-skeleton-loader
        height="32"
        width="100"
        class="rounded-pill"
      />
    </div>

    <v-row
      no-gutters
      class="w-100 flex-grow-0 mt-4 bg-grey100 rounded-lg border-grey300 border-sm border-opacity-100"
    >
      <v-col
        cols="12"
        sm="4"
        md
        class="pa-3 d-flex align-center ga-3 min-w-0"
      >
        <v-skeleton-loader
          height="64"
          min-width="64"
          class="rounded-circle"
        />
        <div class="min-w-0 d-flex flex-column ga-2">
          <v-skeleton-loader
            height="18"
            width="80"
          />
          <v-skeleton-loader
            height="24"
            width="110"
          />
        </div>
      </v-col>

      <v-col
        v-for="item in 4"
        :key="item"
        cols="12"
        sm="4"
        md
        class="pa-3 d-flex flex-column align-start justify-center ga-1"
      >
        <div class="d-flex align-center ga-2">
          <v-skeleton-loader
            height="24"
            width="24"
            class="rounded-lg"
          />
          <v-skeleton-loader
            height="18"
            width="80"
          />
        </div>
        <v-skeleton-loader
          height="24"
          width="110"
          class="ml-8"
        />
      </v-col>
    </v-row>
  </v-card>
</template>
