"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getGoogleAuthUrl } from "@/services/authService"
import { Loader } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isLoggedIn, loading } = useAuth()

  // Redirect to home if already logged in
  useEffect(() => {
    if (isLoggedIn && !loading) {
      router.replace("/")
    }
  }, [isLoggedIn, loading, router])

  // If still checking auth status, show loading
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">Checking authentication status...</p>
      </div>
    )
  }

  // If logged in, we'll redirect (handled by the useEffect)
  // If not logged in, show the login page
  const handleGoogleLogin = () => {
    setIsLoading(true)
    window.location.href = getGoogleAuthUrl()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary">
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">GA</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-primary">GetAligned</h1>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-6 text-center text-xl font-medium text-gray-700">
            Sign in to access your meeting summaries and insights
          </h2>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to allow GetAligned to access your Google Calendar
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">© 2025 GetAligned. All rights reserved.</p>
      </div>
    </div>
  )
}
