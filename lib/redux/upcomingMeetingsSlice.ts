import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { MeetingData } from "@/lib/types"
import { formatISO, addDays } from "date-fns"
import { fetchMeetings } from "@/lib/api"

interface UpcomingMeetingsState {
  meetings: MeetingData | null
  loading: boolean
  error: string | null
  filter: "today" | "next7days"
}

const initialState: UpcomingMeetingsState = {
  meetings: null,
  loading: false,
  error: null,
  filter: "today",
}

// Helper function to get date range based on filter
const getDateRange = (filter: "today" | "next7days") => {
  const startDate = new Date()
  let endDate: Date

  if (filter === "today") {
    // Set end date to end of today
    endDate = new Date(startDate)
    endDate.setHours(23, 59, 59, 999)
  } else {
    // Set end date to 7 days from now
    endDate = addDays(startDate, 7)
    endDate.setHours(23, 59, 59, 999)
  }

  return {
    startDate: formatISO(startDate, { representation: "complete" }).split("+")[0],
    endDate: formatISO(endDate, { representation: "complete" }).split("+")[0],
  }
}

// Async thunk for fetching upcoming meetings
export const fetchUpcomingMeetings = createAsyncThunk(
  "upcomingMeetings/fetchUpcomingMeetings",
  async (filter: "today" | "next7days", { rejectWithValue }) => {
    try {
      const { startDate, endDate } = getDateRange(filter)
      console.log(`Fetching upcoming meetings from ${startDate} to ${endDate}`)

      const data = await fetchMeetings(startDate, endDate)
      return data as MeetingData
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Add this new action
export const updateMeetingBotStatus = createAsyncThunk(
  "upcomingMeetings/updateMeetingBotStatus",
  async ({ meetingId, hasBotEnabled }: { meetingId: string; hasBotEnabled: boolean }, { getState }) => {
    return { meetingId, hasBotEnabled }
  },
)

const upcomingMeetingsSlice = createSlice({
  name: "upcomingMeetings",
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<"today" | "next7days">) => {
      state.filter = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingMeetings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUpcomingMeetings.fulfilled, (state, action) => {
        state.loading = false
        state.meetings = action.payload
      })
      .addCase(fetchUpcomingMeetings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Add this to the extraReducers section
      .addCase(updateMeetingBotStatus.fulfilled, (state, action) => {
        const { meetingId, hasBotEnabled } = action.payload
        if (state.meetings?.items) {
          state.meetings.items = state.meetings.items.map((meeting) => {
            if (meeting.id === meetingId) {
              return {
                ...meeting,
                meetingBot: hasBotEnabled,
              }
            }
            return meeting
          })
        }
      })
  },
})

export const { setFilter } = upcomingMeetingsSlice.actions
export default upcomingMeetingsSlice.reducer

