"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppDispatch } from "@/lib/redux/hooks"
import { fetchNextSteps, resetNextSteps } from "@/lib/redux/features/nextStepsSlice"

interface NextStepsListErrorProps {
  error: string
}

export default function NextStepsListError({ error }: NextStepsListErrorProps) {
  const dispatch = useAppDispatch()

  // Helper function to format date to ISO string
  const formatDateToISO = (date: Date): string => {
    return date.toISOString().split(".")[0]
  }

  // Get initial date range (last month to today)
  const getInitialDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)

    return {
      startDate: formatDateToISO(startDate),
      endDate: formatDateToISO(endDate),
    }
  }

  const handleRetry = () => {
    const { startDate, endDate } = getInitialDateRange()
    dispatch(resetNextSteps())
    dispatch(fetchNextSteps({ startDate, endDate }))
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Next Steps</h1>

      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-medium">Error Loading Next Steps</h2>
          <p className="mb-4 text-gray-500">{error}</p>
          <Button onClick={handleRetry}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  )
}
