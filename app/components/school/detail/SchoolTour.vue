<template>
  <div class="position-relative w-100 h-100">
    <template v-if="tourImgPreview">
      <v-img
        :src="tourImgPreview"
        alt="Preview of the 360° tour image you picked"
        cover
        class="w-100 h-100"
      />
      <div class="tour-overlay d-flex justify-center ga-2 pa-3">
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          class="text-none"
          prepend-icon="mdi-cloud-upload-outline"
          @click="uploadTourImage"
        >
          Upload
        </v-btn>
        <v-btn
          variant="flat"
          class="text-none gtext-t5"
          @click="clearTourImage"
        >
          Cancel
        </v-btn>
      </div>
    </template>
    <template v-else-if="currentTour">
      <v-img
        :src="currentTour"
        alt="360° tour of the school"
        cover
        class="w-100 h-100"
      />
      <v-btn
        class="tour-replace"
        icon="mdi-pencil-outline"
        size="small"
        variant="flat"
        aria-label="Replace the 360° tour image"
        @click="openTourImgInput"
      />
    </template>
    <school-detail-media-empty
      v-else
      icon="mdi-rotate-360"
      title="No 360° tour yet"
      action="Upload a panorama photo"
      hint="JPG, PNG or WebP, up to 5 MB"
      @click="openTourImgInput"
    />
    <input
      ref="tourImgRef"
      type="file"
      class="d-none"
      accept="image/jpeg, image/png, image/jpg, image/webp"
      @change="onFilePicked"
    >
  </div>
</template>

<script setup>
const props = defineProps({
  tour: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['fetch'])
const loading = ref(false)
const nuxtApp = useNuxtApp()
const route = useRoute()
const currentTour = ref(props.tour)
const tourImgPreview = ref(null)
const tourImg = ref(null)
const tourImgRef = ref(null)
const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
const maxSize = 5 * 1024 * 1024

watch(() => props.tour, (val) => {
  currentTour.value = val
})

function onFilePicked(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (!validTypes.includes(file.type)) {
    nuxtApp.$toast?.error('Invalid file type. Please use JPG, PNG or WebP images.')
    return
  }
  if (file.size > maxSize) {
    nuxtApp.$toast?.error('File too large. Maximum size is 5MB.')
    return
  }
  tourImg.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    tourImgPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function uploadTourImage() {
  if (!tourImg.value) {
    nuxtApp.$toast?.error('Please select an image to upload')
    return
  }
  loading.value = true
  const formData = new FormData()
  formData.append('File', tourImg.value)
  formData.append('FileType', 'Tour360')
  useApiService
    .post(`/api/v2/schools/${route.params.id}/images`, formData)
    .then(() => {
      nuxtApp.$toast?.success('Your 360° tour image has been successfully uploaded')
      clearTourImage()
      emit('fetch')
    })
    .catch((err) => {
      if (err?.response?.status == 401 || err?.response?.status == 403) {
        nuxtApp.$toast?.error('Please login to update tour content')
      }
      else {
        nuxtApp.$toast?.error(err?.response?.data?.message || 'Upload failed')
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const { requireSignIn } = useContributeGate()

function openTourImgInput() {
  if (!requireSignIn()) return
  tourImgRef.value?.click()
}

function clearTourImage() {
  tourImg.value = null
  tourImgPreview.value = null
}

defineExpose({ openTourImgInput })
</script>

<style scoped>
.tour-overlay {
  position: absolute;
  inset: auto 0 0;
  background: linear-gradient(transparent, rgba(var(--v-theme-grey900), 0.5));
}

.tour-replace {
  position: absolute;
  top: 12px;
  right: 12px;
}
</style>
