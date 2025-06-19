"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { generatePPTSlides } from "@/lib/api"
import SlideEditor from "./slide-editor"
import SlideGenerationLoader from "./slide-generation-loader"
import ImageGenerationOverlay from "./image-generation-overlay"
import type { Slide } from "@/types/slide"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SlideEditorWrapperProps {
  requestId: string
}

interface ImageGenerationState {
  isGenerating: boolean
  totalImages: number
  generatedImages: number
  failedImages: number
  elapsedTime: number
  pollCount: number // Added poll count to track progress
  canDismiss: boolean
}

export default function SlideEditorWrapper({ requestId }: SlideEditorWrapperProps) {
  const [slides, setSlides] = useState<Slide[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Add a key to force SlideEditor re-render when slides change
  const [slideEditorKey, setSlideEditorKey] = useState(0)

  // Image generation state
  const [imageGenState, setImageGenState] = useState<ImageGenerationState>({
    isGenerating: false,
    totalImages: 0,
    generatedImages: 0,
    failedImages: 0,
    elapsedTime: 0,
    pollCount: 0, // Track poll count for progress indication
    canDismiss: false,
  })

  // Refs for cleanup
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (imageTimerRef.current) {
      clearInterval(imageTimerRef.current)
      imageTimerRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  const countPlaceholderImages = (slides: Slide[]): number => {
    let count = 0
    slides.forEach((slide) => {
      slide.content.forEach((element) => {
        if (element.type === "image" && element.src && element.src.includes("placehold")) {
          count++
        }
      })
    })
    return count
  }

  const countGeneratedImages = (slides: Slide[]): number => {
    let count = 0
    slides.forEach((slide) => {
      slide.content.forEach((element) => {
        if (element.type === "image" && element.src && !element.src.includes("placehold")) {
          count++
        }
      })
    })
    return count
  }

  const startImageGenerationTimer = () => {
    if (imageTimerRef.current) {
      clearInterval(imageTimerRef.current)
    }

    imageTimerRef.current = setInterval(() => {
      if (isMountedRef.current) {
        setImageGenState((prev) => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }))
      }
    }, 1000)
  }

  // Force complete re-render of slides
  const forceSlideUpdate = (newSlides: Slide[]) => {
    console.log("Forcing slide update with new data:", newSlides)

    // Create completely new slide objects with unique timestamps
    const updatedSlides = newSlides.map((slide, slideIndex) => ({
      ...slide,
      slide_id: slide.slide_id,
      background: slide.background,
      content: slide.content.map((element, elementIndex) => ({
        ...element,
        // Add unique timestamp to force re-render
        _updateTimestamp: Date.now() + slideIndex + elementIndex,
      })),
      // Add slide-level timestamp
      _slideUpdateTimestamp: Date.now() + slideIndex,
    }))

    setSlides(updatedSlides)
    // Force SlideEditor to completely re-mount
    setSlideEditorKey((prev) => prev + 1)
  }

  const pollForImages = async (initialSlides: Slide[]) => {
    const totalImages = countPlaceholderImages(initialSlides)

    if (totalImages === 0) {
      console.log("No placeholder images found, skipping image generation polling")
      return
    }

    console.log(`Starting image generation polling for ${totalImages} images`)

    // Initialize image generation state
    setImageGenState({
      isGenerating: true,
      totalImages,
      generatedImages: 0,
      failedImages: 0,
      elapsedTime: 0,
      pollCount: 0, // Start with 0 polls
      canDismiss: false,
    })

    startImageGenerationTimer()

    let currentSlides = [...initialSlides]
    let pollCount = 0
    const maxPolls = 30 // Maximum 4 minutes of polling (30 * 8 seconds)

    const poll = async () => {
      if (!isMountedRef.current) {
        cleanup()
        return
      }

      try {
        pollCount++
        console.log(`Image polling attempt ${pollCount}/${maxPolls}`)

        // Update poll count in state to reflect progress
        setImageGenState((prev) => ({
          ...prev,
          pollCount: pollCount,
        }))

        const response = await generatePPTSlides(requestId)

        if (!isMountedRef.current) return

        if (response.data && response.data.slides) {
          const newSlides = response.data.slides.map((slide) => ({
            slide_id: slide.slide_id,
            background: slide.background,
            content: slide.content.map((element) => {
              if (element.type === "image") return element
              if (!element.type && element.html) return { ...element, type: "text" }
              return element
            }),
          }))

          // Check if images have been generated
          const newGeneratedCount = countGeneratedImages(newSlides)
          const newPlaceholderCount = countPlaceholderImages(newSlides)

          console.log(`Polling result: ${newGeneratedCount} generated, ${newPlaceholderCount} placeholders remaining`)

          // Check if there are actual changes in image URLs
          const hasImageChanges = JSON.stringify(currentSlides) !== JSON.stringify(newSlides)

          if (hasImageChanges) {
            console.log("Image changes detected, updating UI...")
            // Force complete re-render with new data
            forceSlideUpdate(newSlides)
            currentSlides = newSlides
          } else {
            console.log("No image changes detected in this poll")
          }

          // Update image generation state
          setImageGenState((prev) => ({
            ...prev,
            generatedImages: newGeneratedCount,
            failedImages: Math.max(0, totalImages - newGeneratedCount - newPlaceholderCount),
            canDismiss: newPlaceholderCount === 0 || pollCount >= maxPolls,
            pollCount: pollCount, // Update poll count
          }))

          // Check if we're done
          if (newPlaceholderCount === 0) {
            console.log("All images generated successfully!")
            cleanup()

            // Auto-dismiss after 3 seconds if all successful
            setTimeout(() => {
              if (isMountedRef.current) {
                setImageGenState((prev) => ({ ...prev, isGenerating: false }))
              }
            }, 3000)
            return
          }

          // Check if we've reached max polls
          if (pollCount >= maxPolls) {
            console.log("Reached maximum polling attempts")
            setImageGenState((prev) => ({
              ...prev,
              failedImages: newPlaceholderCount,
              canDismiss: true,
            }))
            cleanup()
            return
          }

          // Continue polling after 8 seconds
          pollingIntervalRef.current = setTimeout(poll, 8000)
        } else {
          throw new Error("Invalid response format during image polling")
        }
      } catch (error) {
        console.error("Error during image polling:", error)

        if (!isMountedRef.current) return

        // On error, mark remaining images as failed
        const currentGeneratedCount = countGeneratedImages(currentSlides)
        const remainingImages = totalImages - currentGeneratedCount

        setImageGenState((prev) => ({
          ...prev,
          failedImages: prev.failedImages + remainingImages,
          canDismiss: true,
        }))

        cleanup()
      }
    }

    // Start polling after 8 seconds
    pollingIntervalRef.current = setTimeout(poll, 8000)
  }

  const fetchSlides = async () => {
    setIsLoading(true)
    setError(null)
    cleanup() // Clean up any existing polling

    try {
      console.log(`Fetching slides for request ID: ${requestId}`)

      // Remove the artificial delay - get slides immediately
      const response = await generatePPTSlides(requestId)

      if (!isMountedRef.current) return

      console.log("Slides fetched successfully:", response)

      if (response.data && response.data.slides) {
        // Transform the API response to match our Slide type
        const transformedSlides: any = response.data.slides.map((slide) => ({
          slide_id: slide.slide_id,
          background: slide.background,
          content: slide.content.map((element) => {
            // Ensure all elements have a type, default to 'text' if not image and html exists
            if (element.type === "image") return element
            if (!element.type && element.html) return { ...element, type: "text" }
            return element
          }),
        }))

        setSlides(transformedSlides)
        console.log("Transformed slides:", transformedSlides)

        // Start image generation polling if there are placeholder images
        pollForImages(transformedSlides)
      } else {
        throw new Error("Invalid response format: missing slides data")
      }
    } catch (error) {
      console.error("Failed to fetch slides:", error)
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Failed to fetch slides")
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (requestId) {
      fetchSlides()
    }
  }, [requestId])

  const handleDismissImageOverlay = () => {
    setImageGenState((prev) => ({ ...prev, isGenerating: false }))
  }

  if (isLoading) {
    return <SlideGenerationLoader requestId={requestId} />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Presentation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={fetchSlides} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <div className="text-xs text-gray-500">Request ID: {requestId}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Slides Found</h2>
          <p className="text-gray-600 mb-6">The presentation appears to be empty or not yet ready.</p>
          <Button onClick={fetchSlides} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <SlideEditor
        key={slideEditorKey} // Force re-mount when key changes
        initialSlides={slides}
        requestId={requestId}
      />

      {/* Image Generation Overlay */}
      <ImageGenerationOverlay
        isVisible={imageGenState.isGenerating}
        onDismiss={handleDismissImageOverlay}
        totalImages={imageGenState.totalImages}
        generatedImages={imageGenState.generatedImages}
        failedImages={imageGenState.failedImages}
        elapsedTime={imageGenState.elapsedTime}
        pollCount={imageGenState.pollCount} // Pass poll count to overlay
        canDismiss={imageGenState.canDismiss}
      />
    </>
  )
}
