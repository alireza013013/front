import type {
  ApiResult,
  DownloadResponseDTO,
  ExamExportFileType,
  ExamExportPriceDTO,
  ExamExportPricesDTO,
} from '@/types'

/**
 * Downloads our own exam export (gamatrain-back `GET exams/export`) for the exam details page.
 *
 * One request both builds and returns the file, so the button shows two phases:
 * - 'cooking': the server is generating the file (everything before the response headers arrive);
 * - 'downloading': the file is streaming in, with real progress from Content-Length.
 *
 * A network or server failure is retried automatically (EXAM_EXPORT_AUTO_RETRY_DELAYS): the row shows
 * 'waiting' with a countdown, and a click skips the wait. Once those retries are used up, or the server
 * refused the export outright, the row shows 'failed' until the user clicks it to start again.
 *
 * The backend charges on the first export of each exam + format (ExamDownload quota, then points) and
 * answers a refused charge with the same JSON as `POST downloads`, so the page's existing
 * insufficient-balance/upgrade modals are reused through the same callbacks.
 */
export type ExamExportPhase = 'cooking' | 'downloading' | 'waiting' | 'failed'

/** Seconds to wait before each automatic retry; its length is the number of automatic retries. */
export const EXAM_EXPORT_AUTO_RETRY_DELAYS = [3, 5, 8]

export interface ExamExportRetry {
  /** Which automatic retry this is (1-based). */
  attempt: number
  /** Seconds until it starts, while the row is 'waiting'. */
  secondsLeft: number
  /** The full wait for this retry, for the countdown ring. */
  delay: number
}

/** Network errors, timeouts and server errors may pass on a second try; other refusals will not. */
const isRetryableStatus = (status: number) => status >= 500 || status === 408 || status === 429

interface UseExamExportDownloadOptions {
  examId: string | number
  title: string
  titleUrl: string
  /**
   * An export finished: `points` were charged (0 when it was free or already bought).
   * `file` is the generated file, for callers that offer to open it again.
   */
  onDownloaded?: (points: number, file: Blob) => void
  onInsufficientBalance?: () => void
  onUpgradeSuggestions?: (data: DownloadResponseDTO) => void
}

const extensions: Record<ExamExportFileType, string> = {
  Pdf: 'pdf',
  Word: 'docx',
  PowerPoint: 'pptx',
}

const fileNameFromDisposition = (disposition: string | null) => {
  if (!disposition) {
    return null
  }

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (encoded?.[1]) {
    return decodeURIComponent(encoded[1])
  }

  return /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? null
}

const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export const useExamExportDownload = (options: UseExamExportDownloadOptions) => {
  const { $toast } = useNuxtApp()
  const auth = useAuth()
  const router = useRouter()
  const config = useRuntimeConfig()
  const { trackFileDownload } = useGtmEvents()

  const prices = ref<ExamExportPriceDTO[]>([])
  const phases = ref<Partial<Record<ExamExportFileType, ExamExportPhase>>>({})
  const progress = ref<Partial<Record<ExamExportFileType, number>>>({})

  const getPrice = (fileType: ExamExportFileType) => prices.value.find(t => t.fileType === fileType)
  const getPhase = (fileType: ExamExportFileType) => phases.value[fileType]
  const getProgress = (fileType: ExamExportFileType) => progress.value[fileType] ?? 0

  const retries = ref<Partial<Record<ExamExportFileType, ExamExportRetry>>>({})
  const getRetry = (fileType: ExamExportFileType) => retries.value[fileType]

  // Countdown timers for the automatic retries.
  const countdowns = new Map<ExamExportFileType, ReturnType<typeof setInterval>>()

  const stopCountdown = (fileType: ExamExportFileType) => {
    clearInterval(countdowns.get(fileType))
    countdowns.delete(fileType)
  }

  const clear = (fileType: ExamExportFileType) => {
    stopCountdown(fileType)
    Reflect.deleteProperty(phases.value, fileType)
    Reflect.deleteProperty(progress.value, fileType)
    Reflect.deleteProperty(retries.value, fileType)
  }

  onScopeDispose(() => {
    countdowns.forEach(timer => clearInterval(timer))
    countdowns.clear()
  })

  // Open to guests (prices only); with a signed-in user it also says which formats they already bought.
  const fetchPrices = async () => {
    try {
      const response = await useApiService.get<ApiResult<ExamExportPricesDTO>>(
        '/api/v2/exams/export/prices',
        { id: options.examId },
      )
      prices.value = response.succeeded && response.data ? response.data.items : []
    }
    catch {
      prices.value = []
    }
  }

  const redirectToLogin = () => {
    router.push({})
    setTimeout(() => {
      router.push({ query: { auth_form: 'login', auth_noredirect: 'true' } })
    }, 100)
  }

  /** Reads the body chunk by chunk, reporting progress when the server sent Content-Length. */
  const readWithProgress = async (response: Response, fileType: ExamExportFileType) => {
    const total = Number(response.headers.get('Content-Length')) || 0
    if (!response.body || !total) {
      return await response.blob()
    }

    const reader = response.body.getReader()
    const chunks: BlobPart[] = []
    let received = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }

      chunks.push(value)
      received += value.length
      progress.value[fileType] = Math.min(100, Math.round((received / total) * 100))
    }

    return new Blob(chunks, { type: response.headers.get('Content-Type') || undefined })
  }

  /** A refused charge (or any other error) comes back as JSON instead of the file. */
  const handleJsonResponse = async (response: Response, fileType: ExamExportFileType) => {
    const result = await response.json() as ApiResult<DownloadResponseDTO>
    if (result.data?.upgradeSuggestions && result.data.upgradeSuggestions.length > 0) {
      clear(fileType)
      options.onUpgradeSuggestions?.(result.data)
      return
    }

    const message = result.errors?.[0]?.message
    if (message === 'InsufficientBalance') {
      clear(fileType)
      options.onInsufficientBalance?.()
      return
    }

    fail(fileType, { retryable: false, message })
  }

  /** Waits and retries on its own while automatic retries are left; otherwise stops and tells the user. */
  const fail = (fileType: ExamExportFileType, { retryable, message }: { retryable: boolean, message?: string }) => {
    stopCountdown(fileType)
    progress.value[fileType] = 0
    const attempt = (retries.value[fileType]?.attempt ?? 0) + 1
    const delay = EXAM_EXPORT_AUTO_RETRY_DELAYS[attempt - 1]

    if (!retryable || delay === undefined) {
      phases.value[fileType] = 'failed'
      Reflect.deleteProperty(retries.value, fileType)
      $toast.error(message || 'Download failed. Please try again.')
      return
    }

    phases.value[fileType] = 'waiting'
    retries.value[fileType] = { attempt, secondsLeft: delay, delay }
    countdowns.set(fileType, setInterval(() => {
      const retry = retries.value[fileType]
      if (!retry) {
        stopCountdown(fileType)
        return
      }
      retry.secondsLeft -= 1
      if (retry.secondsLeft <= 0) {
        stopCountdown(fileType)
        runExport(fileType)
      }
    }, 1000))
  }

  /** One request for the file; on failure `fail` decides whether to try again. */
  const runExport = async (fileType: ExamExportFileType) => {
    phases.value[fileType] = 'cooking'
    progress.value[fileType] = 0

    let response: Response
    let blob: Blob
    try {
      const query = new URLSearchParams({ id: String(options.examId), fileType })
      response = await fetch(`${config.public.apiV2BaseUrl}/exams/export?${query}`, {
        headers: { Authorization: `Bearer ${auth.getUserToken()}` },
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        clear(fileType)
        redirectToLogin()
        return
      }

      if (!response.ok) {
        fail(fileType, { retryable: isRetryableStatus(response.status) })
        return
      }

      if (response.headers.get('Content-Type')?.includes('application/json')) {
        await handleJsonResponse(response, fileType)
        return
      }

      phases.value[fileType] = 'downloading'
      blob = await readWithProgress(response, fileType)
    }
    catch {
      // The connection dropped before or while the file came in.
      fail(fileType, { retryable: true })
      return
    }

    progress.value[fileType] = 100
    saveBlob(blob, fileNameFromDisposition(response.headers.get('Content-Disposition'))
    ?? `${options.title || 'exam'}.${extensions[fileType]}`)

    options.onDownloaded?.(Number(response.headers.get('X-Export-Points')) || 0, blob)
    await fetchPrices()
    setTimeout(() => clear(fileType), 800)
  }

  const startExport = (fileType: ExamExportFileType) => {
    const phase = phases.value[fileType]
    if (phase === 'cooking' || phase === 'downloading') {
      return
    }

    // A click during the countdown retries now, and keeps counting the automatic retries.
    if (phase === 'waiting') {
      stopCountdown(fileType)
      runExport(fileType)
      return
    }

    if (!auth.isAuthenticated.value) {
      redirectToLogin()
      return
    }

    // A fresh click (or one after giving up) starts over with the full set of automatic retries.
    clear(fileType)
    trackFileDownload({ file_type: 'exam', file_name: options.title, file_url: options.titleUrl })
    runExport(fileType)
  }

  return {
    prices,
    fetchPrices,
    getPrice,
    getPhase,
    getProgress,
    getRetry,
    startExport,
  }
}
