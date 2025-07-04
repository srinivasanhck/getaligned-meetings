"use client"

import type React from "react"
import { useRef, useState, useLayoutEffect } from "react"
import type {
  Slide,
  SlideElement,
  TextElementProps,
  ImageElementProps,
  ChartElementProps,
  ShapeElementProps,
  ParentDimensions,
} from "@/types"
import ElementWrapper from "./editing/ElementWrapper"
import { EditableText, EditableImage, EditableChart, EditableShape } from "./SlideElementRenderers"
import { cn } from "@/lib/utils"
import { useSlideCanvas } from "@/lib/slideCanvas"

interface EditableSlideViewProps {
  slide: Slide
  isActive: boolean
  selectedElementId?: string | null
  editingElementId?: string | null
  onElementSelect: (elementId: string) => void
  onElementEdit: (elementId: string) => void
  onElementUpdate: (updatedElement: SlideElement) => void
  onElementDelete: (elementId: string) => void
  previewBackground?: {
    type: "color" | "gradient" | "image"
    value: string
    imageFit?: "cover" | "contain"
    overlayOpacity?: number
  } | null
}

const EditableSlideView: React.FC<EditableSlideViewProps> = ({
  slide,
  isActive,
  selectedElementId,
  editingElementId,
  onElementSelect,
  onElementEdit,
  onElementUpdate,
  onElementDelete,
  previewBackground,
}) => {
  const slideViewRef = useRef<HTMLDivElement>(null)
  const [containerDimensions, setContainerDimensions] = useState<ParentDimensions | null>(null)
  const { canvasInfo } = useSlideCanvas()

  const [defaultTextColor, setDefaultTextColor] = useState<string>("#000000")

  useLayoutEffect(() => {
    if (slide && slide.defaultElementTextColor) {
      setDefaultTextColor(slide.defaultElementTextColor)
    }
  }, [slide, slide?.defaultElementTextColor])

  useLayoutEffect(() => {
    const slideNode = slideViewRef.current
    if (slideNode && isActive) {
      const rect = slideNode.getBoundingClientRect()
      setContainerDimensions({ width: rect.width, height: rect.height })
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          setContainerDimensions({ width, height })
        }
      })
      resizeObserver.observe(slideNode)
      return () => resizeObserver.disconnect()
    } else if (!isActive) {
      setContainerDimensions(null)
    }
  }, [isActive, slide?.id])

  if (!slide) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="text-lg mb-2">No slide data</div>
          <div className="text-sm">Slide is loading or undefined</div>
        </div>
      </div>
    )
  }

  const { elements, background } = slide

  // Use preview background if available, otherwise use slide background
  const activeBackground = previewBackground || background

  const backgroundStyle: React.CSSProperties = {}
  let backgroundClasses = "bg-white"

  // Handle different background types
  if (activeBackground.type === "image" && activeBackground.value) {
    backgroundStyle.backgroundImage = `url(${activeBackground.value})`
    backgroundStyle.backgroundSize = activeBackground.imageFit || "cover"
    backgroundStyle.backgroundPosition = "center"
    backgroundStyle.backgroundRepeat = "no-repeat"
    backgroundClasses = ""
  } else if (activeBackground.type === "gradient" && activeBackground.value) {
    // Handle gradient backgrounds
    backgroundStyle.background = activeBackground.value
    backgroundClasses = ""
  } else if (activeBackground.type === "color" && activeBackground.value.startsWith("bg-")) {
    backgroundClasses = activeBackground.value
  } else if (activeBackground.type === "color") {
    backgroundStyle.backgroundColor = activeBackground.value || "#FFFFFF"
    backgroundClasses = ""
  }

  // Debug log to check background data
  console.log("EditableSlideView - Background data:", activeBackground)

  return (
    <div
      ref={slideViewRef}
      className={cn(
        "w-full h-full shadow-lg rounded-md overflow-hidden relative",
        backgroundClasses,
        "transition-opacity duration-300 ease-in-out",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      style={{ ...backgroundStyle, willChange: "opacity" }}
      aria-label={`Slide: ${slide.titleForThumbnail || "Editable Slide"}`}
      role="group"
    >
      {/* Overlay for image backgrounds - Fixed condition */}
      {activeBackground.type === "image" &&
        activeBackground.value &&
        activeBackground.overlayOpacity !== undefined &&
        activeBackground.overlayOpacity !== null &&
        activeBackground.overlayOpacity > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${activeBackground.overlayOpacity})`,
              zIndex: 1,
            }}
          />
        )}

      {/* Elements container with proper z-index */}
      <div
        className="relative w-full h-full"
        style={{ zIndex: 2 }}
        onClick={(e) => {
          // If the click is on the container itself (the slide background) and not an element, deselect.
          if (e.target === e.currentTarget) {
            onElementSelect("") // This will also trigger exiting edit mode in the parent component.
          }
        }}
      >
        {isActive &&
          containerDimensions &&
          elements.map((element) => (
            <ElementWrapper
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              isEditing={editingElementId === element.id}
              onSelect={onElementSelect}
              onEdit={onElementEdit}
              onElementUpdate={onElementUpdate}
              onElementDelete={onElementDelete}
              parentSlideDimensions={containerDimensions}
              slideDefaultTextColor={defaultTextColor}
              canvasInfo={canvasInfo}
            >
              {element.type === "text" && (
                <EditableText
                  element={element as TextElementProps}
                  defaultTextColor={defaultTextColor}
                  isEditing={editingElementId === element.id}
                  onElementUpdate={onElementUpdate}
                />
              )}
              {element.type === "image" && <EditableImage element={element as ImageElementProps} />}
              {element.type === "chart" && (
                <EditableChart element={element as ChartElementProps} defaultTextColor={defaultTextColor} />
              )}
              {element.type === "shape" && <EditableShape element={element as ShapeElementProps} />}
            </ElementWrapper>
          ))}
      </div>

      {isActive && !containerDimensions && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm pointer-events-none">
          Loading slide editor...
        </div>
      )}
    </div>
  )
}

export default EditableSlideView
