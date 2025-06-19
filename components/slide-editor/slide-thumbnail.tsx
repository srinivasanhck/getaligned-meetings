"use client"

import type React from "react"
import type { Slide, HtmlSlideElement, ImageSlideElement } from "@/types/slide"
import { useEffect, useRef, useState } from "react"
import { MoreVertical, Trash2, Copy } from "lucide-react"

interface SlideThumbnailProps {
  slide: Slide
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete?: (index: number) => void
  onDuplicate?: (index: number) => void
}

export default function SlideThumbnail({
  slide,
  index,
  isSelected,
  onClick,
  onDelete,
  onDuplicate,
}: SlideThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [isRendered, setIsRendered] = useState(false)

  // Helper function to scale HTML content with better text handling
  const scaleHTMLContent = (element: HTMLElement, scaleFactor: number) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_ELEMENT, null)
    const elements: HTMLElement[] = [element]
    let node: Node | null
    while ((node = walker.nextNode())) {
      elements.push(node as HTMLElement)
    }

    elements.forEach((el) => {
      // Handle different element types with appropriate base sizes
      if (el.tagName.match(/^H[1-6]$/)) {
        // Headings - make them more prominent in thumbnails
        const headingLevel = Number.parseInt(el.tagName.charAt(1))
        const baseSize = Math.max(8, 16 - (headingLevel - 1) * 2) // Larger base size for thumbnails
        el.style.fontSize = `${baseSize * scaleFactor}px`
        el.style.fontWeight = "bold"
        el.style.lineHeight = `${(baseSize + 2) * scaleFactor}px`
        el.style.margin = "0"
        el.style.padding = "0"
      } else if (el.tagName === "P") {
        // Paragraphs - ensure readable size
        const baseSize = Math.max(6, 12 * scaleFactor)
        el.style.fontSize = `${baseSize}px`
        el.style.lineHeight = `${baseSize + 2}px`
        el.style.margin = `${Math.max(1, 2 * scaleFactor)}px 0`
        el.style.padding = "0"
      } else if (el.tagName === "UL" || el.tagName === "OL") {
        // Lists
        const baseSize = Math.max(5, 10 * scaleFactor)
        el.style.fontSize = `${baseSize}px`
        el.style.lineHeight = `${baseSize + 2}px`
        el.style.margin = `${Math.max(1, 2 * scaleFactor)}px 0`
        el.style.paddingLeft = `${Math.max(8, 12 * scaleFactor)}px`

        const listItems = el.querySelectorAll("li")
        listItems.forEach((li) => {
          const liEl = li as HTMLElement
          liEl.style.fontSize = `${baseSize}px`
          liEl.style.margin = `${Math.max(0, 1 * scaleFactor)}px 0`
        })
      } else if (el.tagName === "TABLE") {
        // Tables - make them more visible
        const baseSize = Math.max(4, 8 * scaleFactor)
        el.style.fontSize = `${baseSize}px`
        el.style.borderCollapse = "collapse"
        el.style.width = "100%"

        const cells = el.querySelectorAll("td, th")
        cells.forEach((cell) => {
          const cellEl = cell as HTMLElement
          cellEl.style.padding = `${Math.max(1, 2 * scaleFactor)}px`
          cellEl.style.fontSize = `${baseSize}px`
          cellEl.style.border = `${Math.max(0.5, 1 * scaleFactor)}px solid #ccc`
        })
      } else {
        // Generic elements - ensure minimum readable size
        const currentFontSize = window.getComputedStyle(el).fontSize
        if (currentFontSize && currentFontSize !== "0px") {
          const currentSize = Number.parseFloat(currentFontSize)
          const newSize = Math.max(4, currentSize * scaleFactor)
          el.style.fontSize = `${newSize}px`
        }
      }

      // Scale padding and margins more conservatively
      const properties = [
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "marginTop",
        "marginRight",
        "marginBottom",
        "marginLeft",
      ]
      properties.forEach((prop) => {
        const value = (el.style as any)[prop]
        if (value && value.includes("px")) {
          const numValue = Number.parseFloat(value)
          if (!isNaN(numValue)) {
            ;(el.style as any)[prop] = `${Math.max(0, numValue * scaleFactor * 0.5)}px` // Reduce padding/margin scaling
          }
        }
      })

      // Handle border scaling
      const borderWidth = el.style.borderWidth
      if (borderWidth && borderWidth.includes("px")) {
        const numValue = Number.parseFloat(borderWidth)
        if (!isNaN(numValue)) {
          el.style.borderWidth = `${Math.max(0.5, numValue * scaleFactor)}px`
        }
      }
    })
  }

  // Create a miniature version of the slide using DOM rendering
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous content
    container.innerHTML = ""

    // Use larger thumbnail size for better readability
    const thumbnailWidth = 200
    const thumbnailHeight = 112.5 // 16:9 aspect ratio

    // Create the slide container
    const slideDiv = document.createElement("div")
    slideDiv.style.cssText = `
      width: ${thumbnailWidth}px;
      height: ${thumbnailHeight}px;
      position: relative;
      overflow: hidden;
      background: ${slide.background};
      font-family: Arial, sans-serif;
      transform-origin: top left;
      border-radius: 4px;
      box-sizing: border-box;
    `

    // Handle background images
    if (slide.background.includes("url(")) {
      const urlMatch = slide.background.match(/url$$['"]?([^'"]+)['"]?$$/)
      if (urlMatch && urlMatch[1]) {
        slideDiv.style.backgroundImage = `url(${urlMatch[1]})`
        slideDiv.style.backgroundSize = "cover"
        slideDiv.style.backgroundPosition = "center"
        slideDiv.style.backgroundRepeat = "no-repeat"
      }
    }

    // Calculate scale factors
    const scaleX = thumbnailWidth / 1280
    const scaleY = thumbnailHeight / 720
    const scaleFactor = Math.min(scaleX, scaleY)

    // Render each element
    slide.content.forEach((element) => {
      const elementDiv = document.createElement("div")

      const scaledX = element.x * scaleX
      const scaledY = element.y * scaleY
      const scaledWidth = element.width * scaleX
      const scaledHeight = element.height * scaleY

      elementDiv.style.cssText = `
        position: absolute;
        left: ${scaledX}px;
        top: ${scaledY}px;
        width: ${scaledWidth}px;
        height: ${scaledHeight}px;
        overflow: hidden;
        pointer-events: none;
        box-sizing: border-box;
      `

      if (element.type === "image") {
        const imgEl = element as ImageSlideElement
        const img = document.createElement("img")
        img.src = imgEl.src
        img.alt = imgEl.alt || ""
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: ${imgEl.style?.objectFit || "cover"};
          border-radius: ${imgEl.style?.borderRadius || "0"};
        `

        // Apply any additional styles
        if (imgEl.style) {
          Object.entries(imgEl.style).forEach(([key, value]) => {
            if (typeof value === "string") {
              img.style.setProperty(key.replace(/([A-Z])/g, "-$1").toLowerCase(), value)
            }
          })
        }

        elementDiv.appendChild(img)
      } else {
        const htmlEl = element as HtmlSlideElement
        if (htmlEl.html) {
          // Create a scaled version of the HTML content
          const contentDiv = document.createElement("div")
          contentDiv.innerHTML = htmlEl.html
          contentDiv.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: hidden;
            box-sizing: border-box;
          `

          // Scale the content with better text handling
          scaleHTMLContent(contentDiv, scaleFactor)

          elementDiv.appendChild(contentDiv)
        }
      }

      slideDiv.appendChild(elementDiv)
    })

    // Scale the entire slide to fit the container while maintaining aspect ratio
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    const containerAspectRatio = containerWidth / containerHeight
    const slideAspectRatio = thumbnailWidth / thumbnailHeight

    let finalScale = 1
    if (containerAspectRatio > slideAspectRatio) {
      // Container is wider, scale based on height
      finalScale = containerHeight / thumbnailHeight
    } else {
      // Container is taller, scale based on width
      finalScale = containerWidth / thumbnailWidth
    }

    slideDiv.style.transform = `scale(${finalScale})`
    slideDiv.style.transformOrigin = "top left"

    container.appendChild(slideDiv)
    setIsRendered(true)
  }, [slide])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) onDelete(index)
    setShowMenu(false)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDuplicate) onDuplicate(index)
    setShowMenu(false)
  }

  return (
    <div
      className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
        isSelected ? "border-blue-500" : "border-transparent"
      } hover:border-blue-300 transition-colors group bg-white`}
      onClick={onClick}
    >
      {/* Slide number */}
      <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded z-20">{index + 1}</div>

      {/* Menu button */}
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={handleMenuClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white p-1 rounded hover:bg-gray-700"
        >
          <MoreVertical className="h-3 w-3" />
        </button>
        {showMenu && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg py-1 min-w-[120px] z-30">
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Copy className="h-3 w-3" /> Duplicate
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-3 py-1 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Slide content container */}
      <div className="w-full aspect-[16/9] relative bg-gray-50">
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{
            overflow: "hidden",
          }}
        />

        {/* Loading state */}
        {!isRendered && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-xs text-gray-500">Loading...</div>
          </div>
        )}
      </div>
    </div>
  )
}
