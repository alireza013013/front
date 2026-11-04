/**
 * Ask a signed-out visitor to sign in before they open a contribution editor, instead of letting
 * them fill it in and only then failing with "please login". Returns true when they may go on.
 */
export const useContributeGate = () => {
  const auth = useAuth()
  const router = useRouter()
  const route = useRoute()

  function requireSignIn(): boolean {
    if (auth.isAuthenticated.value) return true
    router.push({ query: { ...route.query, auth_form: 'login', auth_noredirect: 'true' } })
    return false
  }

  return { requireSignIn }
}
