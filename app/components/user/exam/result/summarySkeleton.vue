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
          width="150"
        />
      </div>
    </div>

    <div class="w-100 d-flex flex-wrap flex-md-nowrap ga-3 mt-4">
      <v-card
        class="w-100 w-md-50 pa-4 d-flex flex-column flex-sm-row align-center justify-center ga-6"
        color="grey100"
        flat
        rounded="lg"
        border
        min-width="240"
      >
        <v-skeleton-loader
          height="160"
          width="160"
          class="rounded-circle flex-shrink-0"
        />

        <div class="w-100 d-flex flex-column ga-2">
          <div
            v-for="item in 4"
            :key="item"
            class="w-100 d-flex flex-wrap align-center ga-2"
          >
            <v-skeleton-loader
              height="14"
              width="14"
              class="rounded-circle"
            />
            <v-skeleton-loader
              height="18"
              width="110"
              class="ml-2"
            />
            <v-skeleton-loader
              height="18"
              width="28"
              class="ml-auto"
            />
            <v-divider v-if="item !== 4" />
          </div>
        </div>
      </v-card>

      <v-card
        class="w-100 w-md-50 pa-4 d-flex flex-column ga-4"
        color="grey100"
        flat
        rounded="lg"
        border
        min-width="240"
      >
        <div class="w-100 d-flex flex-wrap ga-2">
          <v-card
            v-for="item in 2"
            :key="item"
            class="pa-2 d-flex flex-column ga-1 flex-grow-1"
            color="surface"
            flat
            rounded="lg"
            border
            min-width="150"
          >
            <div class="d-flex align-center ga-1">
              <v-skeleton-loader
                height="20"
                width="20"
                class="rounded-lg"
              />
              <v-skeleton-loader
                height="18"
                width="90"
              />
            </div>
            <v-skeleton-loader
              height="24"
              width="110"
              class="ml-6"
            />
          </v-card>

          <v-card
            class="w-100 pa-3 d-flex flex-column flex-sm-row ga-2 flex-grow-1 border-sm border-primary border-opacity-50"
            color="primary50"
            flat
            rounded="lg"
            min-width="150"
          >
            <v-skeleton-loader
              height="100"
              width="80"
              class="rounded-lg flex-shrink-0"
            />
            <div class="d-flex flex-column align-start justify-start ga-1 flex-grow-1">
              <v-skeleton-loader
                height="24"
                width="75%"
              />
              <v-skeleton-loader
                height="18"
                width="100%"
              />
              <v-skeleton-loader
                height="18"
                width="85%"
              />
              <v-skeleton-loader
                height="30"
                width="150"
                class="rounded-pill mt-2"
              />
              <div class="d-flex align-center ga-1">
                <v-skeleton-loader
                  height="18"
                  width="18"
                  class="rounded-lg"
                />
                <v-skeleton-loader
                  height="16"
                  width="170"
                />
              </div>
            </div>
          </v-card>
        </div>
      </v-card>
    </div>
  </v-card>
</template>
