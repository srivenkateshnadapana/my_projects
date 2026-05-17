import * as React from "react"
import { useNavigate } from "react-router-dom"
import { StorageService } from "../services/storage"
import { authStore } from "../utils/authStore"

export function ProtectedRoute({ 
  children, 
  fallbackPath = "/auth",
  requiredRole = null
}) {
  const navigate = useNavigate()
  const [isHydrated, setIsHydrated] = React.useState(false)
  const [authState, setAuthState] = React.useState(authStore.getSnapshot())

  React.useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAuthState(state)
      
      if (!state.isAuthenticated) {
        navigate(fallbackPath)
      } else if (requiredRole && state.user?.role !== requiredRole) {
        navigate("/unauthorized")
      }
    })

    // Initial check
    if (!authState.isAuthenticated) {
      navigate(fallbackPath)
    } else if (requiredRole && authState.user?.role !== requiredRole) {
      navigate("/unauthorized")
    }

    setIsHydrated(true)
    return unsubscribe
  }, [navigate, fallbackPath, requiredRole])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-headline font-bold text-primary tracking-tighter uppercase">Initializing...</p>
        </div>
      </div>
    )
  }

  if (authState.isAuthenticated) {
    if (requiredRole && authState.user?.role !== requiredRole) {
      return null // Will be handled by navigate in useEffect
    }
    return <>{children}</>
  }

  return null
}
