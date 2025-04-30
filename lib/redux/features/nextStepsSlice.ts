import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import type { RootState } from "../store"
import { getToken } from "@/services/authService"
import { APIURL } from "@/lib/utils"

// Define the types for the next steps data
interface TaskStatus {
  id: number
  taskStatusName: string
  taskStatus: string | null
  stateOrder: number
  auditNotes: string
}

interface TaskType {
  id: number
  taskType: string
}

interface Meeting {
  id: number
  meetingUniqueId: string
  meetingTitle: string
  meetingDescription: string
  meetingLinkUrl: string
  organizer: string
  startTime?: string
  endTime?: string
}

interface Task {
  id: number
  title: string
  description: string
  meetingParticipant: string
  assignedBy: string | null
  emailAddress: string | null
  createdDate: string
  updatedDate: string
  taskType: TaskType
  taskStatus: TaskStatus
  meeting: Meeting
  // Add other fields as needed
}

export interface NextStepsState {
  tasks: Task[]
  allParticipants: string[]
  selectedParticipant: string | null
  totalCompletedTasks: number
  inProgressActionItems: number
  completedActionItems: number
  inProgressIdeasSharedTasks: number
  loading: boolean
  error: string | null
  hasMore: boolean
  currentStartDate: string
  currentEndDate: string
  // Track previous date ranges for pagination
  dateRanges: { startDate: string; endDate: string }[]
  // Track tasks being marked as completed
  completingTasks: Record<number, boolean>
}

const initialState: NextStepsState = {
  tasks: [],
  allParticipants: [],
  selectedParticipant: null,
  totalCompletedTasks: 0,
  inProgressActionItems: 0,
  completedActionItems: 0,
  inProgressIdeasSharedTasks: 0,
//   loading: false,
  loading: true,
  error: null,
  hasMore: true,
  currentStartDate: "",
  currentEndDate: "",
  dateRanges: [],
  completingTasks: {},
}

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


// Async thunk for fetching next steps
export const fetchNextSteps = createAsyncThunk(
  "nextSteps/fetchNextSteps",
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const token = getToken()
      console.log(`Fetching next steps from ${startDate} to ${endDate}`)

      const response = await fetch(
        `${APIURL}/api/v1/meeting-bot/summary/filter-task?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      const data = await response.json()
      console.log("Next steps API response:", data)

      if (data.message && data.message.includes("No meetings found")) {
        return { data: null, hasMore: false, startDate, endDate }
      }

      return { data, hasMore: true, startDate, endDate }
    } catch (error) {
      console.error("Error fetching next steps:", error)
      return rejectWithValue("Failed to fetch next steps")
    }
  },
)

// Async thunk for completing a task
export const completeTask = createAsyncThunk(
  "nextSteps/completeTask",
  async (
    {
      taskId,
      meetingId,
      participant,
      taskTitle,
    }: { taskId: number; meetingId: string; participant: string; taskTitle: string },
    { rejectWithValue },
  ) => {
    try {
      const token = getToken()
      console.log(`Completing task: ${taskTitle} for participant: ${participant}`)

      const response = await fetch(
        `${APIURL}/api/v1/meeting-transcript-summary/remove-task?meetingId=${meetingId}&participant=${encodeURIComponent(participant)}&taskToRemove=${encodeURIComponent(taskTitle)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to complete task")
      }

      const data = await response.json()
      console.log("Complete task API response:", data)

      return { taskId, success: true }
    } catch (error) {
      console.error("Error completing task:", error)
      return rejectWithValue((error as Error).message || "Failed to complete task")
    }
  },
)

// Create the next steps slice
const nextStepsSlice = createSlice({
  name: "nextSteps",
  initialState,
  reducers: {
    resetNextSteps: () => initialState,
    setCurrentDateRange: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.currentStartDate = action.payload.startDate
      state.currentEndDate = action.payload.endDate
    },
    setSelectedParticipant: (state, action: PayloadAction<string | null>) => {
      state.selectedParticipant = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNextSteps.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNextSteps.fulfilled, (state, action) => {
        state.loading = false

        if (!action.payload.data) {
          state.hasMore = false
          return
        }

        const { data, startDate, endDate } = action.payload

        // Get tasks from the response
        const newTasksFromResponse = data.tasks || []

        // Filter tasks where taskType.id === 5 and taskStatus.id === 1
        const filteredTasks = newTasksFromResponse.filter(
          (task:any) => task.taskType?.id === 5 && task.taskStatus?.id === 1,
        )

        console.log(
          `Filtered ${filteredTasks.length} tasks with taskType.id=5 and taskStatus.id=1 from ${newTasksFromResponse.length} total tasks`,
        )

        // Reverse the array to have newest tasks first
        const reversedFilteredTasks = [...filteredTasks].reverse()

        // Ensure we're not adding duplicate tasks by checking IDs
        const existingTaskIds = new Set(state.tasks.map((task) => task.id))
        const uniqueFilteredTasks = reversedFilteredTasks.filter((task) => !existingTaskIds.has(task.id))

        console.log("Adding new filtered tasks:", uniqueFilteredTasks.length)

        // For initial load, just use the filtered tasks
        if (state.tasks.length === 0) {
          state.tasks = uniqueFilteredTasks
        } else {
          // For subsequent loads (infinite scroll), append the new tasks at the end
          state.tasks = [...state.tasks, ...uniqueFilteredTasks]
        }

        // Merge new participants with existing ones and remove duplicates
        const newParticipants = data.allParticipants || []
        const mergedParticipants = [...state.allParticipants, ...newParticipants]

        // Remove duplicates using Set
        const uniqueParticipants = [...new Set(mergedParticipants)]

        console.log(
          `Merged participants: ${state.allParticipants.length} existing + ${newParticipants.length} new = ${uniqueParticipants.length} unique`,
        )

        // Update participants list with unique merged list
        state.allParticipants = uniqueParticipants

        // Update other stats
        state.totalCompletedTasks = data.totalCompletedTasks || 0
        state.inProgressActionItems = data.inProgressActionItems || 0
        state.completedActionItems = data.completedActionItems || 0
        state.inProgressIdeasSharedTasks = data.inProgressIdeasSharedTasks || 0

        // Store the date range for this fetch
        state.dateRanges.push({ startDate, endDate })

        // Update current date range
        state.currentStartDate = startDate
        state.currentEndDate = endDate

        // Set hasMore based on whether we found any matching tasks
        state.hasMore = uniqueFilteredTasks.length > 0
      })
      .addCase(fetchNextSteps.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Handle completeTask actions
      .addCase(completeTask.pending, (state, action) => {
        // Set the task as completing
        const taskId = action.meta.arg.taskId
        state.completingTasks[taskId] = true
      })
      .addCase(completeTask.fulfilled, (state, action) => {
        // Remove the task from the list
        const taskId = action.payload.taskId
        state.tasks = state.tasks.filter((task) => task.id !== taskId)

        // Remove from completing tasks
        delete state.completingTasks[taskId]

        // Update stats
        state.completedActionItems += 1
        state.inProgressActionItems -= 1
      })
      .addCase(completeTask.rejected, (state, action) => {
        // Remove from completing tasks
        const taskId = action.meta.arg.taskId
        delete state.completingTasks[taskId]
      })
  },
})

// Export actions and selectors
export const { resetNextSteps, setCurrentDateRange, setSelectedParticipant } = nextStepsSlice.actions

export const selectNextSteps = (state: RootState) => {
  const { tasks, selectedParticipant } = state.nextSteps

  // If no participant is selected, return all tasks
  if (!selectedParticipant) {
    return tasks
  }

  // Filter tasks by selected participant
  return tasks.filter((task) => task.meetingParticipant === selectedParticipant)
}

export const selectNextStepsLoading = (state: RootState) => state.nextSteps.loading
export const selectNextStepsError = (state: RootState) => state.nextSteps.error
export const selectNextStepsHasMore = (state: RootState) => state.nextSteps.hasMore
export const selectNextStepsStats = (state: RootState) => ({
  allParticipants: state.nextSteps.allParticipants,
  totalCompletedTasks: state.nextSteps.totalCompletedTasks,
  inProgressActionItems: state.nextSteps.inProgressActionItems,
  completedActionItems: state.nextSteps.completedActionItems,
  inProgressIdeasSharedTasks: state.nextSteps.inProgressIdeasSharedTasks,
})
export const selectCurrentDateRange = (state: RootState) => ({
  startDate: state.nextSteps.currentStartDate,
  endDate: state.nextSteps.currentEndDate,
})
export const selectDateRanges = (state: RootState) => state.nextSteps.dateRanges
export const selectAllParticipants = (state: RootState) => state.nextSteps.allParticipants
export const selectSelectedParticipant = (state: RootState) => state.nextSteps.selectedParticipant
export const selectCompletingTasks = (state: RootState) => state.nextSteps.completingTasks

export default nextStepsSlice.reducer
