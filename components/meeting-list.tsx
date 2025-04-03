"use client"

import type React from "react"

import { useState, useMemo, useCallback, memo, useRef, useEffect } from "react"
import { format } from "date-fns"
import { ExternalLink, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Meeting } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DatePicker } from "@/components/date-picker"

interface MeetingListProps {
  meetings: Meeting[]
  selectedMeeting: Meeting | null
  onMeetingSelect: (meeting: Meeting) => void
  onLoadMore: (page: number) => Promise<void>
}

export const MeetingList = memo(function MeetingList({
  meetings,
  selectedMeeting,
  onMeetingSelect,
  onLoadMore,
}: MeetingListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [filter, setFilter] = useState("All")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Memoize filtered meetings to prevent unnecessary recalculations
  const filteredMeetings = useMemo(() => {
    // First filter out BotRestricted meetings
    // const nonRestrictedMeetings = meetings.filter((meeting) => meeting.meetingStatus !== "BotRestricted")

    // Then apply the date filters
    return meetings?.filter((meeting) => {
      const meetingDate = new Date(meeting.start.dateTime)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Format dates to compare just the date part (not time)
      const meetingDateStr = format(meetingDate, "yyyy-MM-dd")
      const todayStr = format(today, "yyyy-MM-dd")

      if (filter === "Today") {
        return meetingDateStr === todayStr
      } else if (filter === "Calendar" && selectedDate) {
        // Filter by the selected date
        const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
        return meetingDateStr === selectedDateStr
      }

      // Default "All" filter shows all meetings (last 30 days, controlled by API)
      return true
    })
  }, [meetings, filter, selectedDate])

  // Memoize meetings by date to prevent unnecessary recalculations
  const meetingsByDate = useMemo(() => {
    // return filteredMeetings.reduce(
      const groupedMeetings = filteredMeetings.reduce(
      (acc, meeting) => {
        const date = new Date(meeting.start.dateTime)
        const dateStr = format(date, "EEEE, MMMM d")

        if (!acc[dateStr]) {
          acc[dateStr] = []
        }

        acc[dateStr].push(meeting)
        return acc
      },
      {} as Record<string, Meeting[]>,
    )
    
       // Sort meetings within each date group by start time (latest first)
       Object.keys(groupedMeetings).forEach((dateKey) => {
        groupedMeetings[dateKey].sort((a, b) => {
          const timeA = new Date(a.start.dateTime).getTime()
          const timeB = new Date(b.start.dateTime).getTime()
          return timeB - timeA // Descending order (latest first)
        })
      })
  
      return groupedMeetings
  }, [filteredMeetings])

  // Memoize sorted dates to prevent unnecessary recalculations
  const sortedDates = useMemo(() => {
    return Object.entries(meetingsByDate).sort((a, b) => {
      const dateA = new Date(format(new Date(a[1][0].start.dateTime), "yyyy-MM-dd"))
      const dateB = new Date(format(new Date(b[1][0].start.dateTime), "yyyy-MM-dd"))
      return dateB.getTime() - dateA.getTime()
    })
  }, [meetingsByDate])

  // Memoize functions to prevent unnecessary re-renders
  const getInitials = useCallback((email: string) => {
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }, [])

  const getAvatarColor = useCallback((email: string) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-pink-100 text-pink-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
    ]

    // Simple hash function to get consistent color for same email
    const hash = email.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }, [])

  const joinMeeting = useCallback((hangoutLink: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(hangoutLink, "_blank")
  }, [])

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value)
  }, [])

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date)
    // If a date is selected, switch to Calendar filter
    if (date) {
      setFilter("Calendar")
    }
  }, [])

  // Add this useEffect for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || isLoadingMore || !hasMore) return

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

      // If scrolled to bottom (with a small threshold)
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setIsLoadingMore(true)
        // Call a function to load more meetings
        onLoadMore(page + 1)
          .then(() => {
            setPage((prev) => prev + 1)
            setIsLoadingMore(false)
          })
          .catch(() => {
            setHasMore(false)
            setIsLoadingMore(false)
          })
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [page, isLoadingMore, hasMore, onLoadMore])

  // Update the handleMeetingClick function to only allow clicking on SummaryReady meetings
  const handleMeetingClick = useCallback(
    (meeting: Meeting) => {
      // Only allow clicking on SummaryReady meetings
      if (meeting.meetingStatus === "SummaryReady") {
        onMeetingSelect(meeting)
      }
    },
    [onMeetingSelect],
  )

  return (
    <div
      className="flex flex-col p-4 font-figtree h-full w-full overflow-y-auto scrollbar-none"
      ref={scrollContainerRef}
    >
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pl-10 md:pl-0">
        <h2 className="text-lg font-semibold">Meetings</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          <Select defaultValue={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-28 h-9 text-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Calendar">Choose Date</SelectItem>
            </SelectContent>
          </Select>
          {filter === "Calendar" && (
            <div className="w-full sm:w-36 px-0 mt-2 sm:mt-0">
              <DatePicker onDateChange={handleDateSelect} />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto w-full scrollbar-none">
        {sortedDates.length > 0 ? (
          sortedDates.map(([date, dateMeetings]) => (
            <div key={date} className="space-y-3 w-full">
              <h3 className="text-sm font-medium text-gray-700">{date}</h3>
              <div className="space-y-2 w-full">
                {dateMeetings.map((meeting) => {
                  const startTime = new Date(meeting.start.dateTime)
                  const endTime = new Date(meeting.end.dateTime)
                  const isToday = format(startTime, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  const isYesterday =
                    format(startTime, "yyyy-MM-dd") ===
                    format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd")
                  const label = isToday ? "Today" : isYesterday ? "Yesterday" : format(startTime, "dd MMM")
                  const isSelected = selectedMeeting?.id === meeting.id
                  const hasSummary = meeting.meetingStatus === "SummaryReady"
                  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

                  return (
                    <div
                      key={meeting.id}
                      className={cn(
                        "rounded-md border p-3 transition-all w-full",
                        meeting.meetingStatus === "SummaryReady" ? "cursor-pointer" : "cursor-default",
                        isSelected
                          ? "border-purple-border"
                          : meeting.meetingStatus === "SummaryReady"
                            ? "hover:border-gray-300"
                            : "",
                      )}
                      onClick={() => meeting.meetingStatus === "SummaryReady" && handleMeetingClick(meeting)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <h4 className="font-medium text-gray-800 truncate">{meeting.summary}</h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
                        </div>

                        {/* {meeting.meetingStatus === "InProgress" && <Switch checked={false} className="ml-2" />} */}
                      </div>

                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="whitespace-nowrap">{format(startTime, "dd MMM yyyy")}</span>
                          <span className="hidden sm:inline mx-1">•</span>
                          <span className="whitespace-nowrap">{format(startTime, "hh:mm a")}</span>
                          <span className="hidden sm:inline mx-1">•</span>
                          <span className="whitespace-nowrap">{duration} min</span>
                          {meeting.hangoutLink && (
                            <>
                              <span className="hidden sm:inline mx-1">•</span>
                              <Video className="h-3.5 w-3.5 text-green-600 ml-1 sm:ml-0" />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {meeting.attendees?.slice(0, 3).map((attendee, i) => (
                            <Avatar key={i} className="h-7 w-7 border-2 border-white">
                              <AvatarFallback className={cn("text-xs", getAvatarColor(attendee.email))}>
                                {getInitials(attendee.email)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {meeting.attendees && meeting.attendees.length > 3 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-gray-600">
                              +{meeting.attendees.length - 3}
                            </div>
                          )}
                        </div>

                        {meeting.meetingStatus === "InProgress" && meeting.hangoutLink && (
                          <button
                            onClick={(e) => joinMeeting(meeting.hangoutLink!, e)}
                            className="flex items-center gap-1 rounded-md bg-purple px-3 py-1.5 text-xs font-medium text-white hover:bg-purple/90"
                          >
                            Join Meeting
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>

                      {/* Status indicator for meetings */}
                      <div className="mt-2 flex items-center justify-end">
                        {meeting.meetingStatus === "SummaryReady" ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                            Summary Ready
                          </span>
                        ) : meeting.meetingStatus === "InProgress" ? (
                          <span className="text-xs text-yellow-600 flex items-center gap-1">
                            {/* <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span> */}
                            {/* In Progress */}
                          </span>
                        ) : meeting.meetingStatus === "BotRestricted" ? (
                          <span className="text-xs text-red-600 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                            Bot Restricted
                          </span>
                        )
                        : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-[90%] items-center justify-center rounded-md border border-dashed w-full">
            <p className="text-gray-500 p-2 text-center">No meetings found for the selected date range.</p>
          </div>
        )}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="h-6 w-6 border-2 border-t-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  )
})

