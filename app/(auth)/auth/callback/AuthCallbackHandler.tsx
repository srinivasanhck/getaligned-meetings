// app/auth/callback/AuthCallbackHandler.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleAuthCallback, checkUserScope, isAuthenticated } from "@/services/authService"

export default function AuthCallbackHandler() {
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

    // Rest of your existing useEffect logic
    // ...
  }, [router, searchParams])

  return (
    <>
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
    </>
  )
}