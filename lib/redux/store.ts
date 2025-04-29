import { configureStore } from "@reduxjs/toolkit"
import meetingsReducer from "./features/meetingsSlice"
import meetingDetailsReducer from "./features/meetingDetailsSlice"
import nextStepsReducer from "./features/nextStepsSlice"

export const store = configureStore({
  reducer: {
    meetings: meetingsReducer,
    meetingDetails: meetingDetailsReducer,
    nextSteps: nextStepsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
