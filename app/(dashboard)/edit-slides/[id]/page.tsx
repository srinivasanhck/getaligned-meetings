"use client"

import { use, useEffect, useState } from "react"
import { ArrowLeft, Save, Download, Type, ImageIcon, Table, Square, Layout } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchSlidesByRequestId } from "@/lib/redux/features/pptSlice"
import { updateSlide } from "@/lib/redux/features/pptSlice"
import { Button } from "@/components/ui/button"
import { SlideViewer } from "@/components/ppt/SlideViewer"
import type { Slide } from "@/lib/redux/features/pptSlice"
import EditableSlide from "@/components/ppt/editor/EditableSlide"


  export default function EditSlidesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const dispatch = useAppDispatch()

  /* ---------- Redux state -------------------- */
  const { slides, loadingSlides, slidesError } = useAppSelector((s) => s.ppt)

  /* ---------- Local UI state ----------------- */
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const currentSlide = slides[currentSlideIndex]

  /* ---------- Fetch (if direct-link load) ---- */
  useEffect(() => {
    if (slides.length === 0) {
      dispatch(fetchSlidesByRequestId(id))
    }
  }, [id])

  /* ---------- Navigation helpers ------------- */
  const handleGoBack = () => {
    router.push(`/generate-ppt/full-ppt/${id}`)
  }

  /* ---------- Save (PUT) --------------------- */
  const handleSave = async () => {
    try {
      // TODO: call backend saveDeck thunk – stub for now
      console.log("Saving slides:", slides)
      alert("Changes saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save changes – see console")
    }
  }

  /* ---------- Slide edits arrive from <EditableSlide> -------- */
  const handleSlideUpdate = (updated: Slide) => {
    dispatch(updateSlide({ slideId: updated.slide_id, updatedSlide: updated }))
  }

  /* ---------- Render guards  ----------------- */
  if (loadingSlides) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading slides for editing…
      </div>
    )
  }
  if (slidesError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        {slidesError}
      </div>
    )
  }
  if (!currentSlide) return null

  /* ------------------------------------------------------------ */
  /*  JSX                                                         */
  /* ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleGoBack} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-medium truncate max-w-md">
            {slides[0]?.content.find((c) => c.type === "heading")?.text ?? "Presentation"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} className="flex items-center gap-1">
            <Save className="h-4 w-4" /> <span className="hidden sm:inline">Save</span>
          </Button>
          <Button onClick={() => alert("Download…")} className="flex gap-1 bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4" /> <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Main area + sidebar */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* editor canvas */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="w-[1024px] aspect-[16/9] bg-white rounded-lg shadow-lg mx-auto">
              <EditableSlide slide={currentSlide} onUpdate={handleSlideUpdate} />
            </div>
          </div>
        </div>

        {/* right sidebar – buttons still non-functional */}
                {/* Right Sidebar */}
        <div className="w-16 md:w-20 bg-white border-l border-gray-200 flex flex-col items-center py-4">
          <div className="flex flex-col items-center gap-6">
            <button className="flex flex-col items-center text-gray-700 hover:text-purple-600">
              <Type className="h-6 w-6" />
              <span className="text-xs mt-1">Text</span>
            </button>
            <button className="flex flex-col items-center text-gray-700 hover:text-purple-600">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Image</span>
            </button>
            <button className="flex flex-col items-center text-gray-700 hover:text-purple-600">
              <Square className="h-6 w-6" />
              <span className="text-xs mt-1">Shape</span>
            </button>
            <button className="flex flex-col items-center text-gray-700 hover:text-purple-600">
              <Table className="h-6 w-6" />
              <span className="text-xs mt-1">Table</span>
            </button>
            <button className="flex flex-col items-center text-gray-700 hover:text-purple-600">
              <Layout className="h-6 w-6" />
              <span className="text-xs mt-1">Layout</span>
            </button>
          </div>
        </div>
      </div>

      {/* bottom film-strip */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max px-2">
          {slides.map((slide, idx) => (
            <div
              key={slide.slide_id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`relative cursor-pointer group ${
                idx === currentSlideIndex ? "ring-2 ring-purple-500" : "hover:ring-2 hover:ring-gray-300"
              }`}
            >
              <div className="w-24 h-14 overflow-hidden rounded">
                <div className="transform scale-[0.15] origin-top-left w-[160px] h-[90px]">
                  <div className="w-[640px] h-[360px]">
                    <SlideViewer slide={slide} theme="light" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



