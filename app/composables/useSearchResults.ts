import type {
  SearchQuery,
  SearchResourceItem,
  SearchResultsOptions,
  SearchResultsResult,
} from '@/types/search'
import { useSearchApi } from '@/composables/api/search/useSearch.api'
import { buildSearchParams, normalizeSearchService } from '@/utils/searchServices'

const normalizeRouteQuery = (query: ReturnType<typeof useRoute>['query']): SearchQuery => {
  const normalizedQuery: SearchQuery = {}

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      normalizedQuery[key] = value.filter(item => item != null)
      return
    }

    normalizedQuery[key] = value ?? undefined
  })

  return normalizedQuery
}

export const useSearchResults = (options: SearchResultsOptions = {}): SearchResultsResult => {
  const route = useRoute()
  const router = useRouter()
  const { getData } = useSearchApi()

  const perPage = options.perPage ?? 10
  const data = ref<SearchResourceItem[]>([])
  const totalDataFound = ref<number | string>(0)
  const isInitialLoading = ref(false)
  const isPaginationLoading = ref(false)
  const isAllDataLoaded = ref(false)
  const currentPage = ref(Number(route.query.page) || 1)
  const querySearch = ref<SearchQuery>({
    ...normalizeRouteQuery(route.query),
    type: normalizeSearchService(route.query.type),
  })

  const getDataList = async (page = currentPage.value): Promise<SearchResourceItem[]> => {
    if (isAllDataLoaded.value) return []

    try {
      const params = buildSearchParams(querySearch.value, page, perPage)
      const response = await getData(params, { public: true })

      if (!response.data) {
        totalDataFound.value = 0
        return []
      }

      const list = response.data.list ?? []
      totalDataFound.value = response.data.num || 0

      if (list.length < perPage) {
        isAllDataLoaded.value = true
      }

      return list
    }
    catch (error) {
      console.error(error)
      return []
    }
  }

  const fetchInitialResults = async () => {
    isAllDataLoaded.value = false
    isInitialLoading.value = true
    currentPage.value = Number(route.query.page) || 1
    querySearch.value = {
      ...normalizeRouteQuery(route.query),
      type: normalizeSearchService(route.query.type),
    }

    try {
      data.value = await getDataList(currentPage.value)
    }
    finally {
      isInitialLoading.value = false
    }
  }

  const reloadResults = async (query?: SearchQuery) => {
    const nextQuery = query ?? normalizeRouteQuery(route.query)

    isAllDataLoaded.value = false
    isInitialLoading.value = true
    currentPage.value = 1
    querySearch.value = {
      ...nextQuery,
      type: normalizeSearchService(nextQuery.type),
    }

    try {
      data.value = await getDataList(1)
    }
    finally {
      isInitialLoading.value = false
    }
  }

  const loadNextPage = async () => {
    if (isAllDataLoaded.value || isPaginationLoading.value) return

    currentPage.value += 1
    isPaginationLoading.value = true

    await router.replace({
      query: {
        ...route.query,
        page: currentPage.value,
      },
    })

    try {
      const nextData = await getDataList(currentPage.value)
      data.value = [...data.value, ...nextData]
    }
    finally {
      isPaginationLoading.value = false
    }
  }

  if (options.immediate) {
    onMounted(fetchInitialResults)
  }

  return {
    data,
    totalDataFound,
    isInitialLoading,
    isPaginationLoading,
    isAllDataLoaded,
    currentPage,
    fetchInitialResults,
    reloadResults,
    loadNextPage,
  }
}
