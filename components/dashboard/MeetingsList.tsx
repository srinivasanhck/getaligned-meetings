"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchMeetingsThunk,
  fetchMoreMeetingsThunk,
  getInitialDateRange,
  getDateRange,
} from "@/lib/redux/features/meetingsSlice"
import { fetchMeetingDetailsThunk, setSelectedMeetingId } from "@/lib/redux/features/meetingDetailsSlice"
import { groupMeetingsByDate, formatDateHeader } from "@/lib/utils/formatters"
import MeetingCard from "./MeetingCard"
import { CalendarIcon, Loader, ChevronDown, X, AlertCircle } from "lucide-react"
import MeetingsListSkeleton from "./MeetingsListSkeleton"
import MeetingsListError from "./MeetingsListError"
import MeetingsListEmpty from "./MeetingsListEmpty"
import DateRangePicker from "./DateRangePicker"
import { useAuth } from "@/contexts/AuthContext"
import CalendarAccessPopup from "../auth/CalendarAccessPopup"
import { useToast } from "@/components/ui/toast"

// Filter options
type FilterOption = "All" | "Calendar"

// Update the MeetingsList component to handle meeting selection
const MeetingsList = () => {
  const dispatch = useAppDispatch()
  const { meetings, loading, loadingMore, error, oldestDate, hasMore } = useAppSelector((state) => state.meetings)
  const { selectedMeetingId } = useAppSelector((state) => state.meetingDetails)
  const { hasCalendarAccess, authError } = useAuth()
  const [filter, setFilter] = useState<FilterOption>("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  })
  const [isCustomDateRange, setIsCustomDateRange] = useState(false)
  const [showCalendarPopup, setShowCalendarPopup] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)

  // Reference to the container for scroll detection
  const containerRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Show auth error if present
  useEffect(() => {
    if (authError) {
      setShowAuthError(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowAuthError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [authError])

  // Initial fetch - only if calendar access is granted
  useEffect(() => {
    if (hasCalendarAccess && !isCustomDateRange) {
      const initialDateRange = getInitialDateRange()
      dispatch(fetchMeetingsThunk(initialDateRange))
    } else if (!hasCalendarAccess) {
      // Show the calendar access popup if no access
      setShowCalendarPopup(true)
    }
  }, [dispatch, isCustomDateRange, hasCalendarAccess])

  // Find and select the latest meeting with "SummaryReady" status after meetings are loaded
  useEffect(() => {
    if (!loading && meetings.length > 0 && !selectedMeetingId) {
      // Sort meetings by date (newest first)
      const sortedMeetings = [...meetings].sort(
        (a, b) => new Date(b.start.dateTime).getTime() - new Date(a.start.dateTime).getTime(),
      )

      // Find the first meeting with "SummaryReady" status
      const readyMeeting = sortedMeetings.find((meeting) => meeting.meetingStatus === "SummaryReady")

      if (readyMeeting) {
        // handleMeetingClick(readyMeeting.id)
        handleMeetingClick(readyMeeting.id, readyMeeting?.meetingStatus || "")
      }
    }
  }, [loading, meetings, selectedMeetingId, dispatch])

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to load more meetings (only for "All" filter)
  const loadMoreMeetings = useCallback(() => {
    if (loadingMore || !hasMore || !oldestDate || isCustomDateRange || !hasCalendarAccess) return

    // Calculate new date range (30 days before the oldest date we have)
    const oldestDateObj = new Date(oldestDate)
    const newEndDate = new Date(oldestDateObj)
    newEndDate.setDate(newEndDate.getDate() - 1) // 1 day before our oldest date

    const nextDateRange = getDateRange(newEndDate, 30)
    dispatch(fetchMoreMeetingsThunk(nextDateRange))
  }, [dispatch, loadingMore, hasMore, oldestDate, isCustomDateRange, hasCalendarAccess])

  // Intersection Observer for infinite scrolling (only for "All" filter)
  useEffect(() => {
    if (!containerRef.current || isCustomDateRange || !hasCalendarAccess) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && !loading && !loadingMore && hasMore) {
          loadMoreMeetings()
        }
      },
      { threshold: 0.1 },
    )

    // Observe the sentinel element
    const sentinelElement = document.getElementById("meetings-sentinel")
    if (sentinelElement) {
      observer.observe(sentinelElement)
    }

    return () => {
      if (sentinelElement) {
        observer.unobserve(sentinelElement)
      }
    }
  }, [loading, loadingMore, hasMore, loadMoreMeetings, isCustomDateRange, hasCalendarAccess])

  // Handle date range selection
  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    if (!hasCalendarAccess) {
      setShowCalendarPopup(true)
      return
    }
    console.log("initial", "startDate", startDate, "End", endDate)
    setDateRange({ startDate, endDate })
    setIsCustomDateRange(true)
    setIsFilterOpen(false)

    const formatLocalDate = (date: Date, endOfDay = false) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const time = endOfDay ? "23:59:59" : "00:00:00"
      return `${year}-${month}-${day}T${time}`
    }

    // Format dates for API
    const formattedStartDate = formatLocalDate(startDate) // "2025-04-02T00:00:00"
const formattedEndDate = formatLocalDate(endDate, true) // "2025-04-04T23:59:59"
    console.log("formatted at meetingList", "start date", formattedStartDate, "end date", formattedEndDate)
    // Fetch meetings for the selected date range
    dispatch(
      fetchMeetingsThunk({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      }),
    )
  }

  // Reset to "All" filter
  const handleResetFilter = () => {
    if (!hasCalendarAccess) {
      setShowCalendarPopup(true)
      return
    }

    setFilter("All")
    setIsCustomDateRange(false)
    setDateRange({ startDate: null, endDate: null })

    // Fetch initial meetings again
    const initialDateRange = getInitialDateRange()
    dispatch(fetchMeetingsThunk(initialDateRange))
  }

  // Group meetings by date
  const groupedMeetings = groupMeetingsByDate(meetings)

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedMeetings).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // const handleMeetingClick = (meetingId: string) => {
  //   if (!hasCalendarAccess) {
  //     setShowCalendarPopup(true)
  //     return
  //   }

  const handleMeetingClick = (meetingId: string, meetingStatus: string) => {
    if (!hasCalendarAccess) {
      setShowCalendarPopup(true)
      return
    }
console.log("meetingStatus",meetingStatus);
    if (meetingStatus !== "SummaryReady") {
      let statusMessage = "This meeting summary is not ready yet."

      switch (meetingStatus) {
        case "InProgress":
          statusMessage = "This meeting summary is currently being generated."
          break
        case "NotStarted":
          statusMessage = "This meeting summary has not been started yet."
          break
        case "BotRestricted":
          statusMessage = "Bot was not allowed to join the meeting"
          break
        default:
          statusMessage = `Meeting status: ${meetingStatus || "Unknown"}`
      }

      showToast(statusMessage, "info")
      return
    }

    // Set the selected meeting ID in Redux
    dispatch(setSelectedMeetingId(meetingId))

    // Fetch the meeting details
    dispatch(fetchMeetingDetailsThunk(meetingId))
  }

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Render content based on state
  const renderContent = () => {
    if (!hasCalendarAccess) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Calendar Access Required</h3>
          <p className="text-sm text-gray-500 max-w-xs mb-4">Connect your Google Calendar to view your meetings.</p>
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
      return <MeetingsListSkeleton />
    }

    if (error && meetings.length === 0) {
      return <MeetingsListError error={error} />
    }

    if (meetings.length === 0) {
      return <MeetingsListEmpty />
    }

    return (
      <>
        {sortedDates.map((date) => (
          <div key={date} className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-500 capitalize tracking-wider">
              {formatDateHeader(date)}
            </h3>

            {groupedMeetings[date].map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => handleMeetingClick(meeting.id, meeting.meetingStatus || "")}
                isActive={meeting.id === selectedMeetingId}
              />
            ))}
          </div>
        ))}

        {/* Sentinel element for infinite scrolling (only for "All" filter) */}
        {!isCustomDateRange && <div id="meetings-sentinel" className="h-4 w-full" />}

        {/* Loading indicator for more meetings */}
        {loadingMore && (
          <div className="flex justify-center items-center py-4">
            <Loader className="h-5 w-5 text-primary animate-spin" />
            <span className="ml-2 text-sm text-gray-500">Loading more meetings...</span>
          </div>
        )}

        {/* End of list message */}
        {!hasMore && meetings.length > 0 && !isCustomDateRange && (
          <div className="text-center py-4 text-sm text-gray-500">No more meetings to load</div>
        )}
      </>
    )
  }

  return (
    <>
      {/* Auth Error Toast */}
      {showAuthError && authError && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md shadow-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Authentication Error</p>
            <p className="text-sm">{authError}</p>
          </div>
          <button onClick={() => setShowAuthError(false)} className="ml-2 text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="h-screen w-80 overflow-y-auto border-r border-gray-200 bg-white custom-scrollbar"
      >
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Meetings</h2>

            {/* Custom Filter UI */}
            <div ref={filterRef} className="relative">
              {isCustomDateRange ? (
                <div className="flex items-center">
                  <button
                    className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary flex items-center"
                    onClick={handleResetFilter}
                  >
                    <span className="truncate max-w-[100px]">
                      {dateRange.startDate && dateRange.endDate
                        ? `${formatDisplayDate(dateRange.startDate)} - ${formatDisplayDate(dateRange.endDate)}`
                        : "Custom Range"}
                    </span>
                    <X size={14} className="ml-1" />
                  </button>
                </div>
              ) : (
                <button
                  className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    if (!hasCalendarAccess) {
                      setShowCalendarPopup(true)
                    } else {
                      setIsFilterOpen(!isFilterOpen)
                    }
                  }}
                >
                  {filter === "All" ? "All Meetings" : "Choose Dates"}
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              )}

              {/* Filter Dropdown */}
              {isFilterOpen && hasCalendarAccess && (
                <div className="absolute right-0 mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg z-20">
                  <div className="py-1">
                    <button
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        filter === "All" ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setFilter("All")
                        setIsFilterOpen(false)
                        setIsCustomDateRange(false)
                        handleResetFilter()
                      }}
                    >
                      All Meetings
                    </button>
                    <button
                      className={`flex w-full items-center px-4 py-2 text-sm ${
                        filter === "Calendar" ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setFilter("Calendar")
                        // Keep dropdown open to show date picker
                      }}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Choose from Calendar
                    </button>
                  </div>

                  {/* Date Range Picker (only show when Calendar filter is selected) */}
                  {filter === "Calendar" && (
                    <div className="border-t border-gray-100 p-3">
                      <DateRangePicker onSelect={handleDateRangeSelect} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">{renderContent()}</div>
      </div>

      {/* Calendar Access Popup */}
      {showCalendarPopup && !hasCalendarAccess && <CalendarAccessPopup onClose={() => setShowCalendarPopup(false)} />}
    </>
  )
}

export default MeetingsList
