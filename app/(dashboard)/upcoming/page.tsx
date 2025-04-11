"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, ChevronDown } from "lucide-react"
import { fetchTodayMeetings, fetchNext7DaysMeetings } from "@/services/upcomingMeetingsService"
import { ToastProvider } from "@/components/ui/toast"
import DayMeetings from "@/components/upcoming/DayMeetings"
import { useAuth } from "@/contexts/AuthContext"
import CalendarAccessPopup from "@/components/auth/CalendarAccessPopup"
import type { Meeting } from "@/types/meetings"

type FilterType = "today" | "next7days"

export default function UpcomingMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("today")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCalendarPopup, setShowCalendarPopup] = useState(false)
  const { hasCalendarAccess } = useAuth()

  // Only fetch meetings if we have calendar access
  useEffect(() => {
    if (hasCalendarAccess) {
      const fetchMeetings = async () => {
        setLoading(true)
        setError(null)
        try {
          if (filter === "today") {
            const response = await fetchTodayMeetings()
            setMeetings(response.items || [])
          } else {
            const response = await fetchNext7DaysMeetings()
            setMeetings(response.items || [])
          }
        } catch (err) {
          console.error("Failed to fetch meetings:", err)
          setError("Failed to load upcoming meetings. Please try again.")
        } finally {
          setLoading(false)
        }
      }

      fetchMeetings()
    } else {
      // If no calendar access, clear meetings and stop loading
      setMeetings([])
      setLoading(false)
    }
  }, [filter, hasCalendarAccess])

  // Handle bot status change
  const handleBotStatusChange = useCallback((meetingId: string, hasBotEnabled: boolean) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((meeting) => (meeting.id === meetingId ? { ...meeting, meetingBot: hasBotEnabled } : meeting)),
    )
  }, [])

  // Group meetings by date
  const meetingsByDate: Record<string, Meeting[]> = {}
  meetings.forEach((meeting) => {
    const date = new Date(meeting.start.dateTime).toISOString().split("T")[0]
    if (!meetingsByDate[date]) {
      meetingsByDate[date] = []
    }
    meetingsByDate[date].push(meeting)
  })

  // Sort dates in ascending order
  const sortedDates = Object.keys(meetingsByDate).sort()

  // Render content based on calendar access
  const renderContent = () => {
    if (!hasCalendarAccess) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Calendar Access Required</h3>
          <p className="text-sm text-gray-500 max-w-md mb-4">
            Connect your Google Calendar to view your upcoming meetings.
          </p>
          <button
            onClick={() => setShowCalendarPopup(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Connect Calendar
          </button>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-purple-500"></div>
          <span className="ml-2 text-gray-500">Loading meetings...</span>
        </div>
      )
    }

    if (error) {
      return <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-700">{error}</div>
    }

    if (meetings.length === 0) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No upcoming meetings</h3>
          <p className="text-sm text-gray-500 max-w-md">
            {filter === "today"
              ? "You don't have any more meetings scheduled for today."
              : "You don't have any meetings scheduled for the next 7 days."}
          </p>
        </div>
      )
    }

    return (
      <div>
        {sortedDates.map((date) => (
          <DayMeetings
            key={date}
            date={date}
            meetings={meetingsByDate[date]}
            onBotStatusChange={handleBotStatusChange}
          />
        ))}
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="h-screen overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Upcoming Meetings</h1>

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={!hasCalendarAccess}
            >
              {filter === "today" ? (
                <>
                  <Calendar className="h-4 w-4" />
                  Today
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Next 7 days
                </>
              )}
              <ChevronDown className="h-4 w-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                <div className="py-1">
                  <button
                    className={`flex w-full items-center px-4 py-2 text-sm ${
                      filter === "today" ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setFilter("today")
                      setIsDropdownOpen(false)
                    }}
                  >
                    Today
                  </button>
                  <button
                    className={`flex w-full items-center px-4 py-2 text-sm ${
                      filter === "next7days" ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setFilter("next7days")
                      setIsDropdownOpen(false)
                    }}
                  >
                    Next 7 days
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {renderContent()}

        {/* Calendar Access Popup */}
        {showCalendarPopup && !hasCalendarAccess && <CalendarAccessPopup onClose={() => setShowCalendarPopup(false)} />}
      </div>
    </ToastProvider>
  )
}
