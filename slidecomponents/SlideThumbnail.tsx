"use client"

import type React from "react"
import type { Slide } from "@/types"
import { cn } from "@/lib/utils"

interface SlideThumbnailProps {
  slide: Slide
  index: number
  isActive: boolean
  onClick: () => void
}

const SlideThumbnail: React.FC<SlideThumbnailProps> = ({ slide, index, isActive, onClick }) => {
  const backgroundIsImage = slide.background.type === "image" && slide.background.value
  const backgroundIsColorClass = slide.background.type === "color" && slide.background.value?.startsWith("bg-")

  const backgroundStyle: React.CSSProperties = {}
  let backgroundClasses = "bg-slate-700" // Default dark background for thumbnail

  if (backgroundIsImage) {
    backgroundStyle.backgroundImage = `url(${slide.background.value})`
    backgroundStyle.backgroundSize = slide.background.imageFit || "cover"
    backgroundStyle.backgroundPosition = "center"
    backgroundClasses = "" // Clear default if image is set
  } else if (slide.background.type === "color" && !backgroundIsColorClass) {
    backgroundStyle.backgroundColor = slide.background.value || "#334155" // slate-700
    backgroundClasses = "" // Clear default if specific color is set
  } else if (backgroundIsColorClass) {
    backgroundClasses = slide.background.value!
  }

  // Render a miniature version of the slide elements
  const renderThumbnailElement = (element: any, elementIndex: number) => {
    const elementStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      fontSize: "6px", // Very small font for thumbnail
      lineHeight: "1.1",
      overflow: "hidden",
      pointerEvents: "none",
    }

    switch (element.type) {
      case "text":
        return (
          <div
            key={elementIndex}
            style={{
              ...elementStyle,
              color: element.color || slide.defaultElementTextColor || "#FFFFFF",
              fontWeight: element.fontWeight || "normal",
              textAlign: element.textAlign || "left",
              backgroundColor: element.backgroundColor || "transparent",
            }}
            className="text-[4px] leading-tight"
          >
            {element.content?.replace(/<[^>]*>/g, "") || ""} {/* Strip HTML tags for thumbnail */}
          </div>
        )

      case "image":
        return (
          <div
            key={elementIndex}
            style={{
              ...elementStyle,
              backgroundImage: `url(${element.src})`,
              backgroundSize: element.objectFit || "cover",
              backgroundPosition: "center",
              backgroundColor: "#e2e8f0",
            }}
            className="rounded-[1px]"
          />
        )

      case "shape":
        return (
          <div
            key={elementIndex}
            style={{
              ...elementStyle,
              backgroundColor: element.fillColor || "#64748b",
              border: element.strokeWidth
                ? `${Math.max(0.5, element.strokeWidth * 0.1)}px solid ${element.strokeColor || "#334155"}`
                : "none",
            }}
            className="rounded-[1px]"
          />
        )

      case "chart":
        return (
          <div
            key={elementIndex}
            style={{
              ...elementStyle,
              backgroundColor: "#f8fafc",
              border: "0.5px solid #e2e8f0",
            }}
            className="rounded-[1px] flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-[0.5px]" />
          </div>
        )

      default:
        return (
          <div
            key={elementIndex}
            style={{
              ...elementStyle,
              backgroundColor: "#f1f5f9",
              border: "0.5px solid #cbd5e1",
            }}
            className="rounded-[1px]"
          />
        )
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        `aspect-[16/9] w-full rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 relative group`,
        isActive ? "border-blue-500 scale-100 shadow-md" : "border-slate-300 hover:border-slate-400",
        backgroundClasses,
      )}
      style={backgroundStyle}
      title={slide.titleForThumbnail || `Slide ${index + 1}`}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>

      {/* Render actual slide elements in miniature */}
      <div className="absolute inset-0 overflow-hidden">
        {slide.elements.map((element, elementIndex) => renderThumbnailElement(element, elementIndex))}
      </div>

      {/* Slide number indicator */}
      <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded-tl-sm">
        {index + 1}
      </div>
    </button>
  )
}

export default SlideThumbnail
