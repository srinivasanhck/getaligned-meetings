"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { SlideElement as SlideElementType, ImageSlideElement, HtmlSlideElement } from "@/types/slide"
import RichTextEditor from "@/components/rich-text/editor"
import { useCurrentEditor } from "@/components/rich-text/editor-context"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, X, Loader2 } from "lucide-react"
import ElementContextMenu from "./element-context-menu"
import { imageTracker, ImageTracker, type ImageLocation } from "@/lib/image-tracker"

interface SlideElementProps {
  element: SlideElementType
  isSelected: boolean
  onClick: () => void
  updatePosition: (x: number, y: number) => void
  updateSize: (width: number, height: number) => void
  updateContent: (elementId: string, content: Partial<SlideElementType>) => void
  onEditingChange: (isEditing: boolean, elementId: string) => void
  onDeleteElement?: (elementId: string) => void
  onEditElementWithAI?: (slideId: string, elementId: string) => void
  slideId: string
}

export default function SlideElement({
  element,
  isSelected,
  onClick,
  updatePosition,
  updateSize,
  updateContent,
  onEditingChange,
  onDeleteElement,
  onEditElementWithAI,
  slideId,
}: SlideElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initialHtml = element.type !== "image" && element.html ? element.html : "<p></p>"
  const liveHtmlRef = useRef(initialHtml)

  const [isEditing, setIsEditing] = useState(false)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { setEditor } = useCurrentEditor()

  const [elementContextMenu, setElementContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState("")
  const [resizeStartData, setResizeStartData] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
  })

  const isImageType = element.type === "image"
  const isShapeElement =
    element.type === "shape" || (element.type !== "image" && element.html?.includes("data-shape-id"))

  // Force re-render when element changes
  useEffect(() => {
    if (!isEditing && element.type !== "image" && element.html) {
      liveHtmlRef.current = element.html
    }

    // Log when element changes to verify updates
    console.log(`Element ${element.id} updated:`, element)
  }, [element, isEditing])

  useEffect(() => {
    onEditingChange(isEditing, element.id)
  }, [isEditing, element.id, onEditingChange])

  const getShapeEditableContent = (html: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const textElement = doc.querySelector(".shape-text")
    if (textElement) {
      const contentWrapper = textElement.querySelector("div")
      const innerHTML = contentWrapper ? contentWrapper.innerHTML.trim() : textElement.innerHTML.trim()
      if (innerHTML.includes("Add text") || innerHTML === "Add text" || innerHTML === "") {
        return '<p style="font-size:18px;color:#000000;text-align:center;"></p>'
      }
      if (innerHTML.includes("<p") || innerHTML.includes("<div") || innerHTML.includes("<br")) {
        return innerHTML
      }
      return `<p style="font-size:18px;color:#000000;text-align:center;">${innerHTML}</p>`
    }
    return '<p style="font-size:18px;color:#000000;text-align:center;"></p>'
  }

  const getShapeBackgroundOnly = (html: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const shapeContainer = doc.querySelector(".shape-container")
    if (shapeContainer) {
      const clonedContainer = shapeContainer.cloneNode(true) as HTMLElement
      const textElement = clonedContainer.querySelector(".shape-text")
      if (textElement) textElement.remove()
      return clonedContainer.outerHTML
    }
    return html
  }

  const getShapeIdFromHtml = (html: string): string => {
    const match = html.match(/data-shape-id="([^"]+)"/)
    return match ? match[1] : ""
  }

  const getShapeTextPosition = (shapeId: string) => {
    switch (shapeId) {
      case "triangle":
        return "top:25%;left:0;width:100%;height:50%;"
      case "right-triangle":
        return "top:30%;left:20%;width:60%;height:50%;"
      case "trapezoid":
        return "top:20%;left:0;width:100%;height:60%;"
      case "pentagon":
        return "top:10%;left:0;width:100%;height:80%;"
      case "hexagon":
        return "top:5%;left:0;width:100%;height:90%;"
      case "star":
        return "top:15%;left:0;width:100%;height:70%;"
      case "arrow-right":
        return "top:0;left:0;width:70%;height:100%;"
      case "speech-bubble":
        return "top:0;left:0;width:100%;height:75%;"
      default:
        return "top:0;left:0;width:100%;height:100%;"
    }
  }

  const updateShapeWithRichContent = (html: string, newContent: string): string => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const shapeContainer = doc.querySelector(".shape-container")
    if (shapeContainer) {
      let textElement = shapeContainer.querySelector(".shape-text")
      if (!textElement) {
        textElement = doc.createElement("div")
        textElement.className = "shape-text"
        const shapeId = getShapeIdFromHtml(html)
        const shapeTextPosition = getShapeTextPosition(shapeId)
        const initialStyle = `position:absolute;${shapeTextPosition}pointer-events:none;padding:8px;box-sizing:border-box;overflow:hidden;display:flex;align-items:center;justify-content:center;`
        textElement.setAttribute("style", initialStyle)
        shapeContainer.appendChild(textElement)
      }
      let contentWrapper = textElement.querySelector("div")
      if (!contentWrapper) {
        contentWrapper = doc.createElement("div")
        contentWrapper.style.cssText =
          "text-align:center;word-wrap:break-word;white-space:normal;line-height:1.4;max-width:100%;max-height:100%;overflow:hidden;"
        textElement.appendChild(contentWrapper)
      }
      contentWrapper.innerHTML = newContent
      const shapeId = getShapeIdFromHtml(html)
      const shapeTextPosition = getShapeTextPosition(shapeId)
      let style = textElement.getAttribute("style") || ""
      style = style
        .replace(/top:[^;]+;?/gi, "")
        .replace(/left:[^;]+;?/gi, "")
        .replace(/width:[^;]+;?/gi, "")
        .replace(/height:[^;]+;?/gi, "")
      style = `position:absolute;${shapeTextPosition}${style}`
      if (!style.includes("display:flex")) style += "display:flex;"
      if (!style.includes("align-items:center")) style += "align-items:center;"
      if (!style.includes("justify-content:center")) style += "justify-content:center;"
      if (!style.includes("overflow:hidden")) style += "overflow:hidden;"
      if (!style.includes("pointer-events:none")) style += "pointer-events:none;"
      textElement.setAttribute("style", style.trim())
    }
    return doc.body.innerHTML
  }

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isEditing && !showImageOptions) {
      if (isSelected) {
        if (isImageType) {
          setShowImageOptions(true)
        } else {
          if (isShapeElement && element.type !== "image" && element.html) {
            liveHtmlRef.current = getShapeEditableContent(element.html)
          } else if (element.type !== "image" && element.html) {
            liveHtmlRef.current = element.html
          }
          setIsEditing(true)
          setTimeout(() => contentRef.current?.focus(), 10)
        }
      } else {
        onClick()
      }
    }
  }

  const handleElementContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSelected) onClick()
    setElementContextMenu({ isOpen: true, position: { x: e.clientX, y: e.clientY } })
  }

  const closeElementContextMenu = () => setElementContextMenu({ ...elementContextMenu, isOpen: false })

  const handleEditElementWithAI = () => {
    closeElementContextMenu()
    if (onEditElementWithAI) onEditElementWithAI(slideId, element.id)
  }

  const handleRemoveElement = () => {
    closeElementContextMenu()
    if (onDeleteElement) onDeleteElement(element.id)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (element.type === "image") return

    let contentToSave = liveHtmlRef.current
      .replace(/<p><br><\/p>/g, "")
      .replace(/<p>\s*<\/p>/g, "")
      .trim()
    if (!contentToSave || contentToSave === "<p></p>") {
      contentToSave = '<p style="font-size:18px;color:#000000;text-align:center;">Add text</p>'
    }

    if (isShapeElement && element.html) {
      const updatedShapeHtml = updateShapeWithRichContent(element.html, contentToSave)
      updateContent(element.id, { html: updatedShapeHtml })
    } else {
      updateContent(element.id, { html: contentToSave })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false)
      setShowImageOptions(false)
      if (element.type !== "image" && element.html) liveHtmlRef.current = element.html
    }
  }

  const handleImageReplace = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file")
      return
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setUploadError("Image size must be less than 10MB")
      return
    }

    setIsUploadingImage(true)
    setUploadError(null)

    try {
      // Create local preview first
      const reader = new FileReader()
      reader.onload = (event) => {
        const localImageUrl = event.target?.result as string

        if (isImageType) {
          // Remove old image tracking if it was local
          const currentSrc = (element as ImageSlideElement).src
          if (ImageTracker.isLocalImage(currentSrc)) {
            const oldLocation: ImageLocation = {
              slideId: slideId,
              type: "element",
              elementId: element.id,
            }
            imageTracker.removeImageLocation(currentSrc, oldLocation)
          }

          // Add new image tracking
          const newLocation: ImageLocation = {
            slideId: slideId,
            type: "element",
            elementId: element.id,
          }
          imageTracker.addImage(localImageUrl, file, newLocation)

          // Update the image element with local URL (will be replaced with server URL on save)
          updateContent(element.id, {
            src: localImageUrl,
            alt: file.name,
          })
          setShowImageOptions(false)

          // Show success message
          const successToast = document.createElement("div")
          successToast.innerHTML = `
            <div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
              ✅ Image updated! Will be uploaded when you save.
            </div>
          `
          document.body.appendChild(successToast)
          setTimeout(() => {
            if (document.body.contains(successToast)) {
              document.body.removeChild(successToast)
            }
          }, 3000)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error handling image:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to process image")
    } finally {
      setIsUploadingImage(false)
      // Clear the file input
      e.target.value = ""
    }
  }

  const handleImageDelete = () => {
    if (onDeleteElement) onDeleteElement(element.id)
    setShowImageOptions(false)
  }

  const handleDragHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragStartPos({ x: e.clientX - element.x, y: e.clientY - element.y })
  }

  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
    setResizeStartData({
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      mouseX: e.clientX,
      mouseY: e.clientY,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStartPos.x, 1280 - element.width))
        const newY = Math.max(0, Math.min(e.clientY - dragStartPos.y, 720 - element.height))
        if (elementRef.current) {
          elementRef.current.style.left = `${newX}px`
          elementRef.current.style.top = `${newY}px`
        }
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStartData.mouseX
        const deltaY = e.clientY - resizeStartData.mouseY
        let newWidth = resizeStartData.width,
          newHeight = resizeStartData.height,
          newX = resizeStartData.x,
          newY = resizeStartData.y
        switch (resizeDirection) {
          case "top-left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "top-right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "bottom-left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            break
          case "bottom-right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            break
          case "top":
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            break
          case "bottom":
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            break
          case "left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            break
        }
        newX = Math.max(0, Math.min(newX, 1280 - newWidth))
        newY = Math.max(0, Math.min(newY, 720 - newHeight))
        if (elementRef.current) {
          elementRef.current.style.width = `${newWidth}px`
          elementRef.current.style.height = `${newHeight}px`
          elementRef.current.style.left = `${newX}px`
          elementRef.current.style.top = `${newY}px`
        }
      }
    }
    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(e.clientX - dragStartPos.x, 1280 - element.width))
        const newY = Math.max(0, Math.min(e.clientY - dragStartPos.y, 720 - element.height))
        updatePosition(newX, newY)
        setIsDragging(false)
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStartData.mouseX
        const deltaY = e.clientY - resizeStartData.mouseY
        let newWidth = resizeStartData.width,
          newHeight = resizeStartData.height,
          newX = resizeStartData.x,
          newY = resizeStartData.y
        switch (resizeDirection) {
          case "top-left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "top-right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "bottom-left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            break
          case "bottom-right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            break
          case "top":
            newHeight = Math.max(50, resizeStartData.height - deltaY)
            newY = resizeStartData.y + (resizeStartData.height - newHeight)
            break
          case "right":
            newWidth = Math.max(50, resizeStartData.width + deltaX)
            break
          case "bottom":
            newHeight = Math.max(50, resizeStartData.height + deltaY)
            break
          case "left":
            newWidth = Math.max(50, resizeStartData.width - deltaX)
            newX = resizeStartData.x + (resizeStartData.width - newWidth)
            break
        }
        newX = Math.max(0, Math.min(newX, 1280 - newWidth))
        newY = Math.max(0, Math.min(newY, 720 - newHeight))
        updatePosition(newX, newY)
        updateSize(newWidth, newHeight)
        setIsResizing(false)
        setResizeDirection("")
      }
    }
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    isDragging,
    isResizing,
    dragStartPos,
    resizeDirection,
    resizeStartData,
    element.width,
    element.height,
    element.x,
    element.y,
    updatePosition,
    updateSize,
  ])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showImageOptions && elementRef.current && !elementRef.current.contains(e.target as Node)) {
        setShowImageOptions(false)
      }
    }
    if (showImageOptions) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showImageOptions])

  const el = element as ImageSlideElement

  return (
    <div
      ref={elementRef}
      className={`absolute group ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
      onClick={handleElementClick}
      onContextMenu={handleElementContextMenu}
      onKeyDown={handleKeyDown}
      data-element-id={element.id}
    >
      {isEditing && !isImageType ? (
        <div className="w-full h-full relative">
          {isShapeElement && element.type !== "image" && element.html && (
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              dangerouslySetInnerHTML={{ __html: getShapeBackgroundOnly(element.html) }}
            />
          )}
          <div
            className={`${isShapeElement ? "absolute inset-0" : "w-full h-full"}`}
            style={
              isShapeElement
                ? {
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "auto",
                  }
                : {}
            }
          >
            <div className={`${isShapeElement ? "w-full max-w-full" : "w-full h-full"}`}>
              <RichTextEditor
                initialHTML={liveHtmlRef.current}
                onUpdateHTML={(html) => (liveHtmlRef.current = html)}
                onBlur={handleBlur}
                onReady={(ed) => setEditor(ed)}
              />
            </div>
          </div>
        </div>
      ) : isImageType ? (
        <div className="w-full h-full relative flex flex-col items-center justify-center">
          <img
            src={el.src || "/placeholder.svg"}
            alt={el.alt || "Slide image"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              ...el.style,
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: (element as HtmlSlideElement).html }} />
      )}

      {showImageOptions && isImageType && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg flex flex-col gap-3 min-w-[200px]">
            {uploadError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded border">{uploadError}</div>}

            <Button
              onClick={handleImageReplace}
              className="flex items-center gap-2"
              variant="outline"
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Replace Image
                </>
              )}
            </Button>

            <Button
              onClick={handleImageDelete}
              className="flex items-center gap-2"
              variant="outline"
              disabled={isUploadingImage}
            >
              <Trash2 className="h-4 w-4" /> Delete Image
            </Button>

            <Button
              onClick={() => {
                setShowImageOptions(false)
                setUploadError(null)
              }}
              className="flex items-center gap-2"
              variant="ghost"
              disabled={isUploadingImage}
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      <ElementContextMenu
        isOpen={elementContextMenu.isOpen}
        position={elementContextMenu.position}
        onClose={closeElementContextMenu}
        onEditWithAI={handleEditElementWithAI}
        onRemoveElement={handleRemoveElement}
      />
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      {isSelected && !isEditing && !showImageOptions && (
        <>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full cursor-move flex items-center justify-center z-10"
            onMouseDown={handleDragHandleMouseDown}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M5 9l7-7 7 7M5 15l7 7 7-7" />
            </svg>
          </div>
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-left")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "top-right")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-left")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom-right")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "top")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "left")}
          />
          <div
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-10"
            onMouseDown={(e) => handleResizeMouseDown(e, "right")}
          />
        </>
      )}
    </div>
  )
}
