"use client"

import type React from "react"

import { useState, useRef } from "react"
import { basicShapes } from "./shape-data"

interface ShapeElementProps {
  shapeId: string
  content?: string
  style?: React.CSSProperties
  className?: string
  isEditable?: boolean
  onContentChange?: (content: string) => void
}

export default function ShapeElement({
  shapeId,
  content = "",
  style = {},
  className = "",
  isEditable = false,
  onContentChange,
}: ShapeElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Find the shape definition
  const shapeDefinition = basicShapes.find((shape) => shape.id === shapeId)

  if (!shapeDefinition) {
    return <div className="bg-red-100 p-2 text-red-600">Shape not found</div>
  }

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true)
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.focus()
        }
      }, 10)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (onContentChange && contentRef.current) {
      onContentChange(contentRef.current.innerHTML)
    }
  }

  // Render based on shape type
  if (shapeDefinition.type === "svg") {
    return (
      <div className={`relative w-full h-full ${className}`} style={style}>
        <svg viewBox={shapeDefinition.viewBox} className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path d={shapeDefinition.svgPath} fill="#ffffff" stroke="#1a73e8" strokeWidth="2" />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden"
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <div
              ref={contentRef}
              className="w-full h-full outline-none"
              contentEditable
              dangerouslySetInnerHTML={{ __html: content }}
              onBlur={handleBlur}
            />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          )}
        </div>
      </div>
    )
  } else {
    // CSS-based shape
    return (
      <div
        className={`relative ${className}`}
        style={{
          ...shapeDefinition.cssProperties,
          ...style,
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <div
            ref={contentRef}
            className="w-full h-full outline-none p-4"
            contentEditable
            dangerouslySetInnerHTML={{ __html: content }}
            onBlur={handleBlur}
          />
        ) : (
          <div className="w-full h-full p-4" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    )
  }
}
