"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, getUserEmail, logout } from "@/lib/auth"

interface AuthContextType {
  isLoggedIn: boolean
  userEmail: string | undefined
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check authentication status
    const authStatus = isAuthenticated()
    setIsLoggedIn(authStatus)

    if (authStatus) {
      setUserEmail(getUserEmail())
    }

    // Redirect to login if not authenticated and not already on login or callback page
    if (!authStatus && pathname !== "/login" && !pathname.startsWith("/auth/callback")) {
      router.push("/login")
    }
  }, [pathname, router])

  const value = {
    isLoggedIn,
    userEmail,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

