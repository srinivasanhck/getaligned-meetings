import { configureStore } from "@reduxjs/toolkit"
import meetingsReducer from "./features/meetingsSlice"
import meetingDetailsReducer from "./features/meetingDetailsSlice"
import nextStepsReducer from "./features/nextStepsSlice"
import pptReducer from "./features/pptSlice"

export const store = configureStore({
  reducer: {
    meetings: meetingsReducer,
    meetingDetails: meetingDetailsReducer,
    nextSteps: nextStepsReducer,
    ppt: pptReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
