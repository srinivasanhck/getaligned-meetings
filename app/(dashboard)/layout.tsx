"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { shouldRefreshCalendarAccess } from "@/services/authService"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    isLoggedIn,
    hasCalendarAccess,
    loading,
    calendarAccessLoading,
    checkCalendarAccess,
    // shouldRefreshCalendarAccess,
  } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoggedIn && !loading && !calendarAccessLoading) {
        // Only check if we're not already checking and we need to refresh
        if (shouldRefreshCalendarAccess()) {
          setIsChecking(true)
          try {
            await checkCalendarAccess()
          } catch (error) {
            console.error("Error checking calendar access:", error)
          } finally {
            setIsChecking(false)
          }
        } else {
          setIsChecking(false)
        }
      } else {
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [isLoggedIn, loading, calendarAccessLoading, checkCalendarAccess, shouldRefreshCalendarAccess])

  // Show loading state while checking authentication or calendar access
  if (loading || calendarAccessLoading || isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    )
  }

  // If not logged in, ProtectedRoute will handle it
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
