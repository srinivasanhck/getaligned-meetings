"use client"

import { useState, memo, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Users, Loader2, Download } from "lucide-react"
import type { Meeting, MeetingDetail } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { EmailTab } from "@/components/email-tab"
import { fetchMeetingVideo } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { jsPDF } from "jspdf"
import { apiClient } from "@/lib/api"
import { useDispatch } from "react-redux"
import { fetchMeetingDetails } from "@/lib/redux/slices/meeting-slice"

interface MeetingDetailsProps {
  meeting: Meeting | null
  meetingDetails: MeetingDetail | null
}

// Helper function to get initials from a name
const getInitials = (name: string) => {
  const parts = name.split(" ")
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export const MeetingDetails = memo(function MeetingDetails({ meeting, meetingDetails }: MeetingDetailsProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const { toast } = useToast()
  const dispatch = useDispatch()

  // Function to handle toast notifications
  const handleSnackbar = (message: string, type: "success" | "error" | "warning") => {
    toast({
      title: type === "success" ? "Success" : type === "error" ? "Error" : "Warning",
      description: message,
      variant: type === "success" ? "success" : type === "error" ? "destructive" : "warning",
    })
  }

  // Function to fetch video recording
  const fetchVideo = async () => {
    if (!meetingDetails?.meeting?.meetingUniqueId) {
      setVideoError("Meeting ID not available")
      return
    }

    setVideoLoading(true)
    setVideoError(null)

    try {
      const blob = await fetchMeetingVideo(meetingDetails.meeting.meetingUniqueId)
      console.log("blob", blob)

      if (blob.size > 0) {
        const videoObjectUrl = URL.createObjectURL(blob)
        console.log("video data", videoObjectUrl)
        setVideoUrl(videoObjectUrl)
      } else {
        setVideoError("No video recording available")
      }
    } catch (err) {
      console.log("error at videoUrl", err)
      setVideoError("Failed to fetch video")
      handleSnackbar("Failed to fetch video. Please try again later", "error")
    } finally {
      setVideoLoading(false)
    }
  }

  // Clean up video URL when component unmounts or meeting changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
    }
  }, [videoUrl])

  // Reset video state when meeting changes
  useEffect(() => {
    setVideoUrl(null)
    setVideoLoading(false)
    setVideoError(null)
  }, [meeting?.id])

  // If no meeting or details, show appropriate message
  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-full w-full font-figtree">
        <div className="text-center">
          <p className="text-gray-500">Select a meeting to view details</p>
        </div>
      </div>
    )
  }

  const startTime = new Date(meeting.start.dateTime)
  const endTime = new Date(meeting.end.dateTime)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  // Add this function to generate and download PDF
  const downloadDealSummary = () => {
    if (!meetingDetails?.dealSummary) return

    const doc = new jsPDF()
    const margin = 15
    let yPos = margin

    // Set title
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`Deal Summary: ${meeting.summary}`, margin, yPos)
    yPos += 10

    // Set meeting date and time
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Date: ${format(startTime, "dd MMM yyyy")} • Time: ${format(startTime, "h:mm a")} • Duration: ${duration} min`,
      margin,
      yPos,
    )
    yPos += 10

    // Add client background if available
    if (meetingDetails.dealSummary?.dealSummary?.clientBackground) {
      yPos += 5
      doc.setFont("helvetica", "bold")
      doc.text("Client Background", margin, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      const clientBackground = meetingDetails.dealSummary.dealSummary.clientBackground
      const splitText = doc.splitTextToSize(clientBackground, doc.internal.pageSize.width - 2 * margin)
      doc.text(splitText, margin, yPos)
      yPos += splitText.length * 5 + 5
    }

    // Add client pain points if available
    if (hasContent(meetingDetails.dealSummary?.dealSummary?.clientPainPoints)) {
      yPos += 5
      doc.setFont("helvetica", "bold")
      doc.text("Client Pain Points", margin, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      meetingDetails.dealSummary.dealSummary.clientPainPoints.forEach((point, i) => {
        const bulletPoint = `• ${point}`
        const splitText = doc.splitTextToSize(bulletPoint, doc.internal.pageSize.width - 2 * margin - 5)
        doc.text(splitText, margin, yPos)
        yPos += splitText.length * 5 + 3

        // Add new page if needed
        if (yPos > doc.internal.pageSize.height - margin) {
          doc.addPage()
          yPos = margin
        }
      })
    }

    // Add solutions discussed if available
    if (hasContent(meetingDetails.dealSummary?.dealSummary?.solutionsDiscussed)) {
      yPos += 5
      doc.setFont("helvetica", "bold")
      doc.text("Solutions Discussed", margin, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      meetingDetails.dealSummary.dealSummary.solutionsDiscussed.forEach((solution, i) => {
        const bulletPoint = `• ${solution}`
        const splitText = doc.splitTextToSize(bulletPoint, doc.internal.pageSize.width - 2 * margin - 5)
        doc.text(splitText, margin, yPos)
        yPos += splitText.length * 5 + 3

        // Add new page if needed
        if (yPos > doc.internal.pageSize.height - margin) {
          doc.addPage()
          yPos = margin
        }
      })
    }

    // Add next steps if available
    if (hasContent(meetingDetails.dealSummary?.dealSummary?.nextSteps)) {
      yPos += 5
      doc.setFont("helvetica", "bold")
      doc.text("Next Steps", margin, yPos)
      yPos += 7
      doc.setFont("helvetica", "normal")

      meetingDetails.dealSummary.dealSummary.nextSteps.forEach((step, i) => {
        const bulletPoint = `• ${step}`
        const splitText = doc.splitTextToSize(bulletPoint, doc.internal.pageSize.width - 2 * margin - 5)
        doc.text(splitText, margin, yPos)
        yPos += splitText.length * 5 + 3

        // Add new page if needed
        if (yPos > doc.internal.pageSize.height - margin) {
          doc.addPage()
          yPos = margin
        }
      })
    }

    // Add tasks if available
    // if (hasContent(meetingDetails.dealSummary?.dealSummary?.tasks)) {
    //   yPos += 5
    //   doc.setFont("helvetica", "bold")
    //   doc.text("Tasks", margin, yPos)
    //   yPos += 7
    //   doc.setFont("helvetica", "normal")

    //   meetingDetails.dealSummary.dealSummary.tasks.forEach((task, i) => {
    //     const taskText = `• ${task.task} (Assigned to: ${task.owner}${task.deadline ? ` • Due: ${task.deadline}` : ""})`
    //     const splitText = doc.splitTextToSize(taskText, doc.internal.pageSize.width - 2 * margin - 5)
    //     doc.text(splitText, margin, yPos)
    //     yPos += splitText.length * 5 + 3

    //     // Add new page if needed
    //     if (yPos > doc.internal.pageSize.height - margin) {
    //       doc.addPage()
    //       yPos = margin
    //     }
    //   })
    // }

    // Save the PDF
    doc.save(`deal-summary-${meeting.summary.replace(/\s+/g, "-")}.pdf`)

    // Show success toast
    handleSnackbar("Deal summary downloaded successfully", "success")
  }

  // Update the fetchMeetingDetails function to refresh the meeting details when a task status changes

  // Add this function to the MeetingDetails component
  // Add this state to track tasks locally
  const [localTasksAssigned, setLocalTasksAssigned] = useState<MeetingDetail["tasksAssigned"] | null>(
    meetingDetails?.tasksAssigned ? [...meetingDetails.tasksAssigned] : null,
  )

  // Initialize local tasks when meeting details change
  useEffect(() => {
    if (meetingDetails?.tasksAssigned) {
      setLocalTasksAssigned([...meetingDetails.tasksAssigned])
    }
  }, [meetingDetails])

  // Update the refreshMeetingDetails function to also update local state
  const refreshMeetingDetails = useCallback(() => {
    if (meeting?.id) {
      console.log("Refreshing meeting details for meeting ID:", meeting.id)
      // Add a small delay to ensure the API has time to process the change
      setTimeout(() => {
        dispatch(fetchMeetingDetails(meeting.id))
      }, 500)
    }
  }, [dispatch, meeting?.id])

  // Add this function to update local tasks state
  const updateLocalTasks = useCallback(
    (participant: string, task: string, isCompleting: boolean) => {
      if (!localTasksAssigned) return

      setLocalTasksAssigned((prevTasks) => {
        if (!prevTasks) return null

        return prevTasks.map((attendee) => {
          if (attendee.participant === participant) {
            if (isCompleting) {
              // Move from tasks to completedTasks
              return {
                ...attendee,
                tasks: attendee.tasks.filter((t) => t !== task),
                completedTasks: [...attendee.completedTasks, task],
              }
            } else {
              // Move from completedTasks to tasks
              return {
                ...attendee,
                completedTasks: attendee.completedTasks.filter((t) => t !== task),
                tasks: [...attendee.tasks, task],
              }
            }
          }
          return attendee
        })
      })
    },
    [localTasksAssigned],
  )

  // Add this component inside the MeetingDetails component, before the return statement
  const [isTaskCompleted, setIsTaskCompleted] = useState(false)

  const TaskItem = ({
    task,
    isCompleted,
    meetingId,
    participant,
    onStatusChange,
    onLocalUpdate,
  }: {
    task: string
    isCompleted: boolean
    meetingId: string
    participant: string
    onStatusChange: () => void
    onLocalUpdate: (participant: string, task: string, isCompleting: boolean) => void
  }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [checked, setChecked] = useState(isCompleted)
    const { toast } = useToast()

    const handleCheckboxChange = async (checked: boolean) => {
      // Don't proceed if already in that state
      if (checked === isCompleted) return

      // Update state immediately for better UX
      setChecked(checked)
      setLoading(true)
      setError(null)

      try {
        // Update local state immediately
        onLocalUpdate(participant, task, checked)

        if (checked) {
          // Move task from tasks to completedTasks
          await apiClient(
            `https://api.getaligned.work/core/api/v1/meeting-transcript-summary/remove-task?meetingId=${meetingId}&participant=${encodeURIComponent(participant)}&taskToRemove=${encodeURIComponent(task)}`,
          )

          toast({
            title: "Task completed",
            description: "Task marked as completed",
            variant: "success",
          })
        } else {
          // Move task from completedTasks back to tasks
          await apiClient(
            `https://api.getaligned.work/core/api/v1/meeting-transcript-summary/add-back-task?meetingId=${meetingId}&participant=${encodeURIComponent(participant)}&taskToAddBack=${encodeURIComponent(task)}`,
          )

          toast({
            title: "Task reopened",
            description: "Task moved back to active tasks",
            variant: "success",
          })
        }

        // Refresh the meeting details to update the task lists
        onStatusChange()
      } catch (err) {
        console.error("Task update error:", err)
        setError((err as Error).message || "Failed to update task status")
        toast({
          title: "Error",
          description: (err as Error).message || "Failed to update task status",
          variant: "destructive",
        })
        // Revert the checkbox state
        setChecked(!checked)
        // Revert the local update
        onLocalUpdate(participant, task, !checked)
      } finally {
        setLoading(false)
      }
    }

    return (
      <div className="flex items-start gap-2 w-full group">
        <div className="relative mt-0.5">
          <Checkbox
            id={`task-${task.substring(0, 10).replace(/\s+/g, "-")}`}
            checked={checked}
            onCheckedChange={handleCheckboxChange}
            disabled={loading}
            className={loading ? "opacity-50" : ""}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 border-2 border-t-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex-1">
          <label
            htmlFor={`task-${task.substring(0, 10).replace(/\s+/g, "-")}`}
            className={`text-sm leading-tight ${checked ? "line-through text-gray-500" : "text-gray-800"}`}
          >
            {task}
          </label>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    )
  }

  // Update the loading state to properly wrap TabsList in a Tabs component
  const hasMeetingDetails = !!meetingDetails

  if (!meetingDetails) {
    return (
      <div className="flex flex-col h-full w-full font-figtree">
        {/* Keep the header with full width even during loading */}
        <div className="border-b bg-background p-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
            <h2 className="text-xl font-semibold">{meeting.summary}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm text-gray-500 gap-4">
                {format(startTime, "dd MMM yyyy")} • {format(startTime, "h:mm a")} • {duration} min
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>Participants</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wrap TabsList in a Tabs component */}
        <Tabs defaultValue="summary" className="flex-1 flex flex-col w-full">
          <div className="border-b w-full overflow-x-auto">
            <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="summary"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="deal-summary"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
              >
                Deal Summary
              </TabsTrigger>
              <TabsTrigger
                value="email"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
              >
                Email
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Loading indicator in the content area */}
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 border-4 border-t-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-500">Loading meeting details...</p>
            </div>
          </div>
        </Tabs>
      </div>
    )
  }

  // Helper function to check if a section has content
  const hasContent = (array: any[] | undefined) => {
    return Array.isArray(array) && array.length > 0
  }

  return (
    <div className="flex flex-col h-full w-full font-figtree">
      {/* Header - Update to ensure it always takes full width */}
      <div className="border-b bg-background p-4 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
          <h2 className="text-xl font-semibold">{meeting.summary}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-500 gap-4">
              {format(startTime, "dd MMM yyyy")} • {format(startTime, "h:mm a")} • {duration} min
            </div>
            {/* Replace the participants display section in the header with this improved version */}
            {/* Look for the div with className="flex items-center gap-1 text-sm text-gray-500 group cursor-pointer" */}
            {/* and replace it with this code: */}
            <div className="relative">
              <button
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
                onClick={(e) => {
                  // This prevents the click from propagating to parent elements
                  e.stopPropagation()
                  const dropdown = document.getElementById("participants-dropdown")
                  if (dropdown) {
                    dropdown.classList.toggle("hidden")
                  }
                }}
                onMouseEnter={(e) => {
                  const dropdown = document.getElementById("participants-dropdown")
                  if (dropdown) {
                    dropdown.classList.remove("hidden")
                  }
                }}
              >
                <Users className="h-4 w-4" />
                <span>{meetingDetails.attendees.length} Participants</span>
              </button>

              <div
                id="participants-dropdown"
                className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50 hidden"
                onMouseLeave={(e) => {
                  const dropdown = document.getElementById("participants-dropdown")
                  if (dropdown) {
                    dropdown.classList.add("hidden")
                  }
                }}
              >
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Meeting Participants</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                  <div className="space-y-2">
                    {meetingDetails.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                          {getInitials(attendee)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{attendee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Update to ensure tabs container takes full width */}
      <Tabs defaultValue="summary" className="flex-1 flex flex-col w-full">
        <div className="border-b w-full overflow-x-auto">
          <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="summary"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
            >
              Summary
            </TabsTrigger>
            <TabsTrigger
              value="deal-summary"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
            >
              Deal Summary
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-purple data-[state=active]:bg-transparent data-[state=active]:text-purple data-[state=active]:shadow-none data-[state=active]:font-semibold"
            >
              Email
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* TabsContent components - ensure they take full width */}
          <TabsContent value="summary" className="p-4 m-0 w-full data-[state=inactive]:hidden">
            {/* Topics section */}
            {hasContent(meetingDetails.keywords) && (
              <div className="mb-6 w-full">
                <h3 className="mb-3 font-semibold">Topics</h3>
                <div className="flex flex-wrap gap-2 w-full">
                  {meetingDetails.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="bg-purple-50 text-purple-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Overview section */}
            {hasContent(meetingDetails.listSummary) && (
              <div className="mb-6 w-full">
                <h3 className="mb-3 font-semibold">Overview</h3>
                <div className="space-y-2 w-full">
                  {meetingDetails.listSummary.map((item, i) => (
                    <div key={i} className="flex gap-2 w-full">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways section */}
            {hasContent(meetingDetails.dealSummary?.keyTakeaways) && (
              <div className="mb-6 w-full">
                <h3 className="mb-3 font-semibold">Key Takeaways</h3>
                <div className="space-y-2 w-full">
                  {meetingDetails.dealSummary.keyTakeaways.map((takeaway, i) => (
                    <div key={i} className="flex gap-2 w-full">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <p className="text-sm">{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges section */}
            {hasContent(meetingDetails.dealSummary?.challenges) && (
              <div className="mb-6 w-full">
                <h3 className="mb-3 font-semibold">Challenges</h3>
                <div className="space-y-2 w-full">
                  {meetingDetails.dealSummary.challenges.map((challenge, i) => (
                    <div key={i} className="flex gap-2 w-full">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <p className="text-sm">{challenge}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendees section with tasks */}
            {hasContent(localTasksAssigned || meetingDetails.tasksAssigned) && (
              <div className="w-full mb-6">
                <h3 className="mb-3 font-semibold">Action Items</h3>
                <div className="space-y-4 w-full">
                  {(localTasksAssigned || meetingDetails.tasksAssigned)
                    .filter((attendee) => attendee.tasks.length > 0 || attendee.completedTasks.length > 0)
                    .map((attendee, index) => (
                      <div key={index} className="rounded-lg border p-4 w-full">
                        <h4 className="font-medium text-gray-800 mb-3">{attendee.participant}</h4>
                        <div className="space-y-3 w-full">
                          {attendee.tasks.map((task, i) => (
                            <TaskItem
                              key={`task-${index}-${i}`}
                              task={task}
                              isCompleted={false}
                              meetingId={meetingDetails.meeting.meetingUniqueId}
                              participant={attendee.participant}
                              onStatusChange={refreshMeetingDetails}
                              onLocalUpdate={updateLocalTasks}
                            />
                          ))}
                          {attendee.completedTasks.length > 0 && (
                            <>
                              <div className="h-px bg-gray-200 my-3"></div>
                              <h5 className="text-sm font-medium text-gray-500 mb-2">Completed</h5>
                              {attendee.completedTasks.map((task, i) => (
                                <TaskItem
                                  key={`completed-${index}-${i}`}
                                  task={task}
                                  isCompleted={true}
                                  meetingId={meetingDetails.meeting.meetingUniqueId}
                                  participant={attendee.participant}
                                  onStatusChange={refreshMeetingDetails}
                                  onLocalUpdate={updateLocalTasks}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Meeting Recording section - Updated with video functionality */}
            <div className="mb-6 w-full">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Meeting Recording</h3>
                {!videoUrl && !videoLoading && !videoError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchVideo}
                    className="text-purple border-purple hover:bg-purple-50"
                  >
                    Load Recording
                  </Button>
                )}
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 w-full">
                {videoLoading ? (
                  <div className="flex items-center justify-center h-full w-full bg-gray-100">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-purple" />
                      <p className="mt-2 text-sm text-gray-500">Loading video recording...</p>
                    </div>
                  </div>
                ) : videoError ? (
                  <div className="flex items-center justify-center h-full w-full bg-gray-100">
                    <div className="text-center max-w-md p-4">
                      <p className="text-gray-500 mb-2">{videoError}</p>
                      <Button variant="outline" size="sm" onClick={fetchVideo} className="mt-2">
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    poster="/placeholder.svg?height=400&width=800"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-100">
                    <p className="text-gray-500">Click "Load Recording" to view the meeting video.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Empty state */}
            {!hasContent(meetingDetails.keywords) &&
              !hasContent(meetingDetails.listSummary) &&
              !hasContent(meetingDetails.dealSummary?.keyTakeaways) &&
              !hasContent(meetingDetails.dealSummary?.challenges) && (
                <div className="flex items-center justify-center h-40 w-full border border-dashed rounded-md">
                  <p className="text-gray-500">No summary content available for this meeting.</p>
                </div>
              )}
          </TabsContent>

          <TabsContent value="deal-summary" className="p-4 m-0 w-full data-[state=inactive]:hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Deal Summary</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadDealSummary}
                className="flex items-center gap-1 text-purple hover:text-purple-700 hover:bg-purple-50"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <div className="space-y-6 w-full">
              {/* Client Background */}
              {meetingDetails.dealSummary?.dealSummary?.clientBackground && (
                <div className="w-full">
                  <h3 className="mb-3 font-semibold">Client Background</h3>
                  <p className="text-sm">{meetingDetails.dealSummary.dealSummary.clientBackground}</p>
                </div>
              )}

              {/* Client Pain Points */}
              {hasContent(meetingDetails.dealSummary?.dealSummary?.clientPainPoints) && (
                <div className="w-full">
                  <h3 className="mb-3 font-semibold">Client Pain Points</h3>
                  <div className="space-y-2 w-full">
                    {meetingDetails.dealSummary.dealSummary.clientPainPoints.map((point, i) => (
                      <div key={i} className="flex gap-2 w-full">
                        <span className="text-gray-400 flex-shrink-0">•</span>
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solutions Discussed */}
              {hasContent(meetingDetails.dealSummary?.dealSummary?.solutionsDiscussed) && (
                <div className="w-full">
                  <h3 className="mb-3 font-semibold">Solutions Discussed</h3>
                  <div className="space-y-2 w-full">
                    {meetingDetails.dealSummary.dealSummary.solutionsDiscussed.map((solution, i) => (
                      <div key={i} className="flex gap-2 w-full">
                        <span className="text-gray-400 flex-shrink-0">•</span>
                        <p className="text-sm">{solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {hasContent(meetingDetails.dealSummary?.dealSummary?.nextSteps) && (
                <div className="w-full">
                  <h3 className="mb-3 font-semibold">Next Steps</h3>
                  <div className="space-y-2 w-full">
                    {meetingDetails.dealSummary.dealSummary.nextSteps.map((step, i) => (
                      <div key={i} className="flex gap-2 w-full">
                        <span className="text-gray-400 flex-shrink-0">•</span>
                        <p className="text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {hasContent(meetingDetails.dealSummary?.dealSummary?.tasks) && (
                <div className="w-full">
                  <h3 className="mb-3 font-semibold">Tasks</h3>
                  <div className="space-y-3 w-full">
                    {meetingDetails.dealSummary.dealSummary.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2 w-full">
                        <Checkbox id={`deal-task-${i}`} className="mt-0.5" />
                        <div className="w-full">
                          <label htmlFor={`deal-task-${i}`} className="text-sm font-medium">
                            {task.task}
                          </label>
                          <div className="text-xs text-gray-500">
                            Assigned to: {task.owner}
                            {task.deadline && ` • Due: ${task.deadline}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!meetingDetails.dealSummary?.dealSummary?.clientBackground &&
                !hasContent(meetingDetails.dealSummary?.dealSummary?.clientPainPoints) &&
                !hasContent(meetingDetails.dealSummary?.dealSummary?.solutionsDiscussed) &&
                !hasContent(meetingDetails.dealSummary?.dealSummary?.nextSteps) &&
                !hasContent(meetingDetails.dealSummary?.dealSummary?.tasks) && (
                  <div className="flex items-center justify-center h-40 w-full border border-dashed rounded-md">
                    <p className="text-gray-500">No deal summary content available for this meeting.</p>
                  </div>
                )}
            </div>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="p-4 m-0 w-full data-[state=inactive]:hidden">
            <EmailTab meeting={meeting} meetingDetails={meetingDetails} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
})

