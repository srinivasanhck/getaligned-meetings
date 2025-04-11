"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleAuthCallback, checkUserScope, isAuthenticated } from "@/services/authService"

export const dynamic = 'force-dynamic' // Add this line

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("Authenticating...")
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError("Authentication was canceled or failed. Please try again.")
      // Redirect to home with error parameter instead of login
      setTimeout(
        () => (window.location.href = `/?authError=${encodeURIComponent("Authentication was canceled or failed")}`),
        3000,
      )
      return
    }

    if (!code) {
      setError("No authorization code received. Please try again.")
      // Redirect to home with error parameter instead of login
      setTimeout(
        () => (window.location.href = `/?authError=${encodeURIComponent("No authorization code received")}`),
        3000,
      )
      return
    }

    const processAuth = async () => {
      try {
        setStatus("Authenticating with Google...")
        console.log("Starting authentication process...")

        const authResult = await handleAuthCallback(code)
        console.log("Authentication completed successfully:", authResult)

        // Verify the token was set correctly
        const isLoggedIn = isAuthenticated()
        console.log("Is user authenticated after callback:", isLoggedIn)

        if (!isLoggedIn) {
          console.error("Token was not set properly in cookies or localStorage")
          setError("Failed to set authentication token. Please try again.")
          // Redirect to home with error parameter instead of login
          setTimeout(
            () => (window.location.href = `/?authError=${encodeURIComponent("Failed to set authentication token")}`),
            3000,
          )
          return
        }

        // Check calendar access but don't redirect based on it
        setStatus("Checking calendar access...")
        console.log("Checking calendar access...")
        try {
          await checkUserScope()
        } catch (scopeError) {
          console.error("Error checking calendar access:", scopeError)
          // Ignore error, we'll handle it in the UI
        }

        // Always redirect to home page
        console.log("Authentication complete, redirecting to home page...")
        window.location.href = "/"
      } catch (err: any) {
        console.error("Auth callback error:", err)
        setError(err.message || "Authentication failed. Please try again.")
        // Redirect to home with error parameter instead of login
        setTimeout(
          () => (window.location.href = `/?authError=${encodeURIComponent(err.message || "Authentication failed")}`),
          3000,
        )
      }
    }

    processAuth()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {error ? (
          <div className="text-center">
            <h2 className="mb-2 text-xl font-medium text-red-600">Authentication Error</h2>
            <p className="text-gray-600">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to home page...</p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="mb-4 text-xl font-medium text-gray-700">Completing Sign In</h2>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">{status}</p>
          </div>
        )}
      </div>
    </div>
  )
}
