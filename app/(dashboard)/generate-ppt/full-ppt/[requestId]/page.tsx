"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SlideViewer } from "@/components/ppt/SlideViewer"
import { fetchSlidesByRequestId, type Slide } from "@/lib/redux/features/pptSlice"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"

export default function FullPPTPage({ params }: { params: Promise<{ requestId: string }> }) {
 const { requestId } = use(params)
 console.log("Request ID:", requestId)
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
  dispatch(fetchSlidesByRequestId(requestId)); 
}, [requestId]);

const { slides, loadingSlides, slidesError } = useAppSelector((s) => s.ppt);
console.log("Slides:", slides);
console.log("Loading Slides:", loadingSlides);
  console.log("Slides Error:", slidesError);

  const handleGoBack = () => {
    router.push("/generate-ppt")
  }

  const handleEditSlides = () => {
    router.push(`/edit-slides/${requestId}`)
  }

  const handleDownload = () => {
    // In a real implementation, this would trigger a download
    alert("Download functionality will be implemented here")
  }

  if (loadingSlides) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading presentation...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (slidesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </button>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{slidesError}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </button>
          <Button onClick={handleDownload} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>

        <div className="space-y-8">
          {slides?.map((slide, index) => (
            <div key={slide.slide_id || index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-medium text-gray-700">
                  Slide {index + 1} of {slides.length}
                </h2>
              </div>
              <div className="aspect-[16/9]">
                <SlideViewer slide={slide} theme="light" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 mb-4">
          <Button onClick={handleEditSlides} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
            <Edit className="h-4 w-4" />
            Edit Slides
          </Button>
        </div>
      </div>
    </div>
  )
}

