"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { handleAuthCallback, handleGmailCallback } from "@/lib/auth"
import Cookies from "js-cookie"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
console.log(`searchparams", ${searchParams}`);
const hasProcessedRef = useRef(false);
const TOKEN_COOKIE = "getaligned_token"

  useEffect(() => {
    console.log("1");
    if (hasProcessedRef.current) return
    hasProcessedRef.current = true

    const code = searchParams.get("code")
    console.log("code here at callback", code);
    const error = searchParams.get("error")

    if (error) {
      setError("Authentication failed. Please try again.")
      setTimeout(() => {
        if(Cookies.get(TOKEN_COOKIE)){
          router.push("/")
        }
        else{
          router.push("/login")
        }
      }, 3000)
      return
    }

    if (!code) {
      setError("No authorization code received. Please try again.")
      setTimeout(() => {
        if(Cookies.get(TOKEN_COOKIE)){
          router.push("/")
        }
        else{
          router.push("/login")
        }
      }, 3000)
      return
    }

    const processAuth = async () => {
      console.log("code printed",code);
      try {
        if(Cookies.get(TOKEN_COOKIE)){
          console.log("already logged in");
          await handleGmailCallback(code);
        }
        else{
          let data = await handleAuthCallback(code);
          console.log("got data at process auth",data);
        }
          router.push("/")
      } catch (err) {
        console.error("Auth callback error:", err)
        setError("Failed to complete authentication. Please try again.")
          router.push("/login")
      }
    }

    processAuth()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 w-full">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow rounded-lg">
        {error ? (
          <div className="text-center">
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
            <p className="text-gray-500">Redirecting you back to login...</p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Completing authentication...</h2>
            <p className="text-gray-500">Please wait while we set up your account.</p>
          </div>
        )}
      </div>
    </div>
  )
}


