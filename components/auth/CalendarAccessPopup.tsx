"use client"

import { useState } from "react"
import { Calendar, Loader, X } from "lucide-react"
import { getGoogleAuthUrl } from "@/services/authService"

interface CalendarAccessPopupProps {
  onClose: () => void
}

export default function CalendarAccessPopup({ onClose }: CalendarAccessPopupProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConnectCalendar = () => {
    setIsLoading(true)
    // Redirect to Google OAuth with calendar scope
    window.location.href = getGoogleAuthUrl(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Calendar Access Required</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <Calendar className="h-16 w-16 text-primary" />
        </div>

        <p className="mb-6 text-center text-gray-600">
          To view your meetings and summaries, GetAligned needs access to your Google Calendar. This allows us to fetch
          your meeting details and provide insights.
        </p>

        <button
          onClick={handleConnectCalendar}
          disabled={isLoading}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect Calendar</>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-gray-500">
          We only access your calendar data to provide meeting summaries and insights. Your data is secure and private.
        </p>
      </div>
    </div>
  )
}
