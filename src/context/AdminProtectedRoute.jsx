import * as React from "react"
import { useNavigate } from "react-router-dom"
import { StorageService } from "../services/storage"
import { authStore } from "../utils/authStore"

export function AdminProtectedRoute({ children }) {
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [authState, setAuthState] = React.useState(authStore.getSnapshot())

  React.useEffect(() => {
    const checkAuth = (state) => {
      setAuthState(state)
      if (!state.isAuthenticated || state.user?.role !== 'admin') {
        navigate("/")
      }
    }

    if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
      navigate("/")
    }
    
    setIsHydrated(true)
    const unsubscribe = authStore.subscribe(checkAuth)
    return unsubscribe
  }, [navigate])

  if (!isHydrated) return null

  if (authState.isAuthenticated && authState.user?.role === 'admin') {
    return <>{children}</>
  }

  return null
}
