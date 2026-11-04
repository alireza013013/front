import type {
  ApiResult,
  GetUserSubscriptionUsageParams,
  ResponseListDTO,
  UserSubscriptionUsageDTO,
  UserSubscriptionUsageSummaryDTO,
} from '@/types'

// The caller's own quota usage log (GET subscriptions/me/usage) and its per-feature totals
// (GET subscriptions/me/usage/summary). The list is always newest first; `append` adds the next
// page under the rows already loaded, for a "Load more" list.
export const useSubscriptionUsage = () => {
  const { handleApiResponseError, handleApiCatchError, createApiFailure } = useApiErrorHandler()

  const usage = ref<UserSubscriptionUsageDTO[]>([])
  const usageTotalCount = ref(0)
  const usageSummary = ref<UserSubscriptionUsageSummaryDTO[]>([])
  const loadingUsage = ref(false)
  const loadingUsageSummary = ref(false)

  const getUsage = async (params: GetUserSubscriptionUsageParams, append = false) => {
    loadingUsage.value = true
    try {
      const response = await useApiService.get<
        ApiResult<ResponseListDTO<UserSubscriptionUsageDTO>>
      >(
        `/api/v2/subscriptions/me/usage`,
        {
          'PagingDto.PageFilter.Size': params.pageSize,
          'PagingDto.PageFilter.Skip': (params.page - 1) * params.pageSize,
          'PagingDto.PageFilter.ReturnTotalRecordsCount': true,
          ...(params.featureCode ? { FeatureCode: params.featureCode } : {}),
          ...(params.fromDate ? { FromDate: params.fromDate } : {}),
          ...(params.toDate ? { ToDate: params.toDate } : {}),
        },
      )

      if (response.succeeded && response.data) {
        const list = response.data.list ?? []
        usage.value = append ? [...usage.value, ...list] : list
        usageTotalCount.value = response.data.totalRecordsCount
      }
      else {
        if (!append) {
          usage.value = []
          usageTotalCount.value = 0
        }
        handleApiResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      handleApiCatchError(err)

      return createApiFailure<ResponseListDTO<UserSubscriptionUsageDTO>>(err)
    }
    finally {
      loadingUsage.value = false
    }
  }

  const getUsageSummary = async (fromDate: string, toDate: string) => {
    loadingUsageSummary.value = true
    try {
      const response = await useApiService.get<
        ApiResult<UserSubscriptionUsageSummaryDTO[]>
      >(`/api/v2/subscriptions/me/usage/summary`, { FromDate: fromDate, ToDate: toDate })

      if (response.succeeded) {
        usageSummary.value = response.data ?? []
      }
      else {
        usageSummary.value = []
        handleApiResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      usageSummary.value = []
      handleApiCatchError(err)

      return createApiFailure<UserSubscriptionUsageSummaryDTO[]>(err)
    }
    finally {
      loadingUsageSummary.value = false
    }
  }

  return { usage, usageTotalCount, loadingUsage, getUsage, usageSummary, loadingUsageSummary, getUsageSummary }
}
