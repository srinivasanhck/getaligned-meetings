"use client"

import { useState, useEffect } from "react"
import { ImageIcon, Sparkles, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGenerationOverlayProps {
  isVisible: boolean
  onDismiss: () => void
  totalImages: number
  generatedImages: number
  failedImages: number
  elapsedTime: number
  pollCount?: number // New prop to track polling attempts
  canDismiss?: boolean
}

export default function ImageGenerationOverlay({
  isVisible,
  onDismiss,
  totalImages,
  generatedImages,
  failedImages,
  elapsedTime,
  pollCount = 0, // Default to 0
  canDismiss = true,
}: ImageGenerationOverlayProps) {
  const [progress, setProgress] = useState(0)

  // Calculate progress based on poll count and actual generated images
  useEffect(() => {
    // If we have actual generated images, use that for progress calculation
    if (generatedImages > 0) {
      const actualProgress = (generatedImages / totalImages) * 100

      // Ensure progress never goes backwards
      setProgress((prev) => Math.max(prev, actualProgress))
      return
    }

    // Otherwise, use poll count to simulate progress
    // This gives visual feedback even when no images are generated yet
    if (pollCount > 0) {
      // Map poll count to progress percentage
      // First poll: 10%, second: 22%, third: 40%, fourth: 60%, fifth: 75%, sixth: 90%
      const progressMap: Record<number, number> = {
        1: 10,
        2: 22,
        3: 40,
        4: 60,
        5: 75,
        6: 90,
      }

      // Get progress based on poll count or cap at 90% if poll count is high
      const simulatedProgress = progressMap[pollCount] || Math.min(90, pollCount * 15)

      // Ensure progress never goes backwards
      setProgress((prev) => Math.max(prev, simulatedProgress))
    }
  }, [generatedImages, totalImages, pollCount])

  // Set to 100% when complete
  useEffect(() => {
    const isComplete = generatedImages + failedImages >= totalImages
    if (isComplete) {
      setProgress(100)
    }
  }, [generatedImages, failedImages, totalImages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isComplete = generatedImages + failedImages >= totalImages
  const hasErrors = failedImages > 0

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
              {isComplete ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <ImageIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isComplete ? "Image Generation Complete" : "Generating AI Images"}
              </h2>
              <p className="text-sm text-gray-500">
                {isComplete
                  ? `${generatedImages} of ${totalImages} images generated`
                  : "Creating beautiful visuals for your slides"}
              </p>
            </div>
          </div>
          {canDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Section */}
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isComplete
                    ? hasErrors
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
                style={{ width: `${progress}%` }}
              >
                {!isComplete && <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>}
              </div>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Generated</p>
                  <p className="font-semibold text-gray-900">{generatedImages}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Elapsed Time</p>
                  <p className="font-semibold text-gray-900">{formatTime(elapsedTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {hasErrors && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Some Images Failed</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {failedImages} image{failedImages > 1 ? "s" : ""} couldn't be generated. Placeholder images will
                    remain in place.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status - Removed the "Processing X of Y" text */}
          {!isComplete && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-purple-50 rounded-full">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent mr-2"></div>
                <span className="text-sm text-purple-700 font-medium">Processing images...</span>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="text-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full ${
                  hasErrors ? "bg-yellow-50" : "bg-green-50"
                }`}
              >
                {hasErrors ? (
                  <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                )}
                <span className={`text-sm font-medium ${hasErrors ? "text-yellow-700" : "text-green-700"}`}>
                  {hasErrors ? "Completed with some issues" : "All images generated successfully!"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Button onClick={onDismiss} className="w-full">
              Continue Editing
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
