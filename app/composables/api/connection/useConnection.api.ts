import type {
  ApiResult,
} from '@/types'

const loadingFollow = ref(false)
const loadingUnfollow = ref(false)

// const NAME = 'Connection'

export const useConnection = () => {
  const { $toast } = useNuxtApp()
  const { handleApiResponseError, handleApiCatchError, createApiFailure } = useApiErrorHandler()

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
        handleApiResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      handleApiCatchError(err)

      return createApiFailure<boolean>(err, false)
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
        handleApiResponseError(response)
      }

      return response
    }
    catch (err: unknown) {
      handleApiCatchError(err)

      return createApiFailure<boolean>(err, false)
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
