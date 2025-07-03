"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import type { SlideElement, TextElementProps, ParentDimensions } from "@/types"
import FloatingToolbar from "./FloatingToolbar"

type ResizeDirection = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se"

interface ElementWrapperProps {
  element: SlideElement
  isSelected: boolean
  isEditing: boolean
  onSelect: (elementId: string) => void
  onEdit: (elementId: string) => void
  onElementUpdate: (updatedElement: SlideElement) => void
  onElementDelete: (elementId: string) => void
  parentSlideDimensions: ParentDimensions
  slideDefaultTextColor?: string
  canvasInfo?: any
  children: React.ReactNode
}

const ElementWrapper: React.FC<ElementWrapperProps> = ({
  element,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onElementUpdate,
  onElementDelete,
  parentSlideDimensions,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<ResizeDirection | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [elementStartRect, setElementStartRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditing) {
        onSelect(element.id)
      }
      if (e.key === "Delete" && (isSelected || isEditing)) {
        handleDelete()
      }
    }

    if (isEditing || isSelected) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEditing, isSelected, element.id, onSelect])

  const getPixelPosition = useCallback(() => {
    return {
      x: (element.x / 100) * parentSlideDimensions.width,
      y: (element.y / 100) * parentSlideDimensions.height,
      width: (element.width / 100) * parentSlideDimensions.width,
      height: (element.height / 100) * parentSlideDimensions.height,
    }
  }, [element.x, element.y, element.width, element.height, parentSlideDimensions])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isEditing) return

      if (clickTimeout) {
        clearTimeout(clickTimeout)
        setClickTimeout(null)
      }
      const timeout = setTimeout(() => {
        if (!isResizing) {
          onSelect(element.id)
        }
        setClickTimeout(null)
      }, 200)
      setClickTimeout(timeout)
    },
    [element.id, isEditing, clickTimeout, onSelect, isResizing],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (clickTimeout) {
        clearTimeout(clickTimeout)
        setClickTimeout(null)
      }
      if (element.type === "text" || element.type === "shape") {
        onEdit(element.id)
      }
    },
    [element.id, element.type, clickTimeout, onEdit],
  )

  const handleMouseDownOnElement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isSelected && !isEditing) {
        onSelect(element.id)
      }

      if (isEditing || isResizing) return

      if (isSelected && !isEditing) {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setElementStartRect({ x: element.x, y: element.y, width: element.width, height: element.height })
      }
    },
    [element, isSelected, isEditing, isResizing, onSelect],
  )

  const handleMouseDownOnResizeHandle = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      e.stopPropagation()
      if (isEditing) return

      setIsResizing(direction)
      setDragStart({ x: e.clientX, y: e.clientY })
      setElementStartRect({ x: element.x, y: element.y, width: element.width, height: element.height })
    },
    [element, isEditing],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && !isResizing) return
      e.preventDefault()

      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      const deltaXPercent = (deltaX / parentSlideDimensions.width) * 100
      const deltaYPercent = (deltaY / parentSlideDimensions.height) * 100

      let newX = elementStartRect.x
      let newY = elementStartRect.y
      let newWidth = elementStartRect.width
      let newHeight = elementStartRect.height

      if (isDragging) {
        newX = elementStartRect.x + deltaXPercent
        newY = elementStartRect.y + deltaYPercent

        newX = Math.max(0, Math.min(newX, 100 - newWidth))
        newY = Math.max(0, Math.min(newY, 100 - newHeight))
      } else if (isResizing) {
        const minSizePercent = 5

        if (isResizing.includes("w")) {
          newWidth = elementStartRect.width - deltaXPercent
          if (newWidth >= minSizePercent) {
            newX = elementStartRect.x + deltaXPercent
          } else {
            newWidth = minSizePercent
            newX = elementStartRect.x + elementStartRect.width - minSizePercent
          }
        }
        if (isResizing.includes("n")) {
          newHeight = elementStartRect.height - deltaYPercent
          if (newHeight >= minSizePercent) {
            newY = elementStartRect.y + deltaYPercent
          } else {
            newHeight = minSizePercent
            newY = elementStartRect.y + elementStartRect.height - minSizePercent
          }
        }
        if (isResizing.includes("e")) {
          newWidth = elementStartRect.width + deltaXPercent
        }
        if (isResizing.includes("s")) {
          newHeight = elementStartRect.height + deltaYPercent
        }

        newWidth = Math.max(minSizePercent, newWidth)
        newHeight = Math.max(minSizePercent, newHeight)

        if (newX < 0) {
          newWidth += newX
          newX = 0
        }
        if (newY < 0) {
          newHeight += newY
          newY = 0
        }
        if (newX + newWidth > 100) {
          newWidth = 100 - newX
        }
        if (newY + newHeight > 100) {
          newHeight = 100 - newY
        }
      }

      onElementUpdate({
        ...element,
        x: Number.parseFloat(newX.toFixed(2)),
        y: Number.parseFloat(newY.toFixed(2)),
        width: Number.parseFloat(newWidth.toFixed(2)),
        height: Number.parseFloat(newHeight.toFixed(2)),
      })
    },
    [isDragging, isResizing, dragStart, elementStartRect, element, parentSlideDimensions, onElementUpdate],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(null)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  const pixelPosition = getPixelPosition()

  const handleTextUpdate = (updatedProps: Partial<TextElementProps>) => {
    onElementUpdate({ ...element, ...updatedProps } as SlideElement)
  }

  const handleDelete = useCallback(() => {
    onElementDelete(element.id)
  }, [element.id, onElementDelete])

  const handleDuplicate = useCallback(() => {
    const duplicatedElement = {
      ...element,
      id: `${element.id}_copy_${Date.now()}`,
      x: Math.min(element.x + 5, 95),
      y: Math.min(element.y + 5, 95),
    }
    console.log("Duplicate element:", duplicatedElement)
  }, [element])

  // Smart tooltip-style positioning
  const getToolbarPosition = useCallback(() => {
    const TOOLBAR_WIDTH = 400
    const TOOLBAR_HEIGHT = 50
    const GAP = 12
    const MARGIN = 8

    const elementRect = {
      left: pixelPosition.x,
      top: pixelPosition.y,
      right: pixelPosition.x + pixelPosition.width,
      bottom: pixelPosition.y + pixelPosition.height,
      centerX: pixelPosition.x + pixelPosition.width / 2,
      centerY: pixelPosition.y + pixelPosition.height / 2,
    }

    const slideRect = {
      left: MARGIN,
      top: MARGIN,
      right: parentSlideDimensions.width - MARGIN,
      bottom: parentSlideDimensions.height - MARGIN,
      width: parentSlideDimensions.width - 2 * MARGIN,
      height: parentSlideDimensions.height - 2 * MARGIN,
    }

    // Try different positions in order of preference
    const positions = [
      // Above element, centered
      {
        top: elementRect.top - TOOLBAR_HEIGHT - GAP,
        left: elementRect.centerX - TOOLBAR_WIDTH / 2,
        placement: "top",
      },
      // Below element, centered
      {
        top: elementRect.bottom + GAP,
        left: elementRect.centerX - TOOLBAR_WIDTH / 2,
        placement: "bottom",
      },
      // Left of element, centered vertically
      {
        top: elementRect.centerY - TOOLBAR_HEIGHT / 2,
        left: elementRect.left - TOOLBAR_WIDTH - GAP,
        placement: "left",
      },
      // Right of element, centered vertically
      {
        top: elementRect.centerY - TOOLBAR_HEIGHT / 2,
        left: elementRect.right + GAP,
        placement: "right",
      },
      // Above element, left aligned
      {
        top: elementRect.top - TOOLBAR_HEIGHT - GAP,
        left: elementRect.left,
        placement: "top-left",
      },
      // Above element, right aligned
      {
        top: elementRect.top - TOOLBAR_HEIGHT - GAP,
        left: elementRect.right - TOOLBAR_WIDTH,
        placement: "top-right",
      },
      // Below element, left aligned
      {
        top: elementRect.bottom + GAP,
        left: elementRect.left,
        placement: "bottom-left",
      },
      // Below element, right aligned
      {
        top: elementRect.bottom + GAP,
        left: elementRect.right - TOOLBAR_WIDTH,
        placement: "bottom-right",
      },
    ]

    // Find the first position that fits completely within the slide
    for (const pos of positions) {
      const toolbarRect = {
        left: pos.left,
        top: pos.top,
        right: pos.left + TOOLBAR_WIDTH,
        bottom: pos.top + TOOLBAR_HEIGHT,
      }

      // Check if toolbar fits within slide boundaries
      if (
        toolbarRect.left >= slideRect.left &&
        toolbarRect.top >= slideRect.top &&
        toolbarRect.right <= slideRect.right &&
        toolbarRect.bottom <= slideRect.bottom
      ) {
        return {
          top: pos.top,
          left: pos.left,
          placement: pos.placement,
        }
      }
    }

    // Fallback: Force fit the toolbar within bounds (should rarely happen)
    let fallbackTop = elementRect.top - TOOLBAR_HEIGHT - GAP
    let fallbackLeft = elementRect.centerX - TOOLBAR_WIDTH / 2

    // Clamp to slide boundaries
    fallbackTop = Math.max(slideRect.top, Math.min(fallbackTop, slideRect.bottom - TOOLBAR_HEIGHT))
    fallbackLeft = Math.max(slideRect.left, Math.min(fallbackLeft, slideRect.right - TOOLBAR_WIDTH))

    return {
      top: fallbackTop,
      left: fallbackLeft,
      placement: "fallback",
    }
  }, [pixelPosition, parentSlideDimensions])

  const resizeHandles: { direction: ResizeDirection; cursor: string; position: string }[] = [
    { direction: "nw", cursor: "cursor-nwse-resize", position: "-top-1 -left-1" },
    { direction: "n", cursor: "cursor-ns-resize", position: "-top-1 left-1/2 transform -translate-x-1/2" },
    { direction: "ne", cursor: "cursor-nesw-resize", position: "-top-1 -right-1" },
    { direction: "w", cursor: "cursor-ew-resize", position: "top-1/2 -left-1 transform -translate-y-1/2" },
    { direction: "e", cursor: "cursor-ew-resize", position: "top-1/2 -right-1 transform -translate-y-1/2" },
    { direction: "sw", cursor: "cursor-nesw-resize", position: "-bottom-1 -left-1" },
    { direction: "s", cursor: "cursor-ns-resize", position: "-bottom-1 left-1/2 transform -translate-x-1/2" },
    { direction: "se", cursor: "cursor-nwse-resize", position: "-bottom-1 -right-1" },
  ]

  const toolbarPosition = getToolbarPosition()

  return (
    <>
      <div
        ref={elementRef}
        className={`absolute select-none group
          ${isSelected && !isEditing ? "ring-2 ring-blue-500 ring-opacity-70" : ""}
          ${isEditing ? "ring-2 ring-green-500 ring-opacity-70" : ""}
          ${isDragging ? "opacity-70" : ""}`}
        style={{
          left: `${pixelPosition.x}px`,
          top: `${pixelPosition.y}px`,
          width: `${pixelPosition.width}px`,
          height: `${pixelPosition.height}px`,
          zIndex: element.zIndex || (isEditing ? 101 : isSelected ? 100 : 1),
          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
          opacity: element.opacity !== undefined ? element.opacity : 1,
          cursor: isEditing ? "text" : isSelected && !isResizing ? "move" : "pointer",
        }}
        onMouseDown={handleMouseDownOnElement}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-full h-full relative" style={{ pointerEvents: isEditing ? "auto" : "none" }}>
          {children}
        </div>

        {isSelected && !isEditing && (
          <>
            {resizeHandles.map((handle) => (
              <div
                key={handle.direction}
                className={`absolute w-2.5 h-2.5 bg-blue-500 border border-white rounded-full ${handle.cursor} ${handle.position}`}
                onMouseDown={(e) => handleMouseDownOnResizeHandle(e, handle.direction)}
              />
            ))}
          </>
        )}
      </div>

      {/* Smart Floating Toolbar - Fixed container positioning */}
      {isEditing && element.type === "text" && (
        <div
          className="absolute z-[9999] pointer-events-auto"
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            width: "400px",
            height: "50px",
            // Remove any transforms or positioning that could cause content to escape
            position: "absolute",
            overflow: "visible",
          }}
        >
          <FloatingToolbar
            element={element as TextElementProps}
            onUpdate={handleTextUpdate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </div>
      )}
    </>
  )
}

export default ElementWrapper
