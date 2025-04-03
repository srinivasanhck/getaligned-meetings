import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { MeetingData } from "@/lib/types"
import { formatISO } from "date-fns"
import { fetchMeetings } from "@/lib/api"

interface MeetingsState {
  previousMeetings: MeetingData | null
  loading: boolean
  error: string | null
  dateRange: "15days" | "30days"
}

const initialState: MeetingsState = {
  previousMeetings: null,
  loading: false,
  error: null,
  dateRange: "15days",
}

// Helper function to get date range
const getDateRange = (days: number) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  return {
    startDate: formatISO(startDate, { representation: "complete" }).split("+")[0],
    endDate: formatISO(endDate, { representation: "complete" }).split("+")[0],
  }
}

// Async thunk for fetching previous meetings
export const fetchPreviousMeetings = createAsyncThunk(
  "meetings/fetchPreviousMeetings",
  async (days: number, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = getDateRange(days)
      console.log("startDate", startDate, "endDate", endDate)

      const data = await fetchMeetings(startDate, endDate)
      return data as MeetingData
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<"15days" | "30days">) => {
      state.dateRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreviousMeetings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPreviousMeetings.fulfilled, (state, action) => {
        state.loading = false
        state.previousMeetings = action.payload
      })
      .addCase(fetchPreviousMeetings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setDateRange } = meetingsSlice.actions
export default meetingsSlice.reducer

