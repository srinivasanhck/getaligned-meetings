"use client"

import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchNextSteps,
  resetNextSteps,
  selectNextSteps,
  selectNextStepsLoading,
  selectNextStepsError,
  selectNextStepsHasMore,
  selectNextStepsStats,
  selectCurrentDateRange,
  selectDateRanges,
  setCurrentDateRange,
  setSelectedParticipant,
} from "@/lib/redux/features/nextStepsSlice"
import NextStepsListSkeleton from "@/components/next-steps/NextStepsListSkeleton"
import NextStepsListEmpty from "@/components/next-steps/NextStepsListEmpty"
import NextStepsListError from "@/components/next-steps/NextStepsListError"
import NextStepsList from "@/components/next-steps/NextStepsList"
import ParticipantFilter from "@/components/next-steps/ParticipantFilter"

export default function NextStepsPage() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector(selectNextSteps)
  const loading = useAppSelector(selectNextStepsLoading)
  const error = useAppSelector(selectNextStepsError)
  const hasMore = useAppSelector(selectNextStepsHasMore)
  const stats = useAppSelector(selectNextStepsStats)
  const currentDateRange = useAppSelector(selectCurrentDateRange)
  const dateRanges = useAppSelector(selectDateRanges)

  const [initialLoad, setInitialLoad] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastTaskElementRef = useRef<any>(null)

  console.log("Current tasks count:", tasks.length)
  console.log("Loading state:", loading)
  console.log("Initial load state:", initialLoad)

  // Helper function to format start date to ISO string with beginning of day (00:00:00)
  const formatStartDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}T00:00:00`
  }

  // Helper function to format end date to ISO string with end of day (23:59:59)
  const formatEndDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}T23:59:59`
  }

  // Get initial date range (last month to today)
  const getInitialDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)

    return {
      startDate: formatStartDateToISO(startDate),
      endDate: formatEndDateToISO(endDate),
    }
  }

  // Get next date range (previous month)
  const getNextDateRange = () => {
    // If we have date ranges, use the earliest one to calculate the next range
    if (dateRanges.length > 0) {
      const earliestRange = dateRanges[dateRanges.length - 1]
      const startDate = new Date(earliestRange.startDate)
      const endDate = new Date(startDate)

      // Set end date to one day before the current start date
      endDate.setDate(endDate.getDate() - 1)

      // Set start date to one month before
      startDate.setMonth(startDate.getMonth() - 1)

      console.log("Next date range:", {
        startDate: formatStartDateToISO(startDate),
        endDate: formatEndDateToISO(endDate),
      })

      return {
        startDate: formatStartDateToISO(startDate),
        endDate: formatEndDateToISO(endDate),
      }
    }

    // Fallback to initial date range if no previous ranges exist
    return getInitialDateRange()
  }

  // Initial fetch
  useEffect(() => {
    console.log("Initializing Next Steps page")
    setInitialLoad(true)

    const { startDate, endDate } = getInitialDateRange()

    dispatch(resetNextSteps())
    dispatch(setCurrentDateRange({ startDate, endDate }))
    dispatch(fetchNextSteps({ startDate, endDate }))

    return () => {
      // Clean up on unmount
      dispatch(resetNextSteps())
      dispatch(setSelectedParticipant(null))
    }
  }, [dispatch])

  // Set up intersection observer for infinite scrolling
  useEffect(() => {
    if (loading) return

    if (observer.current) observer.current.disconnect()

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
        console.log("Intersection observed, loading more tasks")
        loadMoreTasks()
      }
    }

    observer.current = new IntersectionObserver(callback, {
      rootMargin: "200px", // Load more when within 200px of the bottom
      threshold: 0.1,
    })

    if (lastTaskElementRef.current) {
      console.log("Observing last task element")
      observer.current.observe(lastTaskElementRef.current)
    } else {
      console.log("Last task element ref not found")
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [loading, hasMore, tasks, loadingMore])

  // Function to load more tasks
  const loadMoreTasks = async () => {
    if (loading || !hasMore || loadingMore) {
      console.log("Skipping loadMoreTasks - already loading or no more tasks")
      return
    }

    console.log("Loading more tasks...")
    setLoadingMore(true)

    try {
      // Calculate the next date range based on the current ranges
      const { startDate, endDate } = getNextDateRange()

      // Dispatch the action to fetch more tasks
      await dispatch(fetchNextSteps({ startDate, endDate })).unwrap()
      console.log("Loaded more tasks successfully")
    } catch (error) {
      console.error("Error loading more tasks:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Set initial load to false after first load
  useEffect(() => {
    if (!loading && initialLoad) {
      console.log("Initial load complete, setting initialLoad to false")
      setInitialLoad(false)
    }
  }, [loading])

  // Render loading state
  if (loading && initialLoad) {
    console.log("Rendering loading skeleton")
    return <NextStepsListSkeleton />
  }

  // Render error state
  if (error) {
    console.log("Rendering error state")
    return <NextStepsListError error={error} />
  }

  // Render empty state
  if (tasks.length === 0 && !loading && !initialLoad) {
    console.log("Rendering empty state")
    return <NextStepsListEmpty />
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Header with title and filter */}
      <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Next Steps</h1>
        <ParticipantFilter />
      </div>

      {/* Show loading skeleton during initial load */}
      {loading && initialLoad ? (
        <NextStepsListSkeleton />
      ) : (
        <>
          {/* Tasks List */}
          <NextStepsList tasks={tasks} lastTaskElementRef={lastTaskElementRef} />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="mt-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              <span className="ml-2">Loading more tasks...</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
