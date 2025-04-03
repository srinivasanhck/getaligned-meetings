"use client"

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchRecentMeetings,
  fetchMeetingDetails,
  setSelectedMeeting,
  fetchMoreMeetings,
} from "@/lib/redux/dashboardSlice"
import type { Meeting } from "@/lib/types"
import AppSidebar from "./app-sidebar"
import { MeetingList } from "./meeting-list"
import { MeetingDetails } from "./meeting-details"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Dashboard() {
  const dispatch = useAppDispatch()
  const { meetings, selectedMeeting, meetingDetails, loadingMeetings, loadingDetails, error, detailsError } =
    useAppSelector((state) => state.dashboard)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [layoutReady, setLayoutReady] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMoreMeetings, setHasMoreMeetings] = useState(true)
  const [showMeetingList, setShowMeetingList] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const initialLoadRef = useRef(false)

  console.log("meetings at dash", meetings);
  console.log("selectedMeeting at dash", selectedMeeting);
  console.log("meetingDetails at dash", meetingDetails);

  // Use layout effect to handle initial layout calculations
  useLayoutEffect(() => {
    setLayoutReady(true)
    return () => setLayoutReady(false)
  }, [])

  // Fetch meetings on component mount
  useEffect(() => {
    dispatch(fetchRecentMeetings("30days"))
  }, [dispatch])

  // Fetch meeting details when selected meeting changes
  useEffect(() => {
    if (selectedMeeting) {
      dispatch(fetchMeetingDetails(selectedMeeting))
      // On mobile, when a meeting is selected, hide the meeting list
      if (window.innerWidth < 768) {
        setShowMeetingList(false)
      }
    }
  }, [dispatch, selectedMeeting])

  // Auto-select the first meeting when meetings are loaded
  useEffect(() => {
    if (meetings?.items?.length > 0 && !selectedMeeting && !initialLoadRef.current) {
      // Find the first SummaryReady meeting
      const firstSummaryReadyMeeting = meetings.items.find((meeting) => meeting.meetingStatus === "SummaryReady")
      if (firstSummaryReadyMeeting) {
        dispatch(setSelectedMeeting(firstSummaryReadyMeeting.id))
        initialLoadRef.current = true
      }
    }
  }, [meetings, selectedMeeting, dispatch])

  console.log("meetings data",meetings);

  // Listen for window resize to adjust layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMeetingList(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleMeetingSelect = useCallback(
    (meeting: Meeting) => {
      dispatch(setSelectedMeeting(meeting.id))
    },
    [dispatch],
  )

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const toggleMeetingList = useCallback(() => {
    setShowMeetingList((prev) => !prev)
  }, [])

  // Find the currently selected meeting object
  const selectedMeetingObject = meetings?.items?.find((meeting) => meeting.id === selectedMeeting) || null

  const handleLoadMore = useCallback(
    async (nextPage: number) => {
      try {
        // Dispatch an action to load more meetings with pagination
        await dispatch(fetchMoreMeetings({ page: nextPage, filter: "30days" })).unwrap()
        setPage(nextPage)
      } catch (error) {
        console.error("Failed to load more meetings:", error)
        setHasMoreMeetings(false)
      }
    },
    [dispatch],
  )

  const handleBackToList = useCallback(() => {
    setShowMeetingList(true)
  }, [])

  if (!layoutReady) {
    return <div className="h-screen bg-background"></div>
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar using Sheet component */}
      <div className="md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-10"
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

      <div className="flex flex-1 min-w-0 w-full flex-col md:flex-row">
        {/* Mobile header with back button when viewing details */}
        {!showMeetingList && selectedMeeting && (
          <div className="md:hidden flex items-center p-4 border-b">
            <Button variant="ghost" size="sm" onClick={handleBackToList} className="mr-2">
              ← Back to Meetings
            </Button>
          </div>
        )}

        {/* Meeting list container - conditionally shown on mobile */}
        <div
          className={`${showMeetingList ? "block" : "hidden"} md:block w-full md:w-[340px] md:min-w-[340px] md:border-r overflow-y-auto scrollbar-none`}
        >
          {loadingMeetings ? (
            <div className="p-4 space-y-6">
              <div className="flex justify-between items-center mb-4 pl-8 md:pl-0">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-24 w-full rounded-md" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 pl-8 md:pl-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error loading meetings: {error}</AlertDescription>
              </Alert>
            </div>
          ) : meetings?.items.length === 0 ? (
            <div className="p-4 flex items-center justify-center h-full pl-8 md:pl-4">
              <div className="text-center">
                <p className="text-gray-500">No meetings found.</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for upcoming meetings.</p>
              </div>
            </div>
          ) : (
            <MeetingList
              meetings={meetings?.items || []}
              selectedMeeting={selectedMeetingObject}
              onMeetingSelect={handleMeetingSelect}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>

        {/* Meeting details container - conditionally shown on mobile */}
        <div
          className={`${!showMeetingList || !selectedMeeting ? "block" : "hidden"} md:block flex-1 min-w-0 w-full overflow-y-auto scrollbar-none`}
        >
          {loadingDetails ? (
            <div className="p-4 space-y-6 w-full">
              <div className="border-b pb-4 mb-4">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-20 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-24 w-full mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-40 w-full aspect-video mb-4" />
            </div>
          ) : detailsError ? (
            <div className="p-4 w-full">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Error loading meeting details: {detailsError}</AlertDescription>
              </Alert>
            </div>
          ) : !selectedMeeting || !meetings?.items.length ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No meeting details available</p>
                <p className="text-sm text-gray-400 mt-1">Select a meeting or check back later</p>
              </div>
            </div>
          ) : (
            <MeetingDetails meeting={selectedMeetingObject} meetingDetails={meetingDetails} />
          )}
        </div>
      </div>
    </div>
  )
}

