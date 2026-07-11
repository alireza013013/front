import type {
  ApiResult,
  AppError,
} from '@/types'

const loadingFollow = ref(false)
const loadingUnfollow = ref(false)

// const NAME = 'Connection'

export const useConnection = () => {
  const { $toast } = useNuxtApp()

  const handleError = (err: unknown) => {
    const error = err as AppError

    if (error.response?.status === 400) {
      $toast.error(error.response.data?.message || '')
    }
  }

  const showResponseError = (response: ApiResult<unknown>) => {
    if (response.errors && response.errors.length > 0) {
      $toast.error(response.errors[0].message || '')
    }
    else {
      $toast.error('The operation failed. Please try again later.')
    }
  }

  const follow = async (id: string) => {
    loadingFollow.value = true

    try {
      const response = await useApiService.post<ApiResult<boolean>>(
        `/api/v2/connections/users/${id}/follow`,
        {
          subscribeToActivityFeed: true,
        },
      )

      if (response.succeeded) {
        $toast.success(`You are now following this user.`)
      }
      else {
        showResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      handleError(err)

      return {
        succeeded: false,
        status: 0,
        data: false,
      }
    }
    finally {
      loadingFollow.value = false
    }
  }

  const unFollow = async (id: string) => {
    loadingUnfollow.value = true

    try {
      const response = await useApiService.post<ApiResult<boolean>>(
        `/api/v2/connections/users/${id}/unfollow`,
        {
          twoWayRevoke: true,
        },
      )

      if (response.succeeded) {
        $toast.success(`You have unfollowed this user.`)
      }
      else {
        showResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      handleError(err)

      return {
        succeeded: false,
        status: 0,
        data: false,
      }
    }
    finally {
      loadingUnfollow.value = false
    }
  }

  return {
    loadingUnfollow,
    loadingFollow,
    follow,
    unFollow,
  }
}
