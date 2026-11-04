<template>
  <v-container class="mt-16 d-flex flex-column align-start justify-start">
    <template v-if="loadingGetItemById">
      <user-exam-result-header-skeleton />
      <user-exam-result-overview-skeleton />
      <user-exam-result-summary-skeleton />
      <user-exam-result-answers-skeleton />
    </template>
    <template v-else-if="contentData">
      <user-exam-result-header
        :content-data="contentData"
      />

      <user-exam-result-overview
        :content-data="contentData"
      />

      <user-exam-result-summary
        :answer-stats="contentData?.answerStats"
        :rank="contentData?.rank"
        :result-analyze="analyzeData"
        @update-result-analyze="updateResultAnalyze"
      />

      <user-exam-result-answers
        :questions="contentData?.result"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import type {
  ExamResultDetailDTO,
  ExamResultAnalyzeResponseDTO,
  ExamAnalyzeDetailResponseDTO,
} from '@/types'

definePageMeta({
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Exam Result',
})

const route = useRoute()

const {
  getItemById,
  loadingGetItemById,
} = useExamResult()

const resultId = computed(() => String(route.params.id))
const contentData = ref<ExamResultDetailDTO | null>(null)
const analyzeData = ref<ExamResultAnalyzeResponseDTO | undefined>()

const fetchResult = async () => {
  const response = await getItemById(resultId.value)
  if (response.succeeded && response.data) {
    contentData.value = response.data.result
    analyzeData.value = response.data.analysis ?? undefined
  }
}

onMounted(() => {
  fetchResult()
})

// The analysis was just bought: keep its text so the next click opens it without charging again.
const updateResultAnalyze = (analysis: ExamAnalyzeDetailResponseDTO) => {
  analyzeData.value = {
    id: analysis.id,
    result: analysis.result,
    points: 0,
    purchased: true,
  }
}
</script>
