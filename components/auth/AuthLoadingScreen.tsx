"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname, useRouter } from "next/navigation"

export default function AuthLoadingScreen({ children }: { children: React.ReactNode }) {
  const { loading, isLoggedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  // Determine if the current route is a public route that doesn't require auth
  const isPublicRoute = pathname === "/login" || pathname === "/auth/callback"

  useEffect(() => {
    // If we're on the login page and already logged in, redirect to home
    if (!loading && isLoggedIn && pathname === "/login") {
      router.replace("/")
      return
    }

    // Only render content when:
    // 1. Authentication check is complete (loading is false), AND
    // 2. Either the user is logged in OR we're on a public route
    if (!loading && (isLoggedIn || isPublicRoute)) {
      setShouldRender(true)
    } else if (!loading && !isLoggedIn && !isPublicRoute) {
      // If auth check is complete, user is not logged in, and route is protected,
      // redirect to login without rendering the protected content
      router.replace("/login")
    }
  }, [loading, isLoggedIn, isPublicRoute, pathname, router])

  // Show loading screen while authentication is being checked
  if (loading || !shouldRender) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Render the actual content once authentication is confirmed
  return <>{children}</>
}
