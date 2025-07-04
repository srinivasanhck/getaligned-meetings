"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"
import PresentationEditor from "@/slidecomponents/PresentationEditor"
import LoadingSpinner from "@/slidecomponents/LoadingSpinner"
import UndoRedoToolbar from "@/components/ui/UndoRedoToolbar"
import type { Presentation, Slide, SlideElement, BlockDefinition, ImageElementProps, VideoElementProps } from "@/types"
import { presentationService } from "@/services/presentationService"
import { DEFAULT_THEME } from "@/constants"
import { useUndoRedo, type HistoryAction } from "@/hooks/useUndoRedo"

const PresentationsPage: React.FC = () => {
  const params = useParams()
  const requestId = params.requestId as string

  // Redux state
  const { outline, title } = useAppSelector((state) => state.ppt)

  // Component state
  const [presentation, setPresentation] = useState<Slide[] | null>(null)
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

  // Initialize undo/redo system
  const {
    canUndo,
    canRedo,
    currentAction,
    historySize,
    executeAction,
    undo,
    redo,
    clearHistory,
    startGroup,
    endGroup
  } = useUndoRedo(presentation || [], {
    maxHistorySize: 50,
    groupingTimeWindow: 1500 // 1.5 seconds for better text editing grouping
  })

  // Clear history when presentation changes significantly (like loading new slides)
  useEffect(() => {
    if (presentation && presentation.length > 0) {
      clearHistory()
    }
  }, [requestId, clearHistory]) // Only clear when the requestId changes (new presentation)

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    const previousState = undo()
    if (previousState) {
      setPresentation(previousState)
    }
  }, [undo])

  const handleRedo = useCallback(() => {
    const nextState = redo()
    if (nextState) {
      setPresentation(nextState)
    }
  }, [redo])

  // Helper function to create action and update state
  const createAction = useCallback((
    type: HistoryAction['type'],
    description: string,
    newState: Slide[],
    metadata?: Record<string, any>
  ) => {
    const action: HistoryAction = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      timestamp: Date.now(),
      ...metadata
    }
    
    executeAction(action, newState)
    setPresentation(newState)
  }, [executeAction])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field or content editable element
      const target = event.target as HTMLElement
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true'
      
      // Only handle shortcuts if not in input fields
      if (!isInputField && (event.ctrlKey || event.metaKey)) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          handleUndo()
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault()
          handleRedo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

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

      // Save the generated slides to backend
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

  const savePresentationToBackend = async (slides: Slide[], showNotification: boolean = true) => {
    try {
      setIsSaving(true)
      if (showNotification) {
        setSaveStatus({ type: null, message: "" })
      }

      const saveResponse = await presentationService.savePresentation(requestId, slides as any)

      if (saveResponse.success) {
        console.log("Presentation saved successfully:", saveResponse.message)
        
        if (showNotification) {
          setSaveStatus({
            type: "success",
            message: saveResponse.message || "Presentation saved successfully!",
          })

          // Clear success message after 3 seconds
          setTimeout(() => {
            setSaveStatus({ type: null, message: "" })
          }, 3000)
        }
      } else {
        throw new Error(saveResponse.message || "Failed to save presentation")
      }
    } catch (error: any) {
      console.error("Error saving presentation:", error)
      
      if (showNotification) {
        setSaveStatus({
          type: "error",
          message: error.message || "Failed to save presentation. Please try again.",
        })

        // Clear error message after 5 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: "" })
        }, 5000)
      }
      
      // Always throw the error so that PresentationEditor can catch it
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Map API slides array to Slide[] format (for existing slides)
  const mapApiSlidesToPresentation = (apiSlides: any[]): Slide[] => {
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
    if (!presentation) return
    
    const newPresentation = [...presentation]
    const existingSlideIndex = newPresentation.findIndex((s: any) => s.id === updatedSlide.id)
    
    if (existingSlideIndex !== -1) {
      newPresentation[existingSlideIndex] = updatedSlide
    } else {
      newPresentation.push(updatedSlide)
    }
    
    createAction('slide_update', `slide "${updatedSlide.titleForThumbnail || 'Untitled'}"`, newPresentation, {
      slideId: updatedSlide.id
    })
  }, [presentation, createAction])

  const handleElementUpdate = useCallback((slideId: string, updatedElement: SlideElement) => {
    if (!presentation) return
    
    const newPresentation = presentation.map((slide: any) => {
      if (slide.id === slideId) {
        return {
          ...slide,
          elements: slide.elements.map((el: any) => (el.id === updatedElement.id ? updatedElement : el)),
        }
      }
      return slide
    })
    
    // Check if this is a text edit for better grouping
    const isTextEdit = updatedElement.type === 'text' && 'content' in updatedElement
    
    if (isTextEdit) {
      const content = (updatedElement as any).content || 'text'
      const shortContent = content.substring(0, 30).replace(/\n/g, ' ')
      
      createAction('element_update', `Edit: "${shortContent}${content.length > 30 ? '...' : ''}"`, newPresentation, {
        slideId,
        elementId: updatedElement.id,
        isTextEdit: true
      })
    } else {
      createAction('element_update', `Update ${updatedElement.type}`, newPresentation, {
        slideId,
        elementId: updatedElement.id
      })
    }
  }, [presentation, createAction])

  const handleAddElement = useCallback((slideId: string, blockDefinition: BlockDefinition) => {
    if (!presentation) return
    
    const newPresentation = presentation.map((slide: any) => {
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

          case "image":
            newElement = {
              ...baseProps,
              type: "image",
              src: (blockDefinition.defaultProps as any)?.src || "https://via.placeholder.com/400x300.png?text=Image",
              alt: (blockDefinition.defaultProps as any)?.alt || "Image",
              objectFit: (blockDefinition.defaultProps as any)?.objectFit || "contain",
              width: blockDefinition.defaultProps?.width || 50,
              height: blockDefinition.defaultProps?.height || 37.5,
            } as ImageElementProps
            break

          case "video":
            newElement = {
              ...baseProps,
              type: "video",
              src: (blockDefinition.defaultProps as any)?.src || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              videoType: (blockDefinition.defaultProps as any)?.videoType || "youtube",
              controls: (blockDefinition.defaultProps as any)?.controls !== false,
              width: blockDefinition.defaultProps?.width || 60,
              height: blockDefinition.defaultProps?.height || 33.75,
            } as VideoElementProps
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
    
    createAction('element_add', `${blockDefinition.label || blockDefinition.type}`, newPresentation, {
      slideId,
      elementType: blockDefinition.type
    })
  }, [presentation, createAction])

  // Fixed handleAddSlide - insert after current slide with correct numbering
  const handleAddSlide = useCallback(() => {
    if (!presentation) return
    
    const pres = presentation
    const newSlideId = `slide-${Date.now()}`
    const insertAtIndex = currentSlideIndex + 1
    const newSlideNumber = insertAtIndex + 1 // This will be the correct slide number

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
    newPresentation.splice(insertAtIndex, 0, newSlide)

    setCurrentSlideIndex(insertAtIndex)
    
    createAction('slide_add', `slide ${newSlideNumber}`, newPresentation, {
      slideId: newSlideId,
      insertIndex: insertAtIndex
    })
  }, [presentation, currentSlideIndex, createAction])

  const handleDeleteSlide = useCallback(
    (slideIdToDelete: string) => {
      if (!presentation || presentation.length <= 1) {
        alert("Cannot delete the last remaining slide.")
        return
      }

      const slideToDeleteIndex = presentation.findIndex((s) => s.id === slideIdToDelete)
      if (slideToDeleteIndex === -1) {
        return
      }

      const slideToDelete = presentation[slideToDeleteIndex]
      const newPresentation = presentation.filter((s) => s.id !== slideIdToDelete)
      let newCalculatedSlideIndex = currentSlideIndex

      if (slideToDeleteIndex === currentSlideIndex) {
        newCalculatedSlideIndex = Math.max(0, slideToDeleteIndex - 1)
      } else if (slideToDeleteIndex < currentSlideIndex) {
        newCalculatedSlideIndex = currentSlideIndex - 1
      }

      newCalculatedSlideIndex = Math.min(newCalculatedSlideIndex, newPresentation.length - 1)
      newCalculatedSlideIndex = Math.max(0, newCalculatedSlideIndex)

      setCurrentSlideIndex(newCalculatedSlideIndex)
      
      createAction('slide_delete', `slide "${slideToDelete.titleForThumbnail || 'Untitled'}"`, newPresentation, {
        slideId: slideIdToDelete,
        deleteIndex: slideToDeleteIndex
      })
    },
    [presentation, currentSlideIndex, createAction],
  )

  const handleDeleteElement = useCallback((slideId: string, elementId: string) => {
    if (!presentation) return
    
    const newPresentation = presentation.map((slide) => {
      if (slide.id === slideId) {
        const elementToDelete = slide.elements.find(el => el.id === elementId)
        return {
          ...slide,
          elements: slide.elements.filter((el) => el.id !== elementId),
        }
      }
      return slide
    })
    
    createAction('element_delete', `element`, newPresentation, {
      slideId,
      elementId
    })
  }, [presentation, createAction])

  // New function to handle slide reordering
  const handleSlideReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (!presentation) return

      const newPresentation = [...presentation]
      const [movedSlide] = newPresentation.splice(fromIndex, 1)
      newPresentation.splice(toIndex, 0, movedSlide)

      // Update current slide index if needed
      if (fromIndex === currentSlideIndex) {
        setCurrentSlideIndex(toIndex)
      } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }

      createAction('slide_reorder', `slides ${fromIndex + 1} to ${toIndex + 1}`, newPresentation, {
        fromIndex,
        toIndex
      })
    },
    [presentation, currentSlideIndex, createAction],
  )

  // Updated save handler - this replaces the console.log
  const handleSaveAndShowJson = useCallback(async () => {
    if (!presentation) {
      console.warn("No presentation to save")
      return
    }

    console.log("Saving current presentation state:", JSON.stringify(presentation, null, 2))

    // Save just the slides array to backend (the service expects slides, not full Presentation object)
    // Don't show the top notification since PresentationEditor has its own overlay and toast
    await savePresentationToBackend(presentation, false)
  }, [presentation])

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
          onSlideReorder={handleSlideReorder}
          // Undo/Redo props
          canUndo={canUndo}
          canRedo={canRedo}
          currentAction={currentAction}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      )}
    </div>
  )
}

export default PresentationsPage
