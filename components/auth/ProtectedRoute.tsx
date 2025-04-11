"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading, checkCalendarAccess } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoggedIn && !loading) {
        setIsChecking(true)
        try {
          // Check calendar access but don't redirect
          await checkCalendarAccess()
        } catch (error) {
          console.error("Error checking calendar access:", error)
        } finally {
          setIsChecking(false)
        }
      } else {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [isLoggedIn, loading, checkCalendarAccess, router])

  if (loading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  // Allow access if logged in (we don't redirect here anymore)
  return isLoggedIn ? <>{children}</> : null
}
