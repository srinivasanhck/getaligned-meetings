import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { fetchMeetingDetails } from "@/services/api"
import type { MeetingDetails } from "@/types/meetingDetails"

interface MeetingDetailsState {
  details: MeetingDetails | null
  loading: boolean
  error: string | null
  selectedMeetingId: string | null
}

const initialState: MeetingDetailsState = {
  details: null,
  loading: false,
  error: null,
  selectedMeetingId: null,
}

// Async thunk for fetching meeting details
export const fetchMeetingDetailsThunk = createAsyncThunk(
  "meetingDetails/fetchDetails",
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const response = await fetchMeetingDetails(meetingId)
      console.log("Full API response:", response)

      // The API returns the meeting details directly
      return response
    } catch (error: any) {
      console.log("error at meetDet", error)
      const errorMessage =
        error?.response?.data?.message || error?.message || "Failed to fetch meeting details. Please try again later."
      return rejectWithValue(errorMessage)
    }
  },
)

const meetingDetailsSlice = createSlice({
  name: "meetingDetails",
  initialState,
  reducers: {
    setSelectedMeetingId: (state, action: PayloadAction<string | null>) => {
      state.selectedMeetingId = action.payload
    },
    clearMeetingDetails: (state) => {
      state.details = null
      state.selectedMeetingId = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingDetailsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMeetingDetailsThunk.fulfilled, (state, action: PayloadAction<MeetingDetails>) => {
        console.log("at MDS - full payload:", action.payload)
        state.loading = false

        // The payload is the meeting details directly
        if (action.payload) {
          state.details = action.payload
          console.log("Meeting details set:", action.payload)
        } else {
          console.error("API response is empty or undefined")
          state.error = "Invalid response from server"
        }
      })
      .addCase(fetchMeetingDetailsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedMeetingId, clearMeetingDetails } = meetingDetailsSlice.actions
export default meetingDetailsSlice.reducer
