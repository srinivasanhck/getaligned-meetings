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
    // Only make decisions when loading is complete
    if (!loading) {
      if (isLoggedIn) {
        // If logged in and on login page, redirect to home
        if (pathname === "/login") {
          router.replace("/")
        } else {
          setShouldRender(true)
        }
      } else if (!isPublicRoute) {
        // If not logged in and not on public route, redirect to login
        router.replace("/login")
      } else {
        // If on public route and not logged in, show content
        setShouldRender(true)
      }
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
