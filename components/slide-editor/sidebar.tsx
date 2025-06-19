"use client"

import type { Slide } from "@/types/slide"
import SlideThumbnail from "./slide-thumbnail"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  slides: Slide[]
  currentSlideIndex: number
  onSlideSelect: (index: number) => void
  onAddSlide?: () => void
  onDeleteSlide?: (index: number) => void
  onDuplicateSlide?: (index: number) => void
}

export default function Sidebar({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
}: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Slides</h2>
        {onAddSlide && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onAddSlide} title="Add new slide">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 p-2 space-y-2">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isSelected={index === currentSlideIndex}
            onClick={() => onSlideSelect(index)}
            onDelete={onDeleteSlide}
            onDuplicate={onDuplicateSlide}
          />
        ))}
      </div>
    </div>
  )
}
