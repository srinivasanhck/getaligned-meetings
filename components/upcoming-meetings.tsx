"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format, parseISO } from "date-fns"
import { ExternalLink, Calendar, AlertCircle, ChevronRight, ChevronLeft, Menu } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchUpcomingMeetings, setFilter, updateMeetingBotStatus } from "@/lib/redux/upcomingMeetingsSlice"
import AppSidebar from "./app-sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Meeting } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { addBotToMeeting, removeBotFromMeeting } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function UpcomingMeetings() {
  const dispatch = useAppDispatch()
  const { meetings, loading, error, filter } = useAppSelector((state) => state.upcomingMeetings)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isOverlayLoader, setIsOverlayLoader] = useState(false)
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchUpcomingMeetings(filter))
  }, [dispatch, filter])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev)
  }

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    if (!meetings?.items?.length) return {}

    return meetings.items.reduce(
      (acc, meeting) => {
        const date = parseISO(meeting.start.dateTime)
        const dateStr = format(date, "EEEE • d MMM")

        if (!acc[dateStr]) {
          acc[dateStr] = []
        }

        acc[dateStr].push(meeting)
        return acc
      },
      {} as Record<string, Meeting[]>,
    )
  }, [meetings])

  // Sort dates chronologically
  const sortedDates = useMemo(() => {
    return Object.entries(meetingsByDate).sort((a, b) => {
      const dateA = new Date(parseISO(a[1][0].start.dateTime).toDateString())
      const dateB = new Date(parseISO(b[1][0].start.dateTime).toDateString())
      return dateA.getTime() - dateB.getTime()
    })
  }, [meetingsByDate])

  // Helper functions
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

  const handleFilterChange = useCallback(
    (newFilter: "today" | "next7days") => {
      dispatch(setFilter(newFilter))
    },
    [dispatch],
  )

  // Handle snackbar notifications
  const handleSnackbar = useCallback(
    (message: string, type: "success" | "error" | "warning") => {
      toast({
        title: type === "success" ? "Success" : type === "error" ? "Error" : "Warning",
        description: message,
        variant: type === "success" ? "success" : type === "error" ? "destructive" : "warning",
      })
    },
    [toast],
  )

  // Handle bot toggle
  const handleBotToggle = useCallback(
    async (meeting: Meeting, checked: boolean, dateStr: string) => {
      setIsOverlayLoader(true)

      try {
        if (checked) {
          // Add bot to meeting
          const result = await addBotToMeeting(meeting.id)

          if (
            result.errorType === "Meeting in the past" ||
            result.errorType === "Meeting is already started or less than 10 minutes remaining for meeting" ||
            result.errorType === "Meeting start time cannot be in the past"
          ) {
            handleSnackbar("Meeting is already started or less than 5 minutes remaining for meeting", "error")
          } else if (result.errorType === "Bot already exists") {
            handleSnackbar("Bot is already in the meet", "error")
          } else if (result.errorType === "GenericError") {
            handleSnackbar("Meeting url doesn't exist or something went wrong. Please try again later", "warning")
          } else if (result) {
            handleSnackbar("Meeting bot added successfully. Bot will take a few minutes to join the meeting", "success")
            dispatch(updateMeetingBotStatus({ meetingId: meeting.id, hasBotEnabled: true }))
          }
        } else {
          // Remove bot from meeting
          const result = await removeBotFromMeeting(meeting.id)

          if (
            result.errorType === "Meeting in the past" ||
            result.errorType === "Meeting is already started or less than 10 minutes remaining for meeting" ||
            result.errorType === "Meeting start time cannot be in the past"
          ) {
            handleSnackbar("Meeting is already started", "error")
          } else if (result.message === "User not authorized to remove bot from meeting") {
            handleSnackbar("You don't have authorization to remove bot from this meeting", "error")
          } else if (result.meetingBot === false) {
            handleSnackbar("Meeting bot removed successfully", "success")
            dispatch(updateMeetingBotStatus({ meetingId: meeting.id, hasBotEnabled: false }))
          } else {
            handleSnackbar("Something went wrong. Please try again later", "error")
          }
        }
      } catch (err) {
        console.error("Error toggling bot:", err)
        handleSnackbar(`${err}`, "error")
      } finally {
        setIsOverlayLoader(false)
      }
    },
    [dispatch, handleSnackbar],
  )

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
          <div className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
            <h1 className="text-2xl font-semibold ml-12 md:ml-0">Upcoming Meetings</h1>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{filter === "today" ? "Today" : "Next 7 days"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFilterChange("today")}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFilterChange("next7days")}>Next 7 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-6 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 w-full">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex flex-col md:flex-row md:overflow-x-auto pb-4 space-y-4 md:space-y-0 md:space-x-4">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-40 w-full md:w-72 rounded-md md:flex-shrink-0" />
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
            ) : sortedDates.length > 0 ? (
              <div className="space-y-8 w-full">
                {sortedDates.map(([date, dateMeetings]) => (
                  <div key={date} className="w-full">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-md font-medium text-gray-700">{date}</h2>
                      {dateMeetings.length > 3 && (
                        <div className="flex space-x-1 hidden md:flex">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const container = document.getElementById(`scroll-container-${date}`)
                              if (container) {
                                container.scrollBy({ left: -300, behavior: "smooth" })
                              }
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              const container = document.getElementById(`scroll-container-${date}`)
                              if (container) {
                                container.scrollBy({ left: 300, behavior: "smooth" })
                              }
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div
                      id={`scroll-container-${date}`}
                      className="flex flex-col md:flex-row md:overflow-x-auto pb-4 space-y-4 md:space-y-0 md:space-x-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                      {dateMeetings.map((meeting) => {
                        const startTime = parseISO(meeting.start.dateTime)
                        const endTime = parseISO(meeting.end.dateTime)
                        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
                        const isActive = meeting.meetingStatus !== "BotRestricted"

                        return (
                          <div
                            key={meeting.id}
                            className={cn(
                              "flex flex-col rounded-md border p-3 transition-all hover:border-gray-300 w-full md:w-72 md:flex-shrink-0",
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-gray-800 truncate">{meeting.summary}</h3>
                              <Switch
                                checked={!!meeting.meetingBot}
                                onCheckedChange={(checked) => handleBotToggle(meeting, checked, date)}
                                disabled={isOverlayLoader}
                              />
                            </div>

                            <div className="flex items-center text-xs text-gray-500 mb-3">
                              <span className="whitespace-nowrap">{format(startTime, "h:mm a")}</span>
                              <span className="mx-1">•</span>
                              <span className="whitespace-nowrap">{duration} mins</span>
                            </div>

                            <div className="flex items-center justify-between mt-auto">
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

                              {meeting.hangoutLink && (
                                <Button
                                  onClick={(e) => joinMeeting(meeting.hangoutLink!, e)}
                                  className="flex items-center gap-1 rounded-md bg-purple px-3 py-1.5 text-xs font-medium text-white hover:bg-purple/90"
                                >
                                  Join Meeting
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center w-full">
                <div className="text-center max-w-md">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming meetings</h3>
                  <p className="text-gray-500">
                    {filter === "today"
                      ? "You don't have any meetings scheduled for today."
                      : "You don't have any meetings scheduled for the next 7 days."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay loader */}
      {isOverlayLoader && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-t-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}

