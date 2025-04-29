"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { handleHubspotCallback } from "@/services/hubspotService"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HubspotCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Use a ref to track if the API has already been called
  const apiCalledRef = useRef(false)

  useEffect(() => {
    // Only process if we haven't already called the API
    if (apiCalledRef.current) {
      return
    }

    const processCode = async () => {
      try {
        const code = searchParams.get("code")

        if (!code) {
          throw new Error("No authorization code received from HubSpot")
        }

        // Set the flag to true to prevent multiple calls
        apiCalledRef.current = true

        const result = await handleHubspotCallback(code)

        if (result.status === "success") {
          setStatus("success")
          // Redirect after a short delay to show success message
          setTimeout(() => {
            router.push("/integrations")
          }, 3000)
        } else {
          throw new Error(result.message || "Failed to connect to HubSpot")
        }
      } catch (error) {
        console.error("Error processing HubSpot callback:", error)
        setStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred")
      }
    }

    processCode()

    // Cleanup function
    return () => {
      // This ensures that if the component unmounts during the process,
      // we still have the flag set to prevent additional calls
      apiCalledRef.current = true
    }
  }, [searchParams, router])

  return (
    <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        {status === "loading" && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff7a59]"></div>
            <h2 className="mb-2 text-xl font-semibold">Connecting to HubSpot</h2>
            <p className="text-gray-600">Please wait while we complete the authentication process...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Successfully Connected!</h2>
            <p className="mb-4 text-gray-600">
              Your GetAligned account is now connected to HubSpot. You can now sync your meeting data.
            </p>
            <p className="text-sm text-gray-500">Redirecting you back to integrations page...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Connection Failed</h2>
            <p className="mb-4 text-gray-600">{errorMessage || "There was an error connecting to HubSpot."}</p>
            <Button onClick={() => router.push("/integrations")} className="w-full">
              Return to Integrations
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
