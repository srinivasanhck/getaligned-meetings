"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  CheckCircle,
  Circle,
  Play,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronRight,
  Edit,
  Save,
  X,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchMeetingVideo } from "@/services/videoService"
import type { MeetingDetails } from "@/types/meetingDetails"
import { useToast } from "@/components/ui/toast"
import { APIURL } from "@/lib/utils"
import { getToken } from "@/services/authService"
import axios from "axios"

// Task management interfaces
interface TaskStatus {
  [participantTask: string]: {
    isCompleted: boolean
    isLoading: boolean
    error: string | null
  }
}

interface SummaryTabProps {
  details: MeetingDetails
}

// Rating component for sales evaluation
interface RatingProps {
  rating: number
  maxRating?: number
  onChange?: (newRating: number) => void
  readOnly?: boolean
}

const Rating = ({ rating, maxRating = 5, onChange, readOnly = true }: RatingProps) => {
  // Round up to nearest integer
  const ceiledRating = Math.ceil(rating)

  // Get color class based on the specific rating value
  const getColorClass = (value: number) => {
    if (value === ceiledRating) {
      if (value <= 2) return "bg-red-500 text-white"
      if (value === 3) return "bg-orange-500 text-white"
      return "bg-green-500 text-white"
    }
    return "bg-gray-200 text-gray-400"
  }

  // Get hover class for interactive ratings
  const getHoverClass = (value: number) => {
    if (readOnly) return ""
    return "cursor-pointer hover:bg-gray-300 hover:text-gray-700"
  }

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md text-xs font-medium transition-colors",
            getColorClass(index + 1),
            getHoverClass(index + 1),
          )}
          onClick={() => {
            if (!readOnly && onChange) {
              onChange(index + 1)
            }
          }}
        >
          {index + 1}
        </div>
      ))}
    </div>
  )
}

// Collapsible section component
interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  rating?: number
  onRatingChange?: (newRating: number) => void
  isEditing?: boolean
  onEditToggle?: () => void
  onSave?: () => void
  onCancel?: () => void
}

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  rating,
  onRatingChange,
  isEditing = false,
  onEditToggle,
  onSave,
  onCancel,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-100 rounded-md overflow-hidden mb-3">
      <div className="flex items-center justify-between p-3 bg-gray-50 group">
        <button className="flex items-center flex-grow text-left" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 mr-2" />
          )}
          <span className="font-medium text-gray-800 text-[14px]">{title}</span>
        </button>

        <div className="flex items-center space-x-2">
          {rating !== undefined && <Rating rating={rating} onChange={onRatingChange} readOnly={!isEditing} />}

          {!isEditing && onEditToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditToggle()
              }}
              className="p-1 text-gray-500 hover:text-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSave && onSave()
                }}
                className="p-1 text-green-500 hover:text-green-600 rounded-full"
              >
                <Save className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel && onCancel()
                }}
                className="p-1 text-gray-500 hover:text-gray-600 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {isOpen && <div className="p-3 bg-white">{children}</div>}
    </div>
  )
}

// API client function
const apiClient = async (url: string, options: RequestInit = {}) => {
  const token = getToken()
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API request failed with status ${response.status}`)
  }

  return response.json()
}

const SummaryTab = ({ details }: SummaryTabProps) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoadingVideo, setIsLoadingVideo] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({})
  const [localTasksAssigned, setLocalTasksAssigned] = useState(details.tasksAssigned || [])
  const [editedSalesEvaluation, setEditedSalesEvaluation] = useState<any>(null)
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null)
  const [isSavingEvaluation, setIsSavingEvaluation] = useState(false)
  const [evaluationError, setEvaluationError] = useState<string | null>(null)
  const { showToast } = useToast()

  const { meetingSummary, salesEvaluation = {}, keywords = [], listSummary = [] } = details
  const meetingId = details.meeting?.meetingUniqueId

  // Initialize edited sales evaluation data
  useEffect(() => {
    if (salesEvaluation && Object.keys(salesEvaluation).length > 0) {
      setEditedSalesEvaluation(JSON.parse(JSON.stringify(salesEvaluation)))
    }
  }, [salesEvaluation])

  // Format evaluation key for display
  const formatEvaluationKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1") // Insert a space before all capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
      .trim()
  }

  // Initialize task status from the details
  useEffect(() => {
    if (details.tasksAssigned && Array.isArray(details.tasksAssigned)) {
      const initialStatus: TaskStatus = {}

      details.tasksAssigned.forEach((assignee) => {
        // Process active tasks
        if (assignee.tasks && Array.isArray(assignee.tasks)) {
          assignee.tasks.forEach((task) => {
            const taskKey = `${assignee.participant}:${task}`
            initialStatus[taskKey] = {
              isCompleted: false,
              isLoading: false,
              error: null,
            }
          })
        }

        // Process completed tasks
        if (assignee.completedTasks && Array.isArray(assignee.completedTasks)) {
          assignee.completedTasks.forEach((task) => {
            const taskKey = `${assignee.participant}:${task}`
            initialStatus[taskKey] = {
              isCompleted: true,
              isLoading: false,
              error: null,
            }
          })
        }
      })

      setTaskStatus(initialStatus)
      setLocalTasksAssigned(details.tasksAssigned)
    }
  }, [details.tasksAssigned])

  const handleLoadVideo = async () => {
    if (!meetingId) return

    setIsLoadingVideo(true)
    setVideoError(null)

    try {
      const url = await fetchMeetingVideo(meetingId)
      setVideoUrl(url)
    } catch (err) {
      console.error("Failed to load video:", err)
      setVideoError("Failed to load video. Please try again.")
    } finally {
      setIsLoadingVideo(false)
    }
  }

  // Update local task state
  const updateLocalTaskState = useCallback((participant: string, task: string, isCompleted: boolean) => {
    setLocalTasksAssigned((prev) => {
      return prev.map((assignee) => {
        if (assignee.participant !== participant) return assignee

        if (isCompleted) {
          // Move from tasks to completedTasks
          return {
            ...assignee,
            tasks: assignee.tasks.filter((t) => t !== task),
            completedTasks: [...(assignee.completedTasks || []), task],
          }
        } else {
          // Move from completedTasks to tasks
          return {
            ...assignee,
            completedTasks: (assignee.completedTasks || []).filter((t) => t !== task),
            tasks: [...assignee.tasks, task],
          }
        }
      })
    })
  }, [])

  // Refresh meeting details
  const refreshMeetingDetails = useCallback(() => {
    // This would typically dispatch an action to refresh the meeting details
    // For now, we'll just use the local state updates
    console.log("Meeting details would be refreshed here")
  }, [])

  // Handle task status change
  const handleTaskStatusChange = async (participant: string, task: string, isCompleted: boolean) => {
    const taskKey = `${participant}:${task}`

    // Don't proceed if already in that state or loading
    if (taskStatus[taskKey]?.isCompleted === isCompleted || taskStatus[taskKey]?.isLoading) return

    // Update state immediately for better UX
    setTaskStatus((prev) => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        isCompleted,
        isLoading: true,
        error: null,
      },
    }))

    // Update local state immediately
    updateLocalTaskState(participant, task, isCompleted)

    try {
      if (isCompleted) {
        // Move task from tasks to completedTasks
        await apiClient(
          `${APIURL}/api/v1/meeting-transcript-summary/remove-task?meetingId=${meetingId}&participant=${encodeURIComponent(participant)}&taskToRemove=${encodeURIComponent(task)}`,
        )

        showToast("Task marked as completed", "success")
      } else {
        // Move task from completedTasks back to tasks
        await apiClient(
          `${APIURL}/api/v1/meeting-transcript-summary/add-back-task?meetingId=${meetingId}&participant=${encodeURIComponent(participant)}&taskToAddBack=${encodeURIComponent(task)}`,
        )

        showToast("Task moved back to active tasks", "success")
      }

      // Update loading state
      setTaskStatus((prev) => ({
        ...prev,
        [taskKey]: {
          ...prev[taskKey],
          isLoading: false,
        },
      }))

      // Refresh the meeting details
      refreshMeetingDetails()
    } catch (err) {
      console.error("Task update error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update task status"

      // Update error state
      setTaskStatus((prev) => ({
        ...prev,
        [taskKey]: {
          isCompleted: !isCompleted, // Revert to previous state
          isLoading: false,
          error: errorMessage,
        },
      }))

      // Revert local state
      updateLocalTaskState(participant, task, !isCompleted)

      showToast(errorMessage, "error")
    }
  }

  // Handle rating change
  const handleRatingChange = (sectionKey: string, newRating: number) => {
    if (!editedSalesEvaluation) return

    setEditedSalesEvaluation((prev: any) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        rating: newRating,
      },
    }))
  }

  // Handle feedback change
  const handleFeedbackChange = (sectionKey: string, index: number, newValue: string) => {
    if (!editedSalesEvaluation) return

    setEditedSalesEvaluation((prev: any) => {
      const updatedValues = [...prev[sectionKey].value]
      updatedValues[index] = newValue

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          value: updatedValues,
        },
      }
    })
  }

  // Add new feedback item
  const handleAddFeedback = (sectionKey: string) => {
    if (!editedSalesEvaluation) return

    setEditedSalesEvaluation((prev: any) => {
      const updatedValues = [...(prev[sectionKey].value || [])]
      updatedValues.push("")

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          value: updatedValues,
        },
      }
    })
  }

  // Remove feedback item
  const handleRemoveFeedback = (sectionKey: string, index: number) => {
    if (!editedSalesEvaluation) return

    setEditedSalesEvaluation((prev: any) => {
      const updatedValues = [...prev[sectionKey].value]
      updatedValues.splice(index, 1)

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          value: updatedValues,
        },
      }
    })
  }

  // Save evaluation changes
  const handleSaveEvaluation = async (sectionKey: string) => {
    if (!meetingId || !editedSalesEvaluation) return

    setIsSavingEvaluation(true)
    setEvaluationError(null)

    try {
      const token = getToken()

      // Make the API call to update the sales evaluation
      await axios.put(
        `${APIURL}/api/v1/meeting-bot/update-meeting-sales-evaluation?meetingUniqueId=${meetingId}`,
        editedSalesEvaluation,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update was successful
      showToast("Sales evaluation updated successfully", "success")
      setEditingSectionKey(null)
    } catch (err) {
      console.error("Failed to update sales evaluation:", err)
      setEvaluationError("Failed to update sales evaluation. Please try again.")
      showToast("Failed to update sales evaluation", "error")
    } finally {
      setIsSavingEvaluation(false)
    }
  }

  // Filter out participants with no tasks
  const filteredTasksAssigned = localTasksAssigned.filter(
    (assignee) =>
      (assignee.tasks && assignee.tasks.length > 0) || (assignee.completedTasks && assignee.completedTasks.length > 0),
  )

  // Check if salesEvaluation has valid data
  const hasSalesEvaluation = salesEvaluation && Object.keys(salesEvaluation).length > 0

  return (
    <div className="h-full grid grid-cols-12 gap-6">
      {/* Left Column - 7/12 width with independent scrolling */}
      <div className="col-span-7 h-full overflow-y-auto custom-scrollbar p-6 pr-3">
        <div className="space-y-6">
          {/* Keywords */}
          {keywords && Array.isArray(keywords) && keywords.length > 0 && (
            <div>
              <h2 className="text-[16px] font-semibold text-black mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Summary */}
          {meetingSummary && (
            <div>
              <h2 className="text-[16px] font-semibold text-black mb-3">Meeting Summary</h2>
              <ul className="space-y-3 list-disc ml-4">
                {meetingSummary
                  .split("\n\n")
                  .filter((para) => para.trim().length > 0)
                  .map((paragraph, index) => (
                    <li key={index} className="p-1 rounded-lg text-black text-sm list-none">
                      {paragraph}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {filteredTasksAssigned.length > 0 && (
            <div>
              <h2 className="text-[16px] font-semibold text-black mb-3">Action Items</h2>
              <div className="space-y-4">
                {filteredTasksAssigned.map((assignee, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="font-semibold text-black mb-2">{assignee.participant}</div>
                    <ul className="space-y-2">
                      {/* Active Tasks */}
                      {assignee.tasks &&
                        Array.isArray(assignee.tasks) &&
                        assignee.tasks.map((task, taskIndex) => {
                          const taskKey = `${assignee.participant}:${task}`
                          const status = taskStatus[taskKey] || { isCompleted: false, isLoading: false, error: null }

                          return (
                            <li key={`task-${taskIndex}`} className="flex items-start">
                              <button
                                onClick={() => handleTaskStatusChange(assignee.participant, task, true)}
                                className="mr-2 mt-0.5 flex-shrink-0 text-gray-400 hover:text-primary transition-colors"
                                disabled={status.isLoading}
                              >
                                {status.isLoading ? (
                                  <Loader className="h-5 w-5 animate-spin text-primary" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                              <span className="text-sm text-black">{task}</span>
                            </li>
                          )
                        })}

                      {/* Completed Tasks */}
                      {assignee.completedTasks &&
                        Array.isArray(assignee.completedTasks) &&
                        assignee.completedTasks.map((task, taskIndex) => {
                          const taskKey = `${assignee.participant}:${task}`
                          const status = taskStatus[taskKey] || { isCompleted: true, isLoading: false, error: null }

                          return (
                            <li key={`completed-${taskIndex}`} className="flex items-start">
                              <button
                                onClick={() => handleTaskStatusChange(assignee.participant, task, false)}
                                className="mr-2 mt-0.5 flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                                disabled={status.isLoading}
                              >
                                {status.isLoading ? (
                                  <Loader className="h-5 w-5 animate-spin text-primary" />
                                ) : (
                                  <CheckCircle className="h-5 w-5" />
                                )}
                              </button>
                              <span className="text-sm line-through text-gray-400">{task}</span>
                            </li>
                          )
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - 5/12 width with independent scrolling */}
      <div className="col-span-5 h-full overflow-y-auto custom-scrollbar p-6 pl-3">
        <div className="space-y-6">
          {/* Video Player */}
          <div>
            <h2 className="text-[16px] font-semibold text-black mb-3">Meeting Recording</h2>
            <div className="bg-gray-100 rounded-lg overflow-hidden relative">
              {videoUrl ? (
                <video src={videoUrl} className="w-full aspect-video" controls />
              ) : (
                <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
                  {isLoadingVideo ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2"></div>
                      <p className="text-sm">Loading video...</p>
                    </div>
                  ) : videoError ? (
                    <div className="flex flex-col items-center p-4 text-center">
                      <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                      <p className="text-xs text-red-200 mb-2">{videoError}</p>
                      <button
                        onClick={handleLoadVideo}
                        className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <button onClick={handleLoadVideo} className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center mb-2">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                      <p className="text-sm">Click to load video</p>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sales Evaluation - Dynamic rendering based on the data */}
          {hasSalesEvaluation && editedSalesEvaluation && (
            <div>
              <h2 className="text-[16px] font-semibold text-black mb-3">Sales Evaluation</h2>

              {/* Error message */}
              {evaluationError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {evaluationError}
                </div>
              )}

              {/* Loading overlay */}
              {isSavingEvaluation && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
                    <Loader className="h-5 w-5 animate-spin text-primary" />
                    <span>Saving changes...</span>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2">
                  {Object.entries(editedSalesEvaluation).map(([key, value]: [string, any]) => {
                    // Skip if value is not an object with rating property
                    if (!value || typeof value !== "object" || !("rating" in value)) {
                      return null
                    }

                    // Check if we should set this as default open (for overallPerformance)
                    const isOverallPerformance = key === "overallPerformance"
                    const isEditing = editingSectionKey === key

                    return (
                      <CollapsibleSection
                        key={key}
                        title={formatEvaluationKey(key)}
                        defaultOpen={isOverallPerformance}
                        rating={Math.ceil(value.rating)}
                        onRatingChange={(newRating) => handleRatingChange(key, newRating)}
                        isEditing={isEditing}
                        onEditToggle={() => setEditingSectionKey(key)}
                        onSave={() => handleSaveEvaluation(key)}
                        onCancel={() => setEditingSectionKey(null)}
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Feedback:</div>
                            {value.value &&
                              Array.isArray(value.value) &&
                              value.value.map((item: string, index: number) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <textarea
                                    value={item}
                                    onChange={(e) => handleFeedbackChange(key, index, e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded text-sm min-h-[60px]"
                                    placeholder="Enter feedback"
                                  />
                                  <button
                                    onClick={() => handleRemoveFeedback(key, index)}
                                    className="p-1 text-red-500 hover:text-red-600"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            <button
                              onClick={() => handleAddFeedback(key)}
                              className="text-sm text-primary hover:text-primary/80 flex items-center"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add feedback
                            </button>
                          </div>
                        ) : (
                          value.value &&
                          Array.isArray(value.value) &&
                          value.value.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-gray-700 block mb-1">Feedback:</span>
                              <ul className="list-disc pl-5 space-y-1">
                                {value.value.map((item: string, index: number) => (
                                  <li key={index} className="text-sm text-gray-600">
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </CollapsibleSection>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SummaryTab
