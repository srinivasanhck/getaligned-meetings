"use client"

import type React from "react"
import type { Slide } from "@/types"
import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

interface PresentationInitialThumbnailProps {
  slide?: Slide
  className?: string
}

const PresentationInitialThumbnail: React.FC<PresentationInitialThumbnailProps> = ({
  slide,
  className = "w-full h-32",
}) => {
  // Fallback to purple gradient if no slide data
  if (!slide || !slide.elements || slide.elements.length === 0) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center",
          className,
        )}
      >
        <div className="text-center">
          <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <span className="text-xs text-purple-600 font-medium">Presentation</span>
        </div>
      </div>
    )
  }

  const backgroundIsImage = slide.background?.type === "image" && slide.background.value
  const backgroundIsColorClass = slide.background?.type === "color" && slide.background.value?.startsWith("bg-")

  const backgroundStyle: React.CSSProperties = {}
  let backgroundClasses = "bg-slate-700" // Default dark background for thumbnail

  if (backgroundIsImage) {
    backgroundStyle.backgroundImage = `url(${slide.background.value})`
    backgroundStyle.backgroundSize = slide.background.imageFit || "cover"
    backgroundStyle.backgroundPosition = "center"
    backgroundClasses = "" // Clear default if image is set
  } else if (slide.background?.type === "color" && !backgroundIsColorClass) {
    backgroundStyle.backgroundColor = slide.background.value || "#334155" // slate-700
    backgroundClasses = "" // Clear default if specific color is set
  } else if (backgroundIsColorClass) {
    backgroundClasses = slide.background.value!
  }

  // Render a miniature version of the slide elements
  const renderThumbnailElement = (element: any, elementIndex: number) => {
    const elementStyle: React.CSSProperties = {
      position: "absolute",
      left: `${element.x || 0}%`,
      top: `${element.y || 0}%`,
      width: `${element.width || 100}%`,
      height: `${element.height || 20}%`,
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
    <div
      className={cn("rounded-lg overflow-hidden relative border border-gray-200", backgroundClasses, className)}
      style={backgroundStyle}
    >
      {/* Subtle overlay for better contrast */}
      <div className="absolute inset-0 bg-black/5"></div>

      {/* Render actual slide elements in miniature */}
      <div className="absolute inset-0 overflow-hidden">
        {slide.elements.map((element, elementIndex) => renderThumbnailElement(element, elementIndex))}
      </div>
    </div>
  )
}

export default PresentationInitialThumbnail
