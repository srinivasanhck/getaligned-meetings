"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchMeetingsThunk,
  fetchMoreMeetingsThunk,
  getInitialDateRange,
  getDateRange,
} from "@/lib/redux/features/meetingsSlice"
import { setSelectedMeetingId } from "@/lib/redux/features/meetingDetailsSlice"
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

interface MeetingsListProps {
  selectedMeetingId?: string
}

// Update the MeetingsList component to handle meeting selection
const MeetingsList = ({ selectedMeetingId }: MeetingsListProps = {}) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { meetings, loading, loadingMore, error, oldestDate, hasMore } = useAppSelector((state) => state.meetings)
  const { selectedMeetingId: reduxSelectedMeetingId } = useAppSelector((state) => state.meetingDetails)
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
  const [initialFetchDone, setInitialFetchDone] = useState(false)
    const { showToast } = useToast()

  // Reference to the container for scroll detection
  const containerRef = useRef<HTMLDivElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

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

  // Initial fetch - only if calendar access is granted and we haven't fetched yet
  useEffect(() => {
    if (hasCalendarAccess && !isCustomDateRange && !initialFetchDone && meetings.length === 0) {
      const initialDateRange = getInitialDateRange()
      dispatch(fetchMeetingsThunk(initialDateRange))
      setInitialFetchDone(true)
    } else if (!hasCalendarAccess) {
      // Show the calendar access popup if no access
      setShowCalendarPopup(true)
    }
  }, [dispatch, isCustomDateRange, hasCalendarAccess, initialFetchDone, meetings.length])

  // Update Redux state when URL meeting ID changes
  useEffect(() => {
    if (selectedMeetingId && selectedMeetingId !== reduxSelectedMeetingId) {
      dispatch(setSelectedMeetingId(selectedMeetingId))
    }
  }, [selectedMeetingId, reduxSelectedMeetingId, dispatch])

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
    setDateRange({ startDate, endDate })
    setIsCustomDateRange(true)
    setIsFilterOpen(false)

    // Format dates for API
    const formattedStartDate = startDate.toISOString()
    const formattedEndDate = endDate.toISOString()

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

    // Check if a meeting is clickable based on its status
    const isMeetingClickable = (meetingStatus: string) => {
      return meetingStatus === "SummaryReady" || meetingStatus === "InProgress"
    }

    const handleMeetingClick = (meetingId: string, meetingStatus: string) => {
    if (!hasCalendarAccess) {
      setShowCalendarPopup(true)
      return
    }
console.log("meetingStatus",meetingStatus);

    // Only proceed if the meeting is clickable
    if (!isMeetingClickable(meetingStatus)) {
      return
    }

    if (meetingStatus !== "SummaryReady") {
      let statusMessage = "This meeting summary is not ready yet."

      switch (meetingStatus) {
        case "InProgress":
          statusMessage = "This meeting summary is currently being generated."
          break
        default:
          statusMessage = `Meeting status: ${meetingStatus || "Unknown"}`
      }

      showToast(statusMessage, "info")
      return
    }

    // Set the selected meeting ID in Redux
    dispatch(setSelectedMeetingId(meetingId))

        // Then update URL without full page reload
        if (!pathname.includes(`/meeting/${meetingId}`)) {
          window.history.pushState({}, "", `/meeting/${meetingId}`)
        }
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

    if (loading && meetings.length === 0) {
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
            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
              {formatDateHeader(date)}
            </h3>

            {groupedMeetings[date].map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                // onClick={() => handleMeetingClick(meeting.id)}
                onClick={() => handleMeetingClick(meeting.id, meeting.meetingStatus || "")}
                isActive={meeting.id === selectedMeetingId || meeting.id === reduxSelectedMeetingId}
                disabled={!isMeetingClickable(meeting.meetingStatus || "")}
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
