import { createAsyncThunk } from "@reduxjs/toolkit"
import type { MeetingDetail } from "@/lib/types"
import { fetchMeetingDetails as fetchMeetingDetailsApi } from "@/lib/api"

// Async thunk for fetching meeting details
export const fetchMeetingDetails = createAsyncThunk(
  "meeting/fetchMeetingDetails",
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const data = await fetchMeetingDetailsApi(meetingId)
      return data as MeetingDetail
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

