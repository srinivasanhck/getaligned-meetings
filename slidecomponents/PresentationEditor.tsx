"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Save,
  Plus,
  Edit3,
  PlusCircle,
  X,
  MessageCircle,
  Send,
  CheckCircle,
  Layers,
  Settings,
  Palette,
} from "lucide-react"
import type { Slide, SlideElement, BlockDefinition, ImageElementProps, VideoElementProps } from "@/types"
import EditableSlideView from "./EditableSlideView"
import SlideThumbnail from "./SlideThumbnail"
import PropertyInspectorPanel from "./editing/PropertyInspectorPanel"
import BlockPalette from "./editing/BlockPalette"
import ImageUploadModal from "./editing/ImageUploadModal"
import VideoUploadModal from "./editing/VideoUploadModal"
import ChatMessageRenderer from "./ChatMessageRenderer"
import { chatService } from "./chatService"
import { convertApiSlideToInternalSlide } from "./slideConverter"
import CustomSelect from "./CustomSelect"
import BackgroundModal from "@/components/ui/background-modal"
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal"
import UndoRedoToolbar from "@/components/ui/UndoRedoToolbar"
import type { HistoryAction } from "@/hooks/useUndoRedo"
import { useToast } from "@/components/ui/toast"

interface PresentationEditorProps {
  presentation: Slide[]
  currentSlideIndex: number
  onSetCurrentSlideIndex: (index: number) => void
  onElementUpdate: (slideId: string, updatedElement: SlideElement) => void
  onSlideUpdate: (updatedSlide: Slide) => void
  onAddElement: (slideId: string, blockDefinition: BlockDefinition) => void
  onAddSlide: () => void
  onDeleteSlide: (slideId: string) => void
  onDeleteElement: (slideId: string, elementId: string) => void
  onSaveAndShowJson: () => void
  onOpenRegenerateModal: (slideId: string) => void
  onPresentationUpdate?: (updatedPresentation: Slide[]) => void
  onSlideReorder?: (fromIndex: number, toIndex: number) => void
  // Undo/Redo props
  canUndo?: boolean
  canRedo?: boolean
  currentAction?: HistoryAction | null
  onUndo?: () => void
  onRedo?: () => void
}

const LEFT_PANEL_WIDTH_OPEN = "200px"
const LEFT_PANEL_WIDTH_CLOSED = "0px"
const RIGHT_PANEL_WIDTH = "318px"

const PresentationEditor: React.FC<PresentationEditorProps> = ({
  presentation,
  currentSlideIndex,
  onSetCurrentSlideIndex,
  onElementUpdate,
  onSlideUpdate,
  onAddElement,
  onAddSlide,
  onDeleteSlide,
  onDeleteElement,
  onSaveAndShowJson,
  onOpenRegenerateModal,
  onPresentationUpdate,
  onSlideReorder,
  // Undo/Redo props
  canUndo = false,
  canRedo = false,
  currentAction = null,
  onUndo,
  onRedo,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [isBlockPaletteOpen, setIsBlockPaletteOpen] = useState(false)
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false)
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false)
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isContentToolsOpen, setIsContentToolsOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; text: string; isUser: boolean; timestamp: Date; isSuccess?: boolean }>
  >([])
  const [chatInput, setChatInput] = useState("")
  const [agentType, setAgentType] = useState<"ask" | "agent">("ask")
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
  
  // Save state
  const [isSaving, setIsSaving] = useState(false)

  // Toast hook
  const { showToast } = useToast()

  // Drag and drop state
  const [draggedSlideIndex, setDraggedSlideIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    slideId: string
    slideIndex: number
  }>({
    isOpen: false,
    slideId: "",
    slideIndex: -1,
  })

  const currentSlide = presentation[currentSlideIndex]
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  const handleElementSelect = useCallback(
    (elementId: string) => {
      setSelectedElementId(elementId || null)
      // Exit editing mode when selecting a different element
      if (editingElementId && editingElementId !== elementId) {
        setEditingElementId(null)
      }
    },
    [editingElementId],
  )

  const handleElementEdit = useCallback((elementId: string) => {
    setEditingElementId(elementId)
    setSelectedElementId(elementId) // Also select the element
  }, [])

  const handleExitEditing = useCallback(() => {
    setEditingElementId(null)
  }, [])

  // Save wrapper with loading overlay and toast
  const handleSave = useCallback(async () => {
    if (isSaving) return
    
    setIsSaving(true)
    
    try {
      await onSaveAndShowJson()
      showToast("Slides saved successfully", "success")
    } catch (error) {
      console.error("Save error:", error)
      showToast("Failed to save slides", "error")
    } finally {
      setIsSaving(false)
    }
  }, [isSaving, onSaveAndShowJson, showToast])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [chatMessages, isLoadingChat])

  // Add escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingElementId) {
          handleExitEditing()
        } else if (deleteConfirmation.isOpen) {
          setDeleteConfirmation({ isOpen: false, slideId: "", slideIndex: -1 })
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [editingElementId, handleExitEditing, deleteConfirmation.isOpen])

  const handleElementUpdate = useCallback(
    (updatedElement: SlideElement) => {
      if (currentSlide) {
        onElementUpdate(currentSlide.id, updatedElement)
      }
    },
    [currentSlide, onElementUpdate],
  )

  // Handle element deletion from toolbar or keyboard
  const handleElementDelete = useCallback(
    (elementId: string) => {
      if (currentSlide) {
        onDeleteElement(currentSlide.id, elementId)
        // Clear selection and editing state
        setSelectedElementId(null)
        setEditingElementId(null)
      }
    },
    [currentSlide, onDeleteElement],
  )

  const handleAddElement = useCallback(
    (blockDefinition: BlockDefinition) => {
      if (currentSlide) {
        // Special handling for image blocks
        if (blockDefinition.type === "image") {
          setIsImageUploadModalOpen(true)
          setIsBlockPaletteOpen(false)
          return
        }

        // Special handling for video blocks
        if (blockDefinition.type === "video") {
          setIsVideoUploadModalOpen(true)
          setIsBlockPaletteOpen(false)
          return
        }

        // Add element to current slide for non-image/video blocks
        onAddElement(currentSlide.id, blockDefinition)

        // Close the palette
        setIsBlockPaletteOpen(false)

        // Auto-select the new element after a brief delay
        setTimeout(() => {
          // Find the newest element (last in array)
          const newestElement = currentSlide.elements[currentSlide.elements.length]
          if (newestElement) {
            setSelectedElementId(newestElement.id)
          }
        }, 200)
      }
    },
    [currentSlide, onAddElement],
  )

  const handleDeleteElement = useCallback(() => {
    if (currentSlide && selectedElementId) {
      handleElementDelete(selectedElementId)
    }
  }, [currentSlide, selectedElementId, handleElementDelete])

  // Background preview state
  const [previewBackground, setPreviewBackground] = useState<{
    type: "color" | "gradient" | "image"
    value: string
    imageFit?: "cover" | "contain"
    overlayOpacity?: number
  } | null>(null)

  const handleBackgroundChange = useCallback(
    (background: {
      type: "color" | "gradient" | "image"
      value: string
      imageFit?: "cover" | "contain"
      overlayOpacity?: number
    }) => {
      // Set preview instead of applying immediately
      setPreviewBackground(background)
    },
    [],
  )

  const handleBackgroundAccept = useCallback(() => {
    if (currentSlide && previewBackground) {
      onSlideUpdate({
        ...currentSlide,
        background: {
          type: previewBackground.type,
          value: previewBackground.value,
          imageFit: previewBackground.imageFit,
          overlayOpacity: previewBackground.overlayOpacity,
        },
      })
      setPreviewBackground(null)
    }
  }, [currentSlide, previewBackground, onSlideUpdate])

  const handleBackgroundReject = useCallback(() => {
    setPreviewBackground(null)
  }, [])

  const handleBackgroundModalOpen = useCallback(() => {
    // Clear any existing preview when opening modal
    setPreviewBackground(null)
    setIsBackgroundModalOpen(true)
  }, [])

  const handleBackgroundModalClose = useCallback(() => {
    // Only close the modal, keep the preview background active
    // User must explicitly accept or reject the changes
    setIsBackgroundModalOpen(false)
  }, [])

  // Handle slide deletion with confirmation
  const handleSlideDeleteClick = useCallback((slideId: string, slideIndex: number) => {
    setDeleteConfirmation({
      isOpen: true,
      slideId,
      slideIndex,
    })
  }, [])

  const handleConfirmSlideDelete = useCallback(() => {
    if (deleteConfirmation.slideId) {
      onDeleteSlide(deleteConfirmation.slideId)
    }
    setDeleteConfirmation({ isOpen: false, slideId: "", slideIndex: -1 })
  }, [deleteConfirmation.slideId, onDeleteSlide])

  const handleCancelSlideDelete = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, slideId: "", slideIndex: -1 })
  }, [])

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedSlideIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", "")
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()

      if (draggedSlideIndex !== null && draggedSlideIndex !== dropIndex && onSlideReorder) {
        onSlideReorder(draggedSlideIndex, dropIndex)
      }

      setDraggedSlideIndex(null)
      setDragOverIndex(null)
    },
    [draggedSlideIndex, onSlideReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedSlideIndex(null)
    setDragOverIndex(null)
  }, [])

  const fetchConversationHistory = useCallback(async () => {
    if (hasLoadedHistory) return // Don't fetch if already loaded

    setIsLoadingHistory(true)
    setHistoryError(null)

    try {
      // Get requestId from URL
      const requestId = window.location.pathname.split("/").pop() || ""

      if (!requestId) {
        throw new Error("Request ID not found in URL")
      }

      const response = await chatService.getConversationHistory(requestId)

      if (response.success && response.conversation_history.length > 0) {
        // Convert API response to chat messages format
        const historyMessages = response.conversation_history.flatMap((item) => [
          {
            id: `user-${item.id}`,
            text: item.user_message,
            isUser: true,
            timestamp: new Date(item.created_at),
          },
          {
            id: `ai-${item.id}`,
            text: item.agent_response,
            isUser: false,
            timestamp: new Date(item.created_at),
            isSuccess: item.agent_type === "agent", // Mark agent responses as success
          },
        ])

        setChatMessages(historyMessages)
      }

      setHasLoadedHistory(true)
    } catch (error) {
      console.error("Error fetching conversation history:", error)
      setHistoryError(error instanceof Error ? error.message : "Failed to load conversation history")
    } finally {
      setIsLoadingHistory(false)
    }
  }, [hasLoadedHistory])

  const toggleLeftPanel = () => {
    setIsLeftPanelOpen(!isLeftPanelOpen)
  }

  const toggleChatPanel = () => {
    setIsChatOpen(!isChatOpen)
  }

  const toggleContentTools = () => {
    setIsContentToolsOpen(!isContentToolsOpen)
  }

  const handleSendMessage = async () => {
    if (chatInput.trim() && !isLoadingChat) {
      const userMessage = chatInput.trim()
      const newMessage = {
        id: Date.now().toString(),
        text: userMessage,
        isUser: true,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, newMessage])
      setChatInput("")
      setIsLoadingChat(true)
      setChatError(null)

      try {
        // Get requestId from URL params
        const requestId = window.location.pathname.split("/").pop() || ""

        // Prepare request body
        const requestBody: any = {
          slide_requests_id: requestId,
          agent_type: agentType,
          prompt: userMessage,
        }

        // Add slide_id for agent mode
        if (agentType === "agent" && currentSlide) {
          requestBody.slide_id = currentSlide.id
        }

        const response = await chatService.sendMessage(requestBody)

        if (response.success) {
          const botResponse = {
            id: (Date.now() + 1).toString(),
            text: response.response,
            isUser: false,
            timestamp: new Date(),
            isSuccess: response.edited && agentType === "agent", // Mark as success if slides were edited
          }
          setChatMessages((prev) => [...prev, botResponse])

          // Handle slide updates for agent mode
          console.log("Full API Response:", response)
          console.log("Response.edited:", response.edited)
          console.log("Response.updated_slides:", response.updated_slides)
          console.log("Response.updated_slide:", (response as any).updated_slide)

          if (response.edited) {
            let slidesToUpdate: any[] = []

            // Handle both singular and plural response formats
            if (response.updated_slides && response.updated_slides.length > 0) {
              slidesToUpdate = response.updated_slides
              console.log("Using updated_slides (plural):", slidesToUpdate)
            } else if ((response as any).updated_slide) {
              slidesToUpdate = [(response as any).updated_slide]
              console.log("Using updated_slide (singular):", slidesToUpdate)
            }

            if (slidesToUpdate.length > 0) {
              console.log("Processing slide updates:", slidesToUpdate)

              // Convert API slides to internal format
              const updatedSlides = slidesToUpdate.map(convertApiSlideToInternalSlide)
              console.log("Converted slides:", updatedSlides)

              // Update the presentation with new slide data
              const updatedPresentation = [...presentation]
              updatedSlides.forEach((updatedSlide) => {
                const slideIndex = updatedPresentation.findIndex((slide) => slide.id === updatedSlide.id)
                console.log(`Looking for slide with ID: ${updatedSlide.id}, found at index: ${slideIndex}`)

                if (slideIndex !== -1) {
                  console.log(`Updating slide at index ${slideIndex}:`, updatedSlide)
                  updatedPresentation[slideIndex] = updatedSlide
                } else {
                  console.warn(`Slide with ID ${updatedSlide.id} not found in presentation`)
                }
              })

              // Notify parent component of presentation update
              if (onPresentationUpdate) {
                console.log("Calling onPresentationUpdate with:", updatedPresentation)
                onPresentationUpdate(updatedPresentation)
              } else {
                console.warn("onPresentationUpdate callback not provided")
              }

              console.log("Slides updated successfully!")
            } else {
              console.warn("No slides to update found in response")
            }
          } else {
            console.log("Response.edited is false, no slide updates needed")
          }
        } else {
          throw new Error("Failed to get response from AI assistant")
        }
      } catch (error) {
        console.error("Chat error:", error)
        setChatError(error instanceof Error ? error.message : "Failed to send message")
      } finally {
        setIsLoadingChat(false)
      }
    }
  }

  // Fetch conversation history when chat panel opens
  useEffect(() => {
    if (isChatOpen && !hasLoadedHistory) {
      fetchConversationHistory()
    }
  }, [isChatOpen, fetchConversationHistory, hasLoadedHistory])

  const selectedElement = currentSlide?.elements.find((el) => el.id === selectedElementId)

  // Handle image selection from upload modal
  const handleImageSelect = useCallback(
    (imageUrl: string, altText?: string) => {
      if (currentSlide) {
        // Create image block definition
        const imageBlockDefinition: BlockDefinition = {
          id: 'uploaded-image',
          type: 'image',
          label: 'Uploaded Image',
          icon: 'photo',
          category: 'Media',
          defaultProps: {
            src: imageUrl,
            alt: altText || 'Uploaded image',
            width: 50,
            height: 37.5,
            objectFit: 'contain'
          } as Partial<ImageElementProps>
        }

        // Add the image element to the slide
        onAddElement(currentSlide.id, imageBlockDefinition)

        // Close the modal
        setIsImageUploadModalOpen(false)

        // Auto-select the new element after a brief delay
        setTimeout(() => {
          const newestElement = currentSlide.elements[currentSlide.elements.length]
          if (newestElement) {
            setSelectedElementId(newestElement.id)
          }
        }, 200)
      }
    },
    [currentSlide, onAddElement]
  )

  // Handle video selection from upload modal
  const handleVideoSelect = useCallback(
    (videoUrl: string, altText?: string) => {
      if (currentSlide) {
        // Create video block definition
        const videoBlockDefinition: BlockDefinition = {
          id: 'uploaded-video',
          type: 'video',
          label: 'Uploaded Video',
          icon: 'video',
          category: 'Media',
          defaultProps: {
            src: videoUrl,
            alt: altText || 'Uploaded video',
            width: 60,
            height: 33.75, // 16:9 aspect ratio
            controls: true,
            videoType: 'direct'
          } as Partial<VideoElementProps>
        }

        // Add the video element to the slide
        onAddElement(currentSlide.id, videoBlockDefinition)

        // Close the modal
        setIsVideoUploadModalOpen(false)

        // Auto-select the new element after a brief delay
        setTimeout(() => {
          const newestElement = currentSlide.elements[currentSlide.elements.length]
          if (newestElement) {
            setSelectedElementId(newestElement.id)
          }
        }, 200)
      }
    },
    [currentSlide, onAddElement]
  )



  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleLeftPanel}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-600"
            title={isLeftPanelOpen ? "Hide Thumbnails" : "Show Thumbnails"}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium text-slate-700">
            Slide {currentSlideIndex + 1} of {presentation.length}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Undo/Redo Buttons */}
          {onUndo && onRedo && (
            <UndoRedoToolbar
              canUndo={canUndo}
              canRedo={canRedo}
              currentAction={currentAction}
              onUndo={onUndo}
              onRedo={onRedo}
              className="mr-2"
            />
          )}
          
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-md transition-colors text-sm font-medium"
            title="Save presentation"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Slide Thumbnails */}
        <div
          className="bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shrink-0"
          style={{ width: isLeftPanelOpen ? LEFT_PANEL_WIDTH_OPEN : LEFT_PANEL_WIDTH_CLOSED }}
        >
          {isLeftPanelOpen && (
            <>
              <div className="p-3 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Slides</h3>
                <button
                  onClick={onAddSlide}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Slide</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {presentation.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`relative group ${dragOverIndex === index ? "border-t-2 border-blue-500" : ""} ${
                      draggedSlideIndex === index ? "opacity-50" : ""
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <SlideThumbnail
                      slide={slide}
                      index={index}
                      isActive={index === currentSlideIndex}
                      onClick={() => onSetCurrentSlideIndex(index)}
                    />
                    {presentation.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSlideDeleteClick(slide.id, index)
                        }}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title="Delete slide"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    {/* Drag handle indicator */}
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-4 h-4 bg-black/20 rounded flex items-center justify-center cursor-move">
                        <div className="w-2 h-2 bg-white/80 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Center Panel - Main Slide Editor */}
        <div
          ref={editorContainerRef}
          className="flex-1 flex flex-col bg-slate-100 items-center justify-center p-4 md:p-6 overflow-hidden"
        >
          {/* Slide Container with proper aspect ratio */}
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              data-slide-export={`slide-${currentSlideIndex}`}
              style={{
                width: "min(calc(100vh - 200px) * (16/9), calc(100vw - 400px))",
                height: "min(calc(100vh - 200px), calc((100vw - 400px) * (9/16)))",
                aspectRatio: "16/9",
              }}
            >
              {currentSlide && (
                <EditableSlideView
                  slide={currentSlide}
                  isActive={true}
                  selectedElementId={selectedElementId}
                  editingElementId={editingElementId}
                  onElementSelect={handleElementSelect}
                  onElementEdit={handleElementEdit}
                  onElementUpdate={handleElementUpdate}
                  onElementDelete={handleElementDelete}
                  previewBackground={previewBackground}
                />
              )}
              
              {/* Background Preview Accept/Reject Buttons */}
              {previewBackground && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-slate-200">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-700">Preview mode</span>
                    <span className="text-xs text-slate-500">• Enter to accept • Esc to reject</span>
                  </div>
                  <button
                    onClick={handleBackgroundAccept}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium shadow-lg flex items-center gap-2"
                    title="Accept changes (Enter)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={handleBackgroundReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium shadow-lg flex items-center gap-2"
                    title="Reject changes (Escape)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat or Element Actions */}
        <div
          className="bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden"
          style={{ width: RIGHT_PANEL_WIDTH }}
        >
          {/* Panel Toggle Buttons */}
          <div className="p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex rounded-lg bg-slate-200 p-1">
              <button
                onClick={() => {
                  setIsChatOpen(false)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  !isChatOpen ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Actions</span>
              </button>
              <button
                onClick={() => {
                  setIsChatOpen(true)
                }}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                  isChatOpen ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Element Actions Panel */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                isChatOpen ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="h-full flex flex-col">
                {/* Collapsible Content Tools Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  {/* Content Tools Header with Toggle */}
                  <div className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleContentTools}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-700">Content Tools</h3>
                      </div>
                      <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                        {isContentToolsOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Collapsible Content Tools Buttons */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isContentToolsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 pb-4">
                      {/* Action Buttons */}
                      <div className="space-y-3">
                        {/* Enhanced Add Block Button */}
                        <button
                          onClick={() => setIsBlockPaletteOpen(true)}
                          className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                            <PlusCircle className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm">Add New Block</div>
                            <div className="text-xs text-blue-100">Insert content elements</div>
                          </div>
                        </button>

                        {/* Background Button */}
                        <button
                          onClick={handleBackgroundModalOpen}
                          className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                            <Palette className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-sm">Background</div>
                            <div className="text-xs text-purple-100">Customize slide background</div>
                          </div>
                        </button>
                      </div>

                      {/* Quick Stats */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Settings className="w-3 h-3" />
                          <span>Slide {currentSlideIndex + 1}</span>
                        </span>
                        <span>{currentSlide?.elements.length || 0} elements</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Element Properties or Welcome Message */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {selectedElement ? (
                    <div className="p-1">
                      <PropertyInspectorPanel
                        currentSlide={currentSlide}
                        selectedElement={selectedElement}
                        onElementChange={handleElementUpdate}
                        onSlideUpdate={onSlideUpdate}
                        onDeleteElement={onDeleteElement}
                      />
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      {/* Welcome State */}
                      <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                          <Edit3 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-700 mb-2">Ready to Edit</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          Select any element on the slide to customize its properties, or add new content using the
                          buttons above.
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <PlusCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-slate-700">Add Content</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Click "Add New Block" to insert text, images, charts, and more.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Palette className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-slate-700">Customize Background</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Click "Background" to change colors, gradients, or add images.
                          </p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-700">AI Assistant</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Switch to "AI Chat" tab to modify slides with natural language.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Panel */}
            <div
              className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
                isChatOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="h-full flex flex-col bg-white">
                {/* Chat Messages - Now takes up more space */}
                <div ref={chatMessagesRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {chatError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">{chatError}</p>
                        <button onClick={() => setChatError(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {historyError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">{historyError}</p>
                        <button onClick={() => setHistoryError(null)} className="text-red-500 hover:text-red-700">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {isLoadingHistory ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        <span className="text-sm">Loading conversation history...</span>
                      </div>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 mt-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium mb-1">Start a conversation</p>
                      <p className="text-xs mb-4">Ask me to help you modify this slide!</p>
                      <div className="text-xs text-left bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <p className="font-medium text-slate-600 mb-2">Try asking:</p>
                        <ul className="space-y-1 text-slate-500">
                          <li>
                            <button
                              onClick={() => setChatInput("Change the background to blue")}
                              className="text-blue-500 hover:text-blue-700 hover:underline text-left"
                            >
                              • "Change the background to blue"
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setChatInput("Add a bullet point list")}
                              className="text-blue-500 hover:text-blue-700 hover:underline text-left"
                            >
                              • "Add a bullet point list"
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setChatInput("Make the title larger")}
                              className="text-blue-500 hover:text-blue-700 hover:underline text-left"
                            >
                              • "Make the title larger"
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setChatInput("Add an image placeholder")}
                              className="text-blue-500 hover:text-blue-700 hover:underline text-left"
                            >
                              • "Add an image placeholder"
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isUser ? "justify-end" : "justify-start"} ${!message.isUser ? "pr-2" : ""}`}
                        >
                          <div
                            className={`${message.isUser ? "max-w-[80%]" : "max-w-[95%]"} rounded-lg px-3 py-2 text-sm ${
                              message.isUser
                                ? "bg-blue-500 text-white"
                                : message.isSuccess
                                  ? "bg-green-50 border border-green-200 text-green-800"
                                  : "bg-slate-50 border border-slate-200 text-slate-700"
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.isSuccess && !message.isUser && (
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1">
                                {message.isUser ? (
                                  <p>{message.text}</p>
                                ) : (
                                  <ChatMessageRenderer content={message.text} />
                                )}
                              </div>
                            </div>
                            <p
                              className={`text-xs mt-2 ${
                                message.isUser
                                  ? "text-blue-100"
                                  : message.isSuccess
                                    ? "text-green-600"
                                    : "text-slate-400"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {message.isSuccess && " • Slides updated"}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoadingChat && (
                        <div className="flex justify-start pr-2">
                          <div className="max-w-[95%] bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>
                                {agentType === "agent" ? "AI is updating your slides..." : "AI is thinking..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Modern Chat Input - Cursor/Copilot Style */}
                <div className="border-t border-slate-200 bg-white p-3">
                  {/* Main Input Field - Full Width */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isLoadingChat && handleSendMessage()}
                      placeholder="Ask me to modify this slide..."
                      disabled={isLoadingChat}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed resize-none"
                    />
                  </div>

                  {/* Bottom Controls Row */}
                  <div className="flex items-center justify-between">
                    {/* Left Side - Mode Select */}
                    <div className="flex items-center space-x-2">
                      <CustomSelect value={agentType} onChange={setAgentType} />
                      <span className="text-xs text-slate-500">
                        Slide {currentSlideIndex + 1} of {presentation.length}
                      </span>
                    </div>

                    {/* Right Side - Send Button */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isLoadingChat}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isLoadingChat ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>Send</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="h-12 bg-white border-t border-slate-200 flex items-center justify-center space-x-3 shrink-0">
        <button
          onClick={() => onSetCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-md transition-colors text-sm text-slate-700"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-md text-sm font-medium">
          {currentSlideIndex + 1} / {presentation.length}
        </div>
        <button
          onClick={() => onSetCurrentSlideIndex(Math.min(presentation.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex === presentation.length - 1}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 rounded-md transition-colors text-sm text-slate-700"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Block Palette Modal */}
      {isBlockPaletteOpen && (
        <BlockPalette onSelectBlock={handleAddElement} onClose={() => setIsBlockPaletteOpen(false)} />
      )}

      {/* Background Modal */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={handleBackgroundModalClose}
        currentBackground={currentSlide?.background || { type: "color", value: "#FFFFFF" }}
        onBackgroundChange={handleBackgroundChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleCancelSlideDelete}
        onConfirm={handleConfirmSlideDelete}
        elementType="Slide"
        slideNumber={deleteConfirmation.slideIndex + 1}
        message={`Are you sure you want to delete Slide ${deleteConfirmation.slideIndex + 1}? This action cannot be undone and all content on this slide will be permanently lost.`}
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageUploadModalOpen}
        onClose={() => setIsImageUploadModalOpen(false)}
        onImageSelect={handleImageSelect}
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={isVideoUploadModalOpen}
        onClose={() => setIsVideoUploadModalOpen(false)}
        onVideoSelect={handleVideoSelect}
      />

      {/* Save Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 max-w-sm mx-4 border border-gray-100">
            {/* Animated spinner with gradient */}
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 border-r-blue-500 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-12 h-12 border-2 border-transparent border-t-blue-400 border-r-blue-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            
            {/* Text with typing animation */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Saving Your Work</h3>
              <p className="text-gray-600 text-sm animate-pulse">Please wait while we save your presentation...</p>
            </div>
            
            {/* Progress dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PresentationEditor
