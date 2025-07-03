import { normaliseSlides } from "@/lib/utils/slideAdapter"
import { pptService } from "@/services/pptService"
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface SlideContentBlock {
  id?: string
  type: string
  text?: string
  items?: string[]
  style?: any
  position?: any
  url?: string
  src?: string
  headers?: string[]
  rows?: string[][]
  [key: string]: any
}

export interface SlideBackground {
  type: string
  value: string
}

export interface Slide {
  slide_id: string
  content: SlideContentBlock[]
  background?: SlideBackground
}

export interface OutlineItem {
  contentTopic: string
  slideTitle: string
  visualTopic: string
}

interface PptState {
  title: string
  outline: OutlineItem[] // Updated type
  isGeneratingOutline: boolean
  selectedTemplate: string
  error: string | null
  slides: Slide[]
  loadingSlides: boolean
  slidesError?: string | null
  groundingChunks?: any[] | null // Add this for the new response
}

const initialState: PptState = {
  title: "",
  outline: [],
  isGeneratingOutline: false,
  selectedTemplate: "light",
  error: null,
  slides: [],
  loadingSlides: false,
  slidesError: null,
  groundingChunks: null,
}

/* ------------------------------------------------------------------ */
/* 1-A  Async thunk                                                   */
/* ------------------------------------------------------------------ */

export const fetchSlidesByRequestId = createAsyncThunk<
  Slide[], // return type
  string, // requestId
  { rejectValue: string }
>("ppt/fetchSlidesByRequestId", async (requestId, { rejectWithValue }) => {
  try {
    const raw = await pptService.fetchSlidesByRequestId(requestId)
    console.log("Raw slides data:", raw)
    console.log("normalised slides data:", normaliseSlides(raw))
    return normaliseSlides(raw) // clean once
  } catch (err: any) {
    return rejectWithValue(err.message ?? "Failed to fetch slides")
  }
})

/* ------------------------------------------------------------------ */
/* 1-B  Slice                                                          */
/* ------------------------------------------------------------------ */

export const pptSlice = createSlice({
  name: "ppt",
  initialState,
  reducers: {
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload
    },
    setOutline: (state, action: PayloadAction<OutlineItem[]>) => {
      // Updated type
      state.outline = action.payload
    },
    setGroundingChunks: (state, action: PayloadAction<any[] | null>) => {
      state.groundingChunks = action.payload
    },
    setSlides(state, action: PayloadAction<Slide[]>) {
      state.slides = action.payload
    },
    setLoadingSlides(state, action: PayloadAction<boolean>) {
      state.loadingSlides = action.payload
    },
    setSlidesError(state, action: PayloadAction<string | null>) {
      state.slidesError = action.payload
    },
    setIsGeneratingOutline: (state, action: PayloadAction<boolean>) => {
      state.isGeneratingOutline = action.payload
    },
    setSelectedTemplate: (state, action: PayloadAction<string>) => {
      state.selectedTemplate = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    updateSlide: (state, action: PayloadAction<{ slideId: string; updatedSlide: Slide }>) => {
      const { slideId, updatedSlide } = action.payload
      const slideIndex = state.slides.findIndex((slide) => slide.slide_id === slideId)
      if (slideIndex !== -1) {
        state.slides[slideIndex] = updatedSlide
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlidesByRequestId.pending, (state) => {
        state.loadingSlides = true
        state.slidesError = null
      })
      .addCase(fetchSlidesByRequestId.fulfilled, (state, action: PayloadAction<Slide[]>) => {
        state.slides = action.payload
        state.loadingSlides = false
      })
      .addCase(fetchSlidesByRequestId.rejected, (state, action) => {
        state.loadingSlides = false
        state.slidesError = action.payload ?? "Something went wrong"
      })
  },
})

export const {
  setTitle,
  setOutline,
  setGroundingChunks,
  setIsGeneratingOutline,
  setSlides,
  setLoadingSlides,
  setSlidesError,
  setSelectedTemplate,
  setError,
  updateSlide,
} = pptSlice.actions

export default pptSlice.reducer
