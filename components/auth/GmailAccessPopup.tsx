"use client"

import { useState } from "react"
import { Mail, Loader, X } from "lucide-react"
import { getGoogleAuthUrl } from "@/services/authService"

interface GmailAccessPopupProps {
  onClose: () => void
}

export default function GmailAccessPopup({ onClose }: GmailAccessPopupProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectGmail = () => {
    setIsLoading(true)
    // Redirect to Google OAuth with Gmail scope
    window.location.href = getGoogleAuthUrl(false, true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Gmail Access Required</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <Mail className="h-16 w-16 text-primary" />
        </div>

        <p className="mb-6 text-center text-gray-600">
          To send emails directly from GetAligned, we need access to your Gmail account. This allows us to send
          follow-up emails on your behalf.
        </p>

        <button
          onClick={handleConnectGmail}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect Gmail</>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          We only use this access to send emails you've composed. Your email data remains private and secure.
        </p>
      </div>
    </div>
  )
}
