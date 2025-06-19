"use client"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"
import { shapeCategories } from "./shape-data"
import { ChevronRight } from "lucide-react"

interface ShapeMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelectShape: (shapeId: string) => void
}

export default function ShapeMenu({ isOpen, onClose, onSelectShape }: ShapeMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const categories = [
    { id: "basic", name: "Basic Shapes" },
    { id: "geometric", name: "Geometric" },
    { id: "arrows", name: "Arrows" },
    { id: "callouts", name: "Callouts" },
  ]

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId === activeCategory ? null : categoryId)
  }

  const handleShapeClick = (shapeId: string) => {
    onSelectShape(shapeId)
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="absolute top-10 left-16 z-50 w-96 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {categories.map((category) => (
          <div key={category.id} className="border-b border-gray-200 last:border-b-0">
            <div
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className="text-sm font-medium">{category.name}</span>
              <ChevronRight
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  activeCategory === category.id ? "rotate-90" : ""
                }`}
              />
            </div>
            {activeCategory === category.id && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50">
                {shapeCategories[category.id as keyof typeof shapeCategories].map((shape) => (
                  <div
                    key={shape.id}
                    className="aspect-square border border-gray-300 rounded flex items-center justify-center bg-white hover:border-blue-500 cursor-pointer"
                    onClick={() => handleShapeClick(shape.id)}
                  >
                    {shape.type === "svg" ? (
                      <svg
                        viewBox={shape.viewBox}
                        className="w-3/4 h-3/4"
                        fill="#ffffff"
                        stroke="#000000"
                        strokeWidth="2"
                      >
                        <path d={shape.svgPath} />
                      </svg>
                    ) : (
                      <div
                        className="w-3/4 h-3/4"
                        style={{
                          ...shape.cssProperties,
                          backgroundColor: "#ffffff",
                          border: "2px solid #000000",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
