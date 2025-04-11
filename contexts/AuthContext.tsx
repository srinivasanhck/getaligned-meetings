"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  isAuthenticated,
  getToken,
  getUserEmail,
  logout,
  checkUserScope,
  hasCalendarAccess as getCalendarAccessFromCookie,
} from "@/services/authService"

interface AuthContextType {
  isLoggedIn: boolean
  token: string | undefined
  email: string | undefined
  loading: boolean
  calendarAccessLoading: boolean
  hasCalendarAccess: boolean
  checkCalendarAccess: () => Promise<boolean>
  shouldRefreshCalendarAccess: () => boolean
  logout: () => void
  authError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [hasCalendarAccess, setHasCalendarAccess] = useState<boolean>(false)
  const [calendarAccessLoading, setCalendarAccessLoading] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [lastCheckedToken, setLastCheckedToken] = useState<string | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Function to check calendar access
  const checkCalendarAccess = async (): Promise<boolean> => {
     // Don't check if we're already loading
     if (calendarAccessLoading) return hasCalendarAccess
    setCalendarAccessLoading(true)
    try {
      const currentToken = getToken()
       // Check if we already have a cached result that's recent
       const cachedAccess = getCalendarAccessFromCookie()
       const shouldForceCheck = currentToken !== lastCheckedToken
 
       if (!shouldForceCheck && cachedAccess !== undefined) {
         setHasCalendarAccess(cachedAccess)
         setLastCheckedToken(currentToken)
         return cachedAccess
       }
      const hasAccess = await checkUserScope()
      setHasCalendarAccess(hasAccess)
      setLastCheckedToken(currentToken)
      return hasAccess
    } catch (error) {
      console.error("Error checking calendar access:", error)
      setHasCalendarAccess(false)
      return false
    } finally {
      setCalendarAccessLoading(false)
    }
  }

  // Check for auth errors in URL
  useEffect(() => {
    const errorParam = searchParams.get("authError")
    if (errorParam) {
      setAuthError(decodeURIComponent(errorParam))
      // Remove the error parameter from the URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [searchParams])

  useEffect(() => {
    // Skip auth check on callback page to prevent interference
    if (pathname === "/auth/callback") {
      setLoading(false)
      return
    }

    // Check authentication status
    const checkAuth = async () => {
      console.log("AuthContext: Checking authentication status")
      const authenticated = isAuthenticated()
      console.log("AuthContext: Is authenticated:", authenticated)

      const currentToken = getToken()
      setIsLoggedIn(authenticated)
      setToken(currentToken)
      setEmail(getUserEmail())

      if (authenticated) {
        // Check if we already know about calendar access from cookie or localStorage
        const cachedCalendarAccess = getCalendarAccessFromCookie()

        // If token has changed since last check, force a new check
        const shouldForceCheck = currentToken !== lastCheckedToken

        if (shouldForceCheck) {
          console.log("AuthContext: Token changed, forcing calendar access check")
          await checkCalendarAccess()
        } else {
          setHasCalendarAccess(cachedCalendarAccess)
          console.log("AuthContext: Has calendar access (from cache):", cachedCalendarAccess)

          // If we're on the main page or dashboard, check calendar access in the background
          // but only if we haven't checked recently
          if ((pathname === "/" || pathname.includes("/dashboard")) && shouldRefreshCalendarAccess()) {
            checkCalendarAccess()
          }
        }
      }

      // Set loading to false AFTER all checks are complete
      setLoading(false)
    }

    checkAuth()
  }, [pathname, lastCheckedToken])


  const handleLogout = () => {
    logout()
    setIsLoggedIn(false)
    setToken(undefined)
    setEmail(undefined)
    setHasCalendarAccess(false)
    setLastCheckedToken(undefined)
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        email,
        loading,
        calendarAccessLoading,
        hasCalendarAccess,
        checkCalendarAccess,
        shouldRefreshCalendarAccess: () => shouldRefreshCalendarAccess(),
        logout: handleLogout,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}



// Helper function to determine if we should refresh calendar access
const shouldRefreshCalendarAccess = () => {
  // Implement your logic here to determine if a refresh is needed
  // For example, check the last time the calendar access was checked
  // and only refresh if it was longer than a certain duration ago.
  // This is a placeholder and needs to be implemented based on your requirements.
  return true // Always refresh for now (replace with actual logic)
}