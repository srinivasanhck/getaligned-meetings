"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Play, Trash2, Plus, GripVertical, Loader2, Palette, AlertTriangle, RefreshCw } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { setOutline, setTitle, setError, setSelectedTemplate } from "@/lib/redux/features/pptSlice"
import { useContentEditable } from "@/hooks/useContentEditable"
import { pptService } from "@/services/pptService"
import { SlideViewer } from "@/components/ppt/SlideViewer"
import { TemplateSelectionPopup } from "@/components/ppt/TemplateSelectionPopup"

interface OutlinePoint {
  id: string
  text: string
}

interface OutlineSlide {
  id: string
  title: string
  points: OutlinePoint[] // Changed from string[] to OutlinePoint[]
}

// Editable component with cursor position preservation
function EditableContent({
  value,
  onChange,
  onBlur,
  onKeyDown,
  className,
  autoFocus = false,
  selectAllOnFocus = false,
  editorRef,
}: {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  autoFocus?: boolean
  selectAllOnFocus?: boolean
  editorRef?: React.RefObject<HTMLDivElement>
}) {
  const { ref, handleInput, handleBlur, handleKeyDown } = useContentEditable(value, onChange, onBlur, onKeyDown)

  // Combine refs if an external ref is provided
  const combinedRef = useCallback(
    (node: HTMLDivElement) => {
      if (ref.current !== node) {
        ref.current = node
      }
      if (editorRef && editorRef.current !== node) {
        editorRef.current = node
      }
    },
    [ref, editorRef],
  )

  // Auto-focus if needed
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()

      if (selectAllOnFocus) {
        // Select all text
        const range = document.createRange()
        range.selectNodeContents(ref.current)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } else {
        // Place cursor at the end of the text
        const range = document.createRange()
        const selection = window.getSelection()

        if (ref.current.childNodes.length > 0) {
          const lastNode = ref.current.childNodes[ref.current.childNodes.length - 1]
          range.setStartAfter(lastNode)
        } else {
          range.setStart(ref.current, 0)
        }

        range.collapse(true)

        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    }
  }, [autoFocus, selectAllOnFocus])

  return (
    <div
      ref={combinedRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none ${className || ""}`}
    />
  )
}

// Sortable slide card component
function SortableSlideCard({
  slide,
  index,
  handleSlideTitleChange,
  handleSlideTitleBlur,
  handleSlideTitleKeyDown,
  handlePointChange,
  handlePointBlur,
  handlePointKeyDown,
  handleDeleteSlide,
  handleAddPoint,
  handleDeletePoint,
  newPointIndex,
}: {
  slide: OutlineSlide
  index: number
  handleSlideTitleChange: (slideId: string, newTitle: string) => void
  handleSlideTitleBlur: (slideId: string) => void
  handleSlideTitleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, slideId: string) => void
  handlePointChange: (slideId: string, pointId: string, newText: string) => void
  handlePointBlur: (slideId: string, pointId: string) => void
  handlePointKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, slideId: string, pointId: string) => void
  handleDeleteSlide: (slideId: string) => void
  handleAddPoint: (slideId: string) => void
  handleDeletePoint: (slideId: string, pointId: string) => void
  newPointIndex: { slideId: string; pointId: string } | null
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  // Custom keydown handler for points to handle deletion of empty points
  const handlePointKeyDownWithDelete = (e: React.KeyboardEvent<HTMLDivElement>, slideId: string, pointId: string) => {
    // If content is empty and user presses Backspace or Delete, delete the point
    if ((e.key === "Backspace" || e.key === "Delete") && (e.currentTarget.textContent || "").trim() === "") {
      e.preventDefault()
      console.log(`Empty point detected with ID ${pointId}, deleting...`)
      handleDeletePoint(slideId, pointId)
      return
    }

    // Otherwise, call the regular keydown handler
    handlePointKeyDown(e, slideId, pointId)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 shadow-sm overflow-hidden relative group bg-white"
      data-card-id={slide.id}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 flex items-center px-2 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <button
        onClick={() => handleDeleteSlide(slide.id)}
        className="absolute right-2 top-2 p-1 rounded-full bg-white/80 text-gray-500 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete slide"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 pl-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-medium">
            {index + 1}
          </div>

          <EditableContent
            value={slide.title}
            onChange={(value) => handleSlideTitleChange(slide.id, value)}
            onBlur={() => handleSlideTitleBlur(slide.id)}
            onKeyDown={(e) => handleSlideTitleKeyDown(e, slide.id)}
            className="text-lg font-medium text-gray-800 px-2 py-1 rounded-md"
          />
        </div>
      </div>

      <div className="px-6 py-4 pl-10 bg-white">
        <ul className="list-disc pl-5 space-y-3">
          {slide.points.map((point) => (
            <li key={point.id}>
              <EditableContent
                value={point.text}
                onChange={(value) => handlePointChange(slide.id, point.id, value)}
                onBlur={() => handlePointBlur(slide.id, point.id)}
                onKeyDown={(e) => handlePointKeyDownWithDelete(e, slide.id, point.id)}
                className="text-gray-700 px-2 py-1 rounded-md"
                autoFocus={
                  newPointIndex !== null && newPointIndex.slideId === slide.id && newPointIndex.pointId === point.id
                }
                selectAllOnFocus={
                  newPointIndex !== null && newPointIndex.slideId === slide.id && newPointIndex.pointId === point.id
                }
              />
            </li>
          ))}
        </ul>

        <button
          onClick={() => handleAddPoint(slide.id)}
          className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1 mt-4"
        >
          <Plus className="h-3 w-3" /> Add point
        </button>
      </div>
    </div>
  )
}

// Card component for the drag overlay
function SlideCard({
  slide,
  index,
}: {
  slide: OutlineSlide
  index: number
}) {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden relative bg-white">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 pl-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-medium">
            {index + 1}
          </div>
          <div className="text-lg font-medium text-gray-800">{slide.title}</div>
        </div>
      </div>

      <div className="px-6 py-4 pl-10 bg-white">
        <ul className="list-disc pl-5 space-y-3">
          {slide.points.map((point) => (
            <li key={`overlay-${point.id}`}>
              <div className="text-gray-700">{point.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function OutlinePage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const id = params.id as string

  // Get data from Redux store
  const {
    title: storeTitle,
    outline: storeOutline,
    isGeneratingOutline,
    selectedTemplate,
    isGeneratingSlides,
    slides,
    error: storeError,
  } = useAppSelector((state) => state.ppt)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setLocalError] = useState<string | null>(null)
  const [title, setLocalTitle] = useState("")
  const [outline, setLocalOutline] = useState<OutlineSlide[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newPointIndex, setNewPointIndex] = useState<{ slideId: string; pointId: string } | null>(null)
  const [isTemplatePopupOpen, setIsTemplatePopupOpen] = useState(false)
  const [showSlidesPreview, setShowSlidesPreview] = useState(false)
  const [isInitiatingSlides, setIsInitiatingSlides] = useState(false)

  // Flag to prevent Redux updates from overriding local state
  const isLocalUpdate = useRef(false)

  // Refs for deferred actions
  const deferredActions = useRef<(() => void)[]>([])

  // Function to schedule a deferred action
  const scheduleAction = useCallback((action: () => void) => {
    deferredActions.current.push(action)

    // Execute all deferred actions in the next tick
    if (deferredActions.current.length === 1) {
      setTimeout(() => {
        const actions = [...deferredActions.current]
        deferredActions.current = []
        actions.forEach((action) => action())
      }, 0)
    }
  }, [])

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Convert string[] points to OutlinePoint[] for compatibility with Redux store
  const convertToOutlinePoints = useCallback((slides: any[]): OutlineSlide[] => {
    return slides.map((slide) => ({
      ...slide,
      id: slide.id.toString(),
      points: Array.isArray(slide.points)
        ? slide.points.map((point: string | OutlinePoint, index: number) => {
            // If it's already an OutlinePoint object
            if (typeof point === "object" && point.id && point.text) {
              return point
            }
            // If it's a string, convert to OutlinePoint
            return {
              id: `${slide.id}-point-${index}-${Date.now()}`,
              text: typeof point === "string" ? point : String(point),
            }
          })
        : [],
    }))
  }, [])

  // Convert OutlinePoint[] back to string[] for Redux store
  const convertToStringPoints = useCallback((slides: OutlineSlide[]): any[] => {
    return slides.map((slide) => ({
      ...slide,
      points: slide.points.map((point) => point.text),
    }))
  }, [])

  // Initial data load from Redux
  useEffect(() => {
    // Skip if we're in the middle of a local update
    if (isLocalUpdate.current) {
      return
    }

    // If we have the data in Redux store, use it
    if (storeTitle && storeOutline && storeOutline.length > 0) {
      setLocalTitle(storeTitle)
      setLocalOutline(convertToOutlinePoints(storeOutline))
      setIsLoading(false)
      return
    }

    // If we're still generating the outline, show loading
    if (isGeneratingOutline) {
      setIsLoading(true)
      return
    }

    // If we don't have the data and we're not generating it, show error
    if (!isGeneratingOutline && (!storeTitle || !storeOutline || storeOutline.length === 0)) {
      setLocalError("Outline data not found. Please generate a new outline.")
      setIsLoading(false)
    }
  }, [storeTitle, storeOutline, isGeneratingOutline, convertToOutlinePoints])

  const handleGoBack = () => {
    router.push("/generate-ppt")
  }

  const handleGenerateSlides = async () => {
    // Save changes to Redux before generating slides
    isLocalUpdate.current = true
    dispatch(setTitle(title))
    dispatch(setOutline(convertToStringPoints(outline)))

    // Set initiating state
    setIsInitiatingSlides(true)
    setLocalError(null)

    try {
      // Create the request object
      const request = {
        title,
        theme: selectedTemplate || "light",
        outline: convertToStringPoints(outline),
      }

      console.log("Initiating slide generation with request:", request)

      // Make the POST request to get the request_id
      const response = await pptService.initiateSlideGeneration(request)

      if (!response.request_id) {
        throw new Error("No request_id received from server")
      }

      console.log("Received request_id:", response.request_id)

      // Redirect to the full-ppt page with the request_id
      // router.push(`/generate-ppt/full-ppt/${response.request_id}`)
      router.push(`/generate-ppt/entire-ppt/${response.request_id}`)
    } catch (error: any) {
      console.error("Error initiating slide generation:", error)
      setLocalError(error.message || "Failed to initiate slide generation")
    } finally {
      setIsInitiatingSlides(false)
      isLocalUpdate.current = false
    }
  }

  const handleRetryGeneration = () => {
    // Clear any existing error
    dispatch(setError(null))

    // Try generating slides again
    handleGenerateSlides()
  }

  const handleSaveOutline = useCallback(() => {
    // Set flag to prevent Redux update from overriding local state
    isLocalUpdate.current = true

    // Save changes to Redux
    dispatch(setTitle(title))
    dispatch(setOutline(convertToStringPoints(outline)))

    // Reset flag after a short delay to allow Redux to update
    setTimeout(() => {
      isLocalUpdate.current = false
    }, 100)
  }, [dispatch, title, outline, convertToStringPoints])

  const handleTitleChange = useCallback((newTitle: string) => {
    setLocalTitle(newTitle)
  }, [])

  const handleTitleBlur = useCallback(() => {
    handleSaveOutline()
  }, [handleSaveOutline])

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveOutline()
      }
    },
    [handleSaveOutline],
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setLocalOutline((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newOutline = arrayMove(items, oldIndex, newIndex)

        // Schedule Redux update for next tick to avoid render phase updates
        scheduleAction(() => {
          isLocalUpdate.current = true
          dispatch(setOutline(convertToStringPoints(newOutline)))
          setTimeout(() => {
            isLocalUpdate.current = false
          }, 100)
        })

        return newOutline
      })
    }

    setActiveId(null)
  }

  const handleSlideTitleChange = useCallback((slideId: string, newTitle: string) => {
    setLocalOutline((prev) => prev.map((slide) => (slide.id === slideId ? { ...slide, title: newTitle } : slide)))
  }, [])

  const handleSlideTitleBlur = useCallback(
    (slideId: string) => {
      handleSaveOutline()
    },
    [handleSaveOutline],
  )

  const handleSlideTitleKeyDown = useCallback(
    (e: React.KeyboardEvent, slideId: string) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveOutline()
      }
    },
    [handleSaveOutline],
  )

  const handlePointChange = useCallback((slideId: string, pointId: string, newText: string) => {
    setLocalOutline((prev) =>
      prev.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              points: slide.points.map((point) => (point.id === pointId ? { ...point, text: newText } : point)),
            }
          : slide,
      ),
    )
  }, [])

  const handlePointBlur = useCallback(
    (slideId: string, pointId: string) => {
      handleSaveOutline()
      // Clear the new point index after blur
      if (newPointIndex && newPointIndex.slideId === slideId && newPointIndex.pointId === pointId) {
        setNewPointIndex(null)
      }
    },
    [handleSaveOutline, newPointIndex],
  )

  const handlePointKeyDown = useCallback(
    (e: React.KeyboardEvent, slideId: string, pointId: string) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveOutline()
      }
    },
    [handleSaveOutline],
  )

  const handleDeletePoint = useCallback(
    (slideId: string, pointId: string) => {
      console.log(`Deleting point with ID ${pointId} from slide ${slideId}`)

      // Update local state first
      setLocalOutline((prev) => {
        // Find the slide we need to update
        const slideIndex = prev.findIndex((s) => s.id === slideId)

        if (slideIndex === -1) return prev // Slide not found

        const slide = prev[slideIndex]

        // Don't delete if it's the only point in the slide
        if (slide.points.length <= 1) {
          const updatedSlide = {
            ...slide,
            points: [{ id: `${slide.id}-point-0-${Date.now()}`, text: "Add your point here" }],
          }

          const updatedOutline = [...prev]
          updatedOutline[slideIndex] = updatedSlide

          // Schedule Redux update
          scheduleAction(() => {
            isLocalUpdate.current = true
            dispatch(setOutline(convertToStringPoints(updatedOutline)))
            setTimeout(() => {
              isLocalUpdate.current = false
            }, 100)
          })

          return updatedOutline
        }

        // Remove the specific point by ID
        const updatedPoints = slide.points.filter((point) => point.id !== pointId)
        const updatedSlide = { ...slide, points: updatedPoints }

        const updatedOutline = [...prev]
        updatedOutline[slideIndex] = updatedSlide

        // Schedule Redux update
        scheduleAction(() => {
          isLocalUpdate.current = true
          dispatch(setOutline(convertToStringPoints(updatedOutline)))
          setTimeout(() => {
            isLocalUpdate.current = false
          }, 100)
        })

        return updatedOutline
      })
    },
    [dispatch, scheduleAction, convertToStringPoints],
  )

  const handleDeleteSlide = useCallback(
    (slideId: string) => {
      // Update local state first
      setLocalOutline((prev) => {
        const newOutline = prev.filter((slide) => slide.id !== slideId)

        // Schedule Redux update for next tick to avoid render phase updates
        scheduleAction(() => {
          isLocalUpdate.current = true
          dispatch(setOutline(convertToStringPoints(newOutline)))
          setTimeout(() => {
            isLocalUpdate.current = false
          }, 100)
        })

        return newOutline
      })
    },
    [dispatch, scheduleAction, convertToStringPoints],
  )

  const handleAddSlide = useCallback(() => {
    const slideId = Date.now().toString()
    const newSlide: OutlineSlide = {
      id: slideId,
      title: "New Slide",
      points: [{ id: `${slideId}-point-0-${Date.now()}`, text: "Add your first point here" }],
    }

    setLocalOutline((prev) => {
      const newOutline = [...prev, newSlide]

      // Schedule Redux update for next tick to avoid render phase updates
      scheduleAction(() => {
        isLocalUpdate.current = true
        dispatch(setOutline(convertToStringPoints(newOutline)))
        setTimeout(() => {
          isLocalUpdate.current = false
        }, 100)
      })

      return newOutline
    })
  }, [dispatch, scheduleAction, convertToStringPoints])

  const handleAddPoint = useCallback(
    (slideId: string) => {
      setLocalOutline((prev) => {
        const updatedOutline = prev.map((slide) => {
          if (slide.id === slideId) {
            const newPointId = `${slide.id}-point-${slide.points.length}-${Date.now()}`
            const newPoint = { id: newPointId, text: "New point" }

            const updatedSlide = {
              ...slide,
              points: [...slide.points, newPoint],
            }

            // Schedule setting the new point index for next tick
            scheduleAction(() => {
              setNewPointIndex({ slideId, pointId: newPointId })
            })

            return updatedSlide
          }
          return slide
        })

        // Schedule Redux update for next tick to avoid render phase updates
        scheduleAction(() => {
          isLocalUpdate.current = true
          dispatch(setOutline(convertToStringPoints(updatedOutline)))
          setTimeout(() => {
            isLocalUpdate.current = false
          }, 100)
        })

        return updatedOutline
      })
    },
    [dispatch, scheduleAction, convertToStringPoints],
  )

  const handleOpenTemplatePopup = () => {
    console.log("Opening template popup")
    setIsTemplatePopupOpen(true)
  }

  const handleCloseTemplatePopup = () => {
    setIsTemplatePopupOpen(false)
  }

  const handleSelectTemplate = (template: string) => {
    console.log("Selected template:", template)
    dispatch(setSelectedTemplate(template))
  }

  const handleBackToOutline = () => {
    setShowSlidesPreview(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading outline...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Generator
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Create New Outline
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeSlide = outline.find((slide) => slide.id === activeId)
  const activeIndex = activeSlide ? outline.findIndex((slide) => slide.id === activeId) : -1

  // If we're showing the slides preview
  if (showSlidesPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleBackToOutline}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Outline
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600">
              {isGeneratingSlides && !storeError
                ? `Generating slides... Please wait.`
                : storeError
                  ? "Error generating slides"
                  : `Generated ${slides.length} slides with ${selectedTemplate} theme.`}
            </p>
          </div>

          {/* Show error message if there's an error */}
          {storeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error generating slides</h3>
                  <p className="text-red-700 mb-4">{storeError}</p>
                  <button
                    onClick={handleRetryGeneration}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show loading indicator if generating */}
          {isGeneratingSlides && !storeError && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg mb-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600 text-lg">Generating your presentation...</p>
              <p className="text-gray-500 text-sm mt-2">This may take a minute or two.</p>
            </div>
          )}

          {/* Show slides or empty state */}
          {!isGeneratingSlides && slides.length === 0 && !storeError ? (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
              <p className="text-gray-600">No slides generated yet. Please try again.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {slides.map((slide, index) => (
                <div key={slide.slide_id} className="relative">
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-medium">
                    {index + 1}
                  </div>
                  <SlideViewer slide={slide} theme={selectedTemplate || "light"} />
                </div>
              ))}
            </div>
          )}

          {!isGeneratingSlides && slides.length > 0 && !storeError && (
            <div className="mt-8 flex justify-center">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Download Presentation
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Otherwise, show the outline editor
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={handleGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </button>

        <div className="mb-8">
          <EditableContent
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-3xl font-bold tracking-tight text-gray-800 mb-2 px-2 py-1 rounded-md"
          />
          <p className="text-gray-600">
            Your presentation outline has {outline.length} slides. Edit it below or generate the full presentation.
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Outline</h2>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={outline.map((slide) => slide.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {outline.map((slide, index) => (
                <SortableSlideCard
                  key={slide.id}
                  slide={slide}
                  index={index}
                  handleSlideTitleChange={handleSlideTitleChange}
                  handleSlideTitleBlur={handleSlideTitleBlur}
                  handleSlideTitleKeyDown={handleSlideTitleKeyDown}
                  handlePointChange={handlePointChange}
                  handlePointBlur={handlePointBlur}
                  handlePointKeyDown={handlePointKeyDown}
                  handleDeleteSlide={handleDeleteSlide}
                  handleAddPoint={handleAddPoint}
                  handleDeletePoint={handleDeletePoint}
                  newPointIndex={newPointIndex}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={true}>
            {activeId && activeSlide && <SlideCard slide={activeSlide} index={activeIndex} />}
          </DragOverlay>
        </DndContext>

        <button
          onClick={handleAddSlide}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-purple-600 hover:border-purple-300 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add card
        </button>

        <div className="mt-4 flex justify-between text-gray-500 text-sm">
          <span>{outline.length} cards total</span>
          <span>Type --- for card breaks</span>
          <span>{outline.reduce((acc, slide) => acc + slide.points.length, 0)}/20000</span>
        </div>

        {/* Template selection and Generate Slides buttons at the bottom */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleOpenTemplatePopup}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Palette className="h-5 w-5" />
            Choose Template
            <span className="ml-1 text-xs px-2 py-0.5 bg-gray-100 rounded-full">
              {selectedTemplate === "light" ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={handleGenerateSlides}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-lg font-medium"
            disabled={isInitiatingSlides}
          >
            {isInitiatingSlides ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Initiating...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Generate Slides
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selection Popup */}
      <TemplateSelectionPopup
        isOpen={isTemplatePopupOpen}
        onClose={handleCloseTemplatePopup}
        onSelectTemplate={handleSelectTemplate}
        selectedTemplate={selectedTemplate || "light"}
      />
    </div>
  )
}
