import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { fetchMeetings } from "@/services/api"
import type { Meeting, MeetingsResponse } from "@/types/meetings"

interface MeetingsState {
  meetings: Meeting[]
  loading: boolean
  initialLoading: boolean // Add this to track initial loading state
  loadingMore: boolean
  error: string | null
  oldestDate: string | null
  hasMore: boolean
}

const initialState: MeetingsState = {
  meetings: [],
  loading: true,
  initialLoading: true, // Initialize as true
  loadingMore: false,
  error: null,
  oldestDate: null,
  hasMore: true,
}

// Helper function to get date range
export const getDateRange = (endDate: Date, days = 30) => {
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days)

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  }
}

// Helper to get initial date range (today - 30 days)
export const getInitialDateRange = () => {
  const today = new Date()
  const endDate = new Date(today)
  // Set endDate to today's end: 11:59:59.999 PM
  endDate.setHours(23, 59, 59, 999)

  return getDateRange(endDate, 30)
}

// Async thunk for fetching initial meetings
export const fetchMeetingsThunk = createAsyncThunk(
  "meetings/fetchMeetings",
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await fetchMeetings(dateRange.startDate, dateRange.endDate)
      return {
        response,
        dateRange,
      }
    } catch (error: any) {
      // Improved error handling
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to fetch meetings. Please try again later."
      return rejectWithValue(errorMessage)
    }
  },
)

// Async thunk for fetching more (older) meetings
export const fetchMoreMeetingsThunk = createAsyncThunk(
  "meetings/fetchMoreMeetings",
  async (dateRange: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await fetchMeetings(dateRange.startDate, dateRange.endDate)
      return {
        response,
        dateRange,
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to fetch more meetings. Please try again later."
      return rejectWithValue(errorMessage)
    }
  },
)

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    // Add this new reducer
    updateMeetingBotStatus: (state, action: PayloadAction<{ meetingId: string; hasBotEnabled: boolean }>) => {
      const { meetingId, hasBotEnabled } = action.payload
      const meetingIndex = state.meetings.findIndex((meeting) => meeting.id === meetingId)

      if (meetingIndex !== -1) {
        state.meetings[meetingIndex].meetingBot = hasBotEnabled
      }
    },
    setSelectedMeetingId: (state, action: PayloadAction<string | null>) => {},
    // Keep any existing reducers
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch
      .addCase(fetchMeetingsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(
        fetchMeetingsThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ response: MeetingsResponse; dateRange: { startDate: string; endDate: string } }>,
        ) => {
          state.loading = false
          state.initialLoading = false // Set initialLoading to false when meetings are loaded
          state.meetings = action.payload.response.items || []
          state.oldestDate = action.payload.dateRange.startDate
          state.hasMore = action.payload.response.items.length > 0
        },
      )
      .addCase(fetchMeetingsThunk.rejected, (state, action) => {
        state.loading = false
        state.initialLoading = false // Set initialLoading to false even on error
        state.error = action.payload as string
      })

      // Fetch more (older) meetings
      .addCase(fetchMoreMeetingsThunk.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(
        fetchMoreMeetingsThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ response: MeetingsResponse; dateRange: { startDate: string; endDate: string } }>,
        ) => {
          state.loadingMore = false

          // Append new meetings to existing ones, avoiding duplicates
          const newMeetings = action.payload.response.items || []
          const existingIds = new Set(state.meetings.map((meeting) => meeting.id))

          const uniqueNewMeetings = newMeetings.filter((meeting) => !existingIds.has(meeting.id))
          state.meetings = [...state.meetings, ...uniqueNewMeetings]

          // Update the oldest date we've fetched
          state.oldestDate = action.payload.dateRange.startDate

          // If we got fewer meetings than expected, we might be at the end
          state.hasMore = newMeetings.length > 0
        },
      )
      .addCase(fetchMoreMeetingsThunk.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.payload as string
      })
  },
})

export default meetingsSlice.reducer
// export const { updateMeetingBotStatus } = meetingsSlice.actions
export const { updateMeetingBotStatus, setSelectedMeetingId } = meetingsSlice.actions
