import { configureStore } from "@reduxjs/toolkit"
import meetingsReducer from "./meetingsSlice"
import dashboardReducer from "./dashboardSlice"
import upcomingMeetingsReducer from "./upcomingMeetingsSlice"

export const store = configureStore({
  reducer: {
    meetings: meetingsReducer,
    dashboard: dashboardReducer,
    upcomingMeetings: upcomingMeetingsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

