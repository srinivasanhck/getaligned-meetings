"use client"

import { useEffect, useState } from "react"
import { format, parseISO } from "date-fns"
import { ChevronRight, Video, Menu } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchPreviousMeetings, setDateRange } from "@/lib/redux/meetingsSlice"
import AppSidebar from "./app-sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function PreviousMeetings() {
  const dispatch = useAppDispatch()
  const { previousMeetings, loading, error, dateRange } = useAppSelector((state) => state.meetings)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const days = dateRange === "15days" ? 15 : 30
    dispatch(fetchPreviousMeetings(days))
  }, [dispatch, dateRange])

  const handleDateRangeChange = (value: string) => {
    dispatch(setDateRange(value as "15days" | "30days"))
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Group meetings by date
  const meetingsByDate =
    previousMeetings?.items.reduce(
      (acc, meeting) => {
        const date = parseISO(meeting.start.dateTime)
        const dateStr = format(date, "EEEE, MMMM do")

        if (!acc[dateStr]) {
          acc[dateStr] = []
        }

        acc[dateStr].push(meeting)
        return acc
      },
      {} as Record<string, any[]>,
    ) || {}

  // Sort the dates in descending order (newest first)
  const sortedDates = Object.entries(meetingsByDate).sort((a, b) => {
    const dateA = new Date(parseISO(a[1][0].start.dateTime).toDateString())
    const dateB = new Date(parseISO(b[1][0].start.dateTime).toDateString())
    return dateB.getTime() - dateA.getTime()
  })

  // Get status badge based on meeting status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SummaryReady":
        return (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            Summary Ready
          </div>
        )
      case "InProgress":
        return (
          <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
            In Progress
          </div>
        )
      case "MeetingNotCompleted":
      default:
        return (
          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
            Bot Restricted
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background w-full">
      {/* Mobile sidebar using Sheet component */}
      <div className="md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white shadow-sm rounded-md"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <AppSidebar collapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b p-4">
            <h1 className="text-2xl font-semibold ml-12 md:ml-0">Previous Meetings</h1>
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15days">Last 15 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-6 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 w-full">
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2 w-full">
                      {[1, 2].map((j) => (
                        <Skeleton key={j} className="h-20 w-full rounded-md" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error loading meetings: {error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6 w-full">
                {sortedDates.map(([date, meetings]) => (
                  <div key={date} className="space-y-3 w-full">
                    <h2 className="text-md font-medium text-gray-700">{date}</h2>
                    <div className="space-y-2 w-full">
                      {meetings.map((meeting) => {
                        const startTime = parseISO(meeting.start.dateTime)

                        return (
                          <div
                            key={meeting.id}
                            className="flex items-center justify-between rounded-md border p-4 transition-all hover:border-gray-300 cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-4">
                              <Video className="h-5 w-5 text-green-600" />
                              <div className="text-sm font-medium">{format(startTime, "hh:mm a")}</div>
                              <div className="font-medium">{meeting.summary}</div>
                            </div>

                            <div className="flex items-center gap-3">
                              {getStatusBadge(meeting.meetingStatus || "")}
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {Object.keys(meetingsByDate).length === 0 && (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed w-full">
                    <p className="text-gray-500">No meetings found for the selected date range.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

