"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { isAuthenticated } from "@/lib/auth"
import Image from "next/image"
import { CLIENT_ID } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [buttonHovered, setButtonHovered] = useState(false)


  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  const handleGoogleLogin = () => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the current origin for the redirect URI
      const redirectUri = process.env.NEXT_PUBLIC_isLocalhost == "true" ? "http://localhost:3000/auth/callback" : "https://app.getaligned.work/auth/callback";
      console.log("Redirect URI:", redirectUri) // Log the redirect URI
      const client_id = CLIENT_ID;

      console.log("clientid here", client_id);

      // Construct the auth URL with all required scopes
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent`

      // Redirect to Google's OAuth page
      window.location.href = authUrl
    } catch (err) {
      console.error("Login error:", err)
      setError("Failed to initiate login. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md px-4 sm:px-6 mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden">
              <Image src="https://s3.ap-south-1.amazonaws.com/getaligned.work/GetAligned+1.png" alt="GetAligned Logo" width={56} height={56} className="animate-fadeIn" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800">
              GetAligned
            </h1>
          </div>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Sign in to access your meeting summaries and insights
          </p>
        </div>

        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 shadow-lg sm:rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border-l-4 border-red-500 animate-fadeIn">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              className={`w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 py-5 sm:py-6 text-base font-medium transition-all duration-300 hover:shadow-md ${
                buttonHovered ? "scale-[1.02]" : ""
              } ${isLoading ? "opacity-80" : ""}`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-purple" />
              ) : (
                <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              )}
              <span className="ml-2">{isLoading ? "Signing in..." : "Sign in with Google"}</span>
            </Button>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>By signing in, you agree to allow GetAligned to access your Google Calendar</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2025 GetAligned. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

