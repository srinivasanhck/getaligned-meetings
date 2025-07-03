"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"
import PresentationEditor from "@/slidecomponents/PresentationEditor"
import LoadingSpinner from "@/slidecomponents/LoadingSpinner"
import type { Presentation, Slide, SlideElement, BlockDefinition } from "@/types"
import { presentationService } from "@/services/presentationService"
import { DEFAULT_THEME } from "@/constants"

const PresentationsPage: React.FC = () => {
  const params = useParams()
  const requestId = params.requestId as string

  // Redux state
  const { outline, title } = useAppSelector((state) => state.ppt)

  // Component state
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [progressMessage, setProgressMessage] = useState<string>("")

  const [generationProgress, setGenerationProgress] = useState<{
    current: number
    total: number
  }>({ current: 0, total: 0 })

  const checkExistingSlidesOrGenerate = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setProgressMessage("Checking for existing slides...")

      // First, try to get existing slides
      const existingData = await presentationService.getExistingSlides(requestId)

      if (
        existingData.success &&
        existingData.data?.slide_json?.presentation &&
        existingData.data.slide_json.presentation.length > 0
      ) {
        // Slides already exist, display them
        setProgressMessage("Loading existing slides...")
        const mappedSlides = mapApiSlidesToPresentation(existingData.data.slide_json.presentation)
        setPresentation(mappedSlides)
        setProgressMessage("Slides loaded successfully!")
        setIsLoading(false)
      } else {
        // No slides exist, start real-time generation
        if (!outline || outline.length === 0) {
          throw new Error("No outline data found. Please go back and create an outline first.")
        }

        setIsLoading(false) // Stop initial loading
        await startRealTimeGeneration()
      }
    } catch (error: any) {
      console.error("Error in checkExistingSlidesOrGenerate:", error)

      if (error.message === "SLIDES_NOT_FOUND") {
        // Start real-time generation if slides not found
        if (!outline || outline.length === 0) {
          setError("No outline data found. Please go back and create an outline first.")
          setIsLoading(false)
        } else {
          setIsLoading(false) // Stop initial loading
          await startRealTimeGeneration()
        }
      } else {
        setError(error.message || "Failed to load or generate slides")
        setIsLoading(false)
      }
    }
  }, [outline, requestId, title])

  // Check if slides already exist, otherwise start generation
  useEffect(() => {
    if (!requestId) {
      setError("Invalid request ID")
      setIsLoading(false)
      return
    }

    checkExistingSlidesOrGenerate()
  }, [checkExistingSlidesOrGenerate, requestId])

  const startRealTimeGeneration = async () => {
    try {
      setIsGenerating(true)
      setError(null)
      setGenerationProgress({ current: 0, total: outline.length })

      // Initialize empty presentation to show the editor immediately
      setPresentation([])

      const presentationTopicSummary = title || "Presentation"
      const theme = DEFAULT_THEME
      const generatedSlides: Slide[] = []

      for (let i = 0; i < outline.length; i++) {
        const outlineItem = outline[i]
        const isFirstSlide = i === 0

        setProgressMessage(`Generating slide ${i + 1} of ${outline.length}: ${outlineItem.slideTitle}`)
        setGenerationProgress({ current: i, total: outline.length })

        const slideRequest = {
          contentTopic: outlineItem.contentTopic,
          isFirstSlide,
          presentationTopicSummary,
          slideTitle: outlineItem.slideTitle,
          theme: {
            name: theme.name,
            accentColorPrimary: theme.accentColorPrimary,
            bodyTextColor: theme.bodyTextColor,
            isDarkTheme: theme.isDarkTheme,
            overlayStyle: {
              backgroundColor: theme.overlayStyle?.backgroundColor || "rgba(0, 0, 0, 0.5)",
            },
            subtitleTextColor: theme.subtitleTextColor,
          },
          useSearch: false,
          visualTopic: outlineItem.visualTopic,
        }

        try {
          // This now returns a complete Slide object with elements
          const generatedSlide = await presentationService.generateSlideContent(slideRequest)
          generatedSlides.push(generatedSlide)

          // Add the new slide to presentation immediately (real-time update)
          setPresentation((prevPresentation) => {
            const updatedPresentation = prevPresentation ? [...prevPresentation] : []
            updatedPresentation[i] = generatedSlide
            return updatedPresentation
          })

          // If this is the first slide, set it as current
          if (i === 0) {
            setCurrentSlideIndex(0)
          }
        } catch (slideError: any) {
          console.error(`Error generating slide ${i + 1}:`, slideError)

          // Create a placeholder slide for failed generation
          const placeholderSlide: Slide = {
            id: `slide-error-${i}`,
            elements: [
              {
                id: `error-text-${i}`,
                type: "text",
                content: `Failed to generate slide: ${outlineItem.slideTitle}`,
                x: 5,
                y: 40,
                width: 90,
                height: 20,
                fontSize: 24,
                fontWeight: "normal",
                textAlign: "center",
                color: "#ef4444",
                zIndex: 10,
                locked: false,
                opacity: 1,
                paddingTop: 4,
                paddingRight: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                lineHeight: 1.4,
              } as any,
            ],
            background: {
              type: "color",
              value: "#fef2f2",
            },
            titleForThumbnail: `Error: ${outlineItem.slideTitle}`,
            iconNameForThumbnail: "alertTriangle",
            defaultElementTextColor: "#ef4444",
          }

          generatedSlides.push(placeholderSlide)

          // Add placeholder slide
          setPresentation((prevPresentation) => {
            const updatedPresentation = prevPresentation ? [...prevPresentation] : []
            updatedPresentation[i] = placeholderSlide
            return updatedPresentation
          })
        }
      }

      setGenerationProgress({ current: outline.length, total: outline.length })
      setProgressMessage("All slides generated! Saving presentation...")

      // Save the complete presentation to backend
      await savePresentationToBackend(generatedSlides)

      setProgressMessage("Presentation saved successfully!")

      // Clear progress message after a delay
      setTimeout(() => {
        setProgressMessage("")
      }, 3000)
    } catch (error: any) {
      console.error("Error in real-time generation:", error)
      setError(error.message || "Failed to generate slides")
    } finally {
      setIsGenerating(false)
    }
  }

  const savePresentationToBackend = async (slides: Slide[]) => {
    try {
      setIsSaving(true)
      setSaveStatus({ type: null, message: "" })

      const saveResponse = await presentationService.savePresentation(requestId, slides)

      if (saveResponse.success) {
        console.log("Presentation saved successfully:", saveResponse.message)
        setSaveStatus({
          type: "success",
          message: saveResponse.message || "Presentation saved successfully!",
        })

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: "" })
        }, 3000)
      } else {
        throw new Error("Failed to save presentation")
      }
    } catch (error: any) {
      console.error("Error saving presentation:", error)
      setSaveStatus({
        type: "error",
        message: error.message || "Failed to save presentation. Please try again.",
      })

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: "" })
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Map API slides array to Presentation format (for existing slides)
  const mapApiSlidesToPresentation = (apiSlides: any[]): Presentation => {
    return apiSlides.map((slide, index) => ({
      id: slide.id || `slide-${Date.now()}-${index}`,
      elements: slide.elements || [],
      background: slide.background || {
        type: "color",
        value: "#ffffff",
      },
      titleForThumbnail: slide.titleForThumbnail || `Slide ${index + 1}`,
      iconNameForThumbnail: slide.iconNameForThumbnail || "documentText",
      defaultElementTextColor: slide.defaultElementTextColor || "#000000",
    }))
  }

  const handleSlideUpdate = useCallback((updatedSlide: Slide) => {
    setPresentation((prevPresentation: Presentation | null) => {
      if (!prevPresentation) return [updatedSlide]

      const existingSlideIndex = prevPresentation.findIndex((s: any) => s.id === updatedSlide.id)
      const newPresentation = [...prevPresentation]

      if (existingSlideIndex !== -1) {
        newPresentation[existingSlideIndex] = updatedSlide
      } else {
        newPresentation.push(updatedSlide)
      }
      return newPresentation
    })
  }, [])

  const handleElementUpdate = useCallback((slideId: string, updatedElement: SlideElement) => {
    setPresentation((prevPresentation: Presentation | null) => {
      if (!prevPresentation) return null
      return prevPresentation.map((slide: any) => {
        if (slide.id === slideId) {
          return {
            ...slide,
            elements: slide.elements.map((el: any) => (el.id === updatedElement.id ? updatedElement : el)),
          }
        }
        return slide
      })
    })
  }, [])

  const handleAddElement = useCallback((slideId: string, blockDefinition: BlockDefinition) => {
    setPresentation((prevPresentation: Presentation | null) => {
      if (!prevPresentation) return null
      return prevPresentation.map((slide: any) => {
        if (slide.id === slideId) {
          const newElementId = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          // Center positioning instead of stacking
          const centerX = 5 // 5% from left
          const centerY = 40 // 40% from top (center of slide)

          const baseProps = {
            id: newElementId,
            x: centerX,
            y: centerY,
            width: 90,
            height: 20,
            locked: false,
            zIndex: (slide.elements.length + 1) * 10,
            opacity: 1,
            ...(blockDefinition.defaultProps || {}),
          }

          let newElement: SlideElement

          // Create different text elements based on block definition
          let content = "New Text Block"
          let fontSize = 18
          let fontWeight = "normal"
          let textAlign = "center"
          let height = 20

          // Customize based on block label
          if (blockDefinition.label === "Title") {
            content = "New Title"
            fontSize = 48
            fontWeight = "bold"
            height = 25
          } else if (blockDefinition.label === "Heading 1") {
            content = "New Heading 1"
            fontSize = 36
            fontWeight = "bold"
            height = 22
          } else if (blockDefinition.label === "Heading 2") {
            content = "New Heading 2"
            fontSize = 28
            fontWeight = "bold"
            height = 20
          } else if (blockDefinition.label === "Paragraph") {
            content = "New paragraph text. Click to edit this content."
            fontSize = 16
            fontWeight = "normal"
            textAlign = "left"
            height = 25
          } else if (blockDefinition.label === "Quote") {
            content = '"New quote text. Click to edit this inspiring quote."'
            fontSize = 20
            fontWeight = "italic"
            height = 22
          } else if (blockDefinition.label === "Info Callout") {
            content = "ℹ️ Important information callout. Click to edit."
            fontSize = 16
            fontWeight = "normal"
            textAlign = "left"
            height = 20
          } else if (blockDefinition.label === "Bullet List" || blockDefinition.label === "List") {
            content = "• First bullet point\n• Second bullet point"
            fontSize = 16
            fontWeight = "normal"
            textAlign = "left"
            height = 25
          } else if (blockDefinition.label === "Numbered List") {
            content = "1. First numbered item\n2. Second numbered item"
            fontSize = 16
            fontWeight = "normal"
            textAlign = "left"
            height = 25
          }

          switch (blockDefinition.type) {
            case "text":
              newElement = {
                ...baseProps,
                type: "text",
                content,
                fontSize,
                fontWeight,
                textAlign,
                height,
                color: slide.defaultElementTextColor || "#000000",
                paddingTop: 4,
                paddingRight: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                lineHeight: 1.4,
              } as any
              break

            case "list":
              newElement = {
                ...baseProps,
                type: "text",
                content,
                fontSize,
                fontWeight,
                textAlign,
                height,
                color: slide.defaultElementTextColor || "#000000",
                paddingTop: 4,
                paddingRight: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                lineHeight: 1.6, // Slightly more line height for lists
              } as any
              break

            default:
              newElement = {
                ...baseProps,
                type: "text",
                content: `New ${blockDefinition.label}`,
                fontSize: 18,
                fontWeight: "normal",
                textAlign: "center",
                color: slide.defaultElementTextColor || "#000000",
                paddingTop: 4,
                paddingRight: 4,
                paddingBottom: 4,
                paddingLeft: 4,
                lineHeight: 1.4,
              } as any
          }

          return {
            ...slide,
            elements: [...slide.elements, newElement],
          }
        }
        return slide
      })
    })
  }, [])

  const handleAddSlide = useCallback(() => {
    setPresentation((prevPresentation: Presentation | null) => {
      const pres = prevPresentation || []
      const newSlideId = `slide-${Date.now()}`
      const newSlideNumber = pres.length + 1

      const newSlide: Slide = {
        id: newSlideId,
        elements: [
          {
            id: `${newSlideId}-title`,
            type: "text",
            content: `New Slide ${newSlideNumber}`,
            x: 5,
            y: 30,
            width: 90,
            height: 20,
            fontSize: 40,
            fontWeight: "bold",
            textAlign: "center",
            color: "#000000",
            zIndex: 10,
            locked: false,
            opacity: 1,
            paddingTop: 4,
            paddingRight: 4,
            paddingBottom: 4,
            paddingLeft: 4,
            lineHeight: 1.4,
          } as any,
        ],
        background: {
          type: "color",
          value: "#ffffff",
        },
        titleForThumbnail: `Slide ${newSlideNumber}`,
        iconNameForThumbnail: "documentText",
        defaultElementTextColor: "#000000",
      }

      const newPresentation = [...pres]
      const insertAtIndex = currentSlideIndex + 1
      newPresentation.splice(insertAtIndex, 0, newSlide)

      setCurrentSlideIndex(insertAtIndex)
      return newPresentation
    })
  }, [currentSlideIndex])

  const handleDeleteSlide = useCallback(
    (slideIdToDelete: string) => {
      if (!window.confirm("Are you sure you want to delete this slide? This action cannot be undone.")) {
        return
      }

      setPresentation((prevPresentation) => {
        if (!prevPresentation || prevPresentation.length <= 1) {
          alert("Cannot delete the last remaining slide.")
          return prevPresentation
        }

        const slideToDeleteIndex = prevPresentation.findIndex((s) => s.id === slideIdToDelete)
        if (slideToDeleteIndex === -1) {
          return prevPresentation
        }

        const newPresentation = prevPresentation.filter((s) => s.id !== slideIdToDelete)
        let newCalculatedSlideIndex = currentSlideIndex

        if (slideToDeleteIndex === currentSlideIndex) {
          newCalculatedSlideIndex = Math.max(0, slideToDeleteIndex - 1)
        } else if (slideToDeleteIndex < currentSlideIndex) {
          newCalculatedSlideIndex = currentSlideIndex - 1
        }

        newCalculatedSlideIndex = Math.min(newCalculatedSlideIndex, newPresentation.length - 1)
        newCalculatedSlideIndex = Math.max(0, newCalculatedSlideIndex)

        setCurrentSlideIndex(newCalculatedSlideIndex)
        return newPresentation
      })
    },
    [currentSlideIndex],
  )

  const handleDeleteElement = useCallback((slideId: string, elementId: string) => {
    setPresentation((prevPresentation) => {
      if (!prevPresentation) return null
      return prevPresentation.map((slide) => {
        if (slide.id === slideId) {
          return {
            ...slide,
            elements: slide.elements.filter((el) => el.id !== elementId),
          }
        }
        return slide
      })
    })
  }, [])

  // Updated save handler - this replaces the console.log
  const handleSaveAndShowJson = useCallback(async () => {
    if (!presentation) {
      console.warn("No presentation to save")
      return
    }

    console.log("Saving current presentation state:", JSON.stringify(presentation, null, 2))

    // Save the current edited presentation to backend
    await savePresentationToBackend(presentation)
  }, [presentation, requestId])

  // Loading state (only for initial check)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <LoadingSpinner size="lg" text={progressMessage || "Loading..."} className="text-primary" />
        <p className="mt-4 text-slate-600 text-sm">Please wait while we prepare your presentation.</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Slides Not Found</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={checkExistingSlidesOrGenerate}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main presentation view
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Show progress during generation */}
      {isGenerating && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-center justify-center space-x-3">
            <LoadingSpinner size="sm" text="" className="text-blue-600" />
            <div className="flex flex-col items-center space-y-1">
              <span className="text-blue-800 font-medium">{progressMessage}</span>
              <div className="flex items-center space-x-2">
                <div className="w-48 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(generationProgress.current / generationProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-blue-600 text-sm font-medium">
                  {generationProgress.current}/{generationProgress.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show save status */}
      {(isSaving || saveStatus.type) && (
        <div
          className={`border-b p-3 ${
            saveStatus.type === "success"
              ? "bg-green-50 border-green-200"
              : saveStatus.type === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center justify-center space-x-3">
            {isSaving && <LoadingSpinner size="sm" text="" className="text-blue-600" />}
            {saveStatus.type === "success" && (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {saveStatus.type === "error" && (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span
              className={`font-medium ${
                saveStatus.type === "success"
                  ? "text-green-800"
                  : saveStatus.type === "error"
                    ? "text-red-800"
                    : "text-blue-800"
              }`}
            >
              {isSaving ? "Saving presentation..." : saveStatus.message}
            </span>
          </div>
        </div>
      )}

      {presentation && (
        <PresentationEditor
          presentation={presentation}
          currentSlideIndex={currentSlideIndex}
          onSetCurrentSlideIndex={setCurrentSlideIndex}
          onElementUpdate={handleElementUpdate}
          onSlideUpdate={handleSlideUpdate}
          onAddElement={handleAddElement}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onDeleteElement={handleDeleteElement}
          onSaveAndShowJson={handleSaveAndShowJson}
          onOpenRegenerateModal={() => {}}
          onPresentationUpdate={setPresentation}
        />
      )}
    </div>
  )
}

export default PresentationsPage
