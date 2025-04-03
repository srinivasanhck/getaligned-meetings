import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { MeetingData, MeetingDetail } from "@/lib/types"
import { formatISO, subDays } from "date-fns"
import {
  fetchMeetings,
  fetchMeetingDetails as fetchMeetingDetailsApi,
  fetchEmailTemplate as fetchEmailTemplateApi,
} from "@/lib/api"

interface DashboardState {
  meetings: MeetingData | null
  selectedMeeting: string | null
  meetingDetails: MeetingDetail | null
  emailData: any;
  loadingMeetings: boolean
  loadingDetails: boolean
  loadingEmail: boolean
  error: string | null
  detailsError: string | null
  emailError: string | null
  dateRange: "recent" | "7days" | "15days" | "30days" | "today"
}

const initialState: DashboardState = {
  meetings: null,
  selectedMeeting: null,
  meetingDetails: null,
  emailData: null,
  loadingMeetings: false,
  loadingDetails: false,
  loadingEmail: false,
  error: null,
  detailsError: null,
  emailError: null,
  dateRange: "30days",
}

// Helper function to get date range based on the selected filter
const getDateRange = (filter: string) => {
  const endDate = new Date()
  let startDate: Date

  switch (filter) {
    case "7days":
      startDate = subDays(new Date(), 7)
      break
    case "15days":
      startDate = subDays(new Date(), 15)
      break
    case "30days":
      startDate = subDays(new Date(), 30)
      break
    case "today":
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      break
    case "recent":
    default:
      startDate = subDays(new Date(), 2) // Default to 2 days for "Today & Yesterday"
      break
  }

  const formattedStartDate = formatISO(startDate, { representation: "complete" }).split("+")[0]
  const formattedEndDate = formatISO(endDate, { representation: "complete" }).split("+")[0]

  console.log("Fetching meetings with date range:", {
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  })

  return {
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  }
}

// Async thunk for fetching recent meetings
export const fetchRecentMeetings = createAsyncThunk("dashboard/fetchRecentMeetings",
  async (filter: string, { rejectWithValue }) => {
    try {
      const { startDate, endDate } = getDateRange(filter)
      console.log("start and end", startDate, endDate)
      console.log(`Fetching meetings from ${startDate} to ${endDate}`)

      const data = await fetchMeetings(startDate, endDate)
      console.log("data at fetch meetings", data)
      return data as MeetingData
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Async thunk for fetching meeting details
export const fetchMeetingDetails = createAsyncThunk(
  "dashboard/fetchMeetingDetails",
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const data = await fetchMeetingDetailsApi(meetingId)
      return data as MeetingDetail
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Add a new async thunk for fetching email template
export const fetchEmailTemplate = createAsyncThunk(
  "dashboard/fetchEmailTemplate",
  async (meetingId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { dashboard: DashboardState }
      const meetingDetails = state.dashboard.meetingDetails

      if (!meetingDetails?.meeting?.meetingUniqueId) {
        throw new Error("Meeting ID not found")
      }

      const data = await fetchEmailTemplateApi(meetingDetails.meeting.meetingUniqueId)
      return data
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

// Add a new async thunk for fetching more meetings with pagination
export const fetchMoreMeetings = createAsyncThunk(
  "dashboard/fetchMoreMeetings",
  async ({ filter = "30days", page = 1 }, { rejectWithValue, getState }) => {
    try {
      const { startDate, endDate } = getDateRange(filter)
      console.log(`Fetching more meetings from ${startDate} to ${endDate}, page ${page}`)

      // You might need to update your API to support pagination
      const data = await fetchMeetings(startDate, endDate, page)
      return data as MeetingData
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSelectedMeeting: (state, action: PayloadAction<string>) => {
      state.selectedMeeting = action.payload
    },
    clearMeetingDetails: (state) => {
      state.meetingDetails = null
      state.selectedMeeting = null
    },
    setDateRange: (state, action: PayloadAction<"recent" | "7days" | "15days" | "30days" | "today">) => {
      state.dateRange = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchRecentMeetings
      .addCase(fetchRecentMeetings.pending, (state) => {
        state.loadingMeetings = true
        state.error = null
      })
      .addCase(fetchRecentMeetings.fulfilled, (state, action) => {
        state.loadingMeetings = false
        state.meetings = action.payload

        // Auto-select the first SummaryReady meeting if no meeting is selected
        if (!state.selectedMeeting && action.payload.items.length > 0) {
          const summaryReadyMeeting = [...action.payload.items].reverse()
            .find((meeting) => meeting.meetingStatus === "SummaryReady")
          if (summaryReadyMeeting) {
            state.selectedMeeting = summaryReadyMeeting.id
          } else {
            // If no SummaryReady meeting, select the first meeting
            // state.selectedMeeting = action.payload.items[0].id
          }
        }
      })
      .addCase(fetchRecentMeetings.rejected, (state, action) => {
        state.loadingMeetings = false
        state.error = action.payload as string
      })

      // Handle fetchMeetingDetails
      .addCase(fetchMeetingDetails.pending, (state) => {
        state.loadingDetails = true
        state.detailsError = null
        // Don't clear the existing meeting details while loading new ones
        // This prevents layout shifts
      })
      .addCase(fetchMeetingDetails.fulfilled, (state, action) => {
        state.loadingDetails = false
        state.meetingDetails = action.payload
        // Reset email data when meeting changes
        state.emailData = null
      })
      .addCase(fetchMeetingDetails.rejected, (state, action) => {
        state.loadingDetails = false
        state.detailsError = action.payload as string
      })

      // Handle fetchEmailTemplate
      .addCase(fetchEmailTemplate.pending, (state) => {
        state.loadingEmail = true
        state.emailError = null
      })
      .addCase(fetchEmailTemplate.fulfilled, (state, action) => {
        state.loadingEmail = false
        state.emailData = action.payload
      })
      .addCase(fetchEmailTemplate.rejected, (state, action) => {
        state.loadingEmail = false
        state.emailError = action.payload as string

        // Set fallback email data if API fails
        if (state.meetings && state.selectedMeeting) {
          const selectedMeeting = state.meetings.items.find((meeting) => meeting.id === state.selectedMeeting)
          if (selectedMeeting) {
            state.emailData = {
              email: {
                subject: `Follow-up: ${selectedMeeting.summary} - Action Items and Next Steps`,
                recipient: "",
                body: `Hi Team,

Thank you for attending our meeting today. Here's a summary of what we discussed and the next steps:

1. Key points discussed:
   - Project timeline review
   - Resource allocation
   - Upcoming milestones

2. Action items:
   - [Person 1]: Complete design review by Friday
   - [Person 2]: Schedule follow-up meeting with stakeholders
   - [Person 3]: Share updated documentation

3. Next steps:
   - Follow-up meeting scheduled for next week
   - Finalize Q3 planning

Please let me know if you have any questions or need clarification on any of the items above.

Best regards,
[Your Name]`,
              },
              meeting: selectedMeeting,
            }
          }
        }
      })
      // Add inside the extraReducers builder
      .addCase(fetchMoreMeetings.pending, (state) => {
        // Don't set loading to true to avoid UI flicker during pagination
        state.error = null
      })
      .addCase(fetchMoreMeetings.fulfilled, (state, action) => {
        // Append new meetings to existing ones instead of replacing
        if (state.meetings && action.payload.items.length > 0) {
          state.meetings.items = [...state.meetings.items, ...action.payload.items]
        } else if (!state.meetings) {
          state.meetings = action.payload
        }
      })
      .addCase(fetchMoreMeetings.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { setSelectedMeeting, clearMeetingDetails, setDateRange } = dashboardSlice.actions
export default dashboardSlice.reducer

