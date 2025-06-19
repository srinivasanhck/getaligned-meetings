"use client"

import { useRef, useEffect } from "react"
import { Trash2, Sparkles } from "lucide-react"

interface ElementContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  onClose: () => void
  onEditWithAI: () => void
  onRemoveElement: () => void
}

export default function ElementContextMenu({
  isOpen,
  position,
  onClose,
  onEditWithAI,
  onRemoveElement,
}: ElementContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("contextmenu", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("contextmenu", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Calculate adjusted position to keep menu within viewport
  const getAdjustedPosition = () => {
    if (!menuRef.current) return position

    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let adjustedX = position.x
    let adjustedY = position.y

    // Adjust horizontal position if menu would go off-screen
    if (position.x + menuRect.width > viewportWidth) {
      adjustedX = position.x - menuRect.width
    }

    // Adjust vertical position if menu would go off-screen
    if (position.y + menuRect.height > viewportHeight) {
      adjustedY = position.y - menuRect.height
    }

    // Ensure menu doesn't go off the left or top edge
    adjustedX = Math.max(10, adjustedX)
    adjustedY = Math.max(10, adjustedY)

    return { x: adjustedX, y: adjustedY }
  }

  if (!isOpen) return null

  const adjustedPosition = getAdjustedPosition()

  const handleEditWithAI = () => {
    onClose()
    onEditWithAI()
  }

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-[180px]"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
        onClick={handleEditWithAI}
      >
        <Sparkles className="h-4 w-4 text-purple-600" />
        <span>Edit element with AI</span>
      </button>
      <div className="border-t border-gray-200 my-1"></div>
      <button
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
        onClick={onRemoveElement}
      >
        <Trash2 className="h-4 w-4" />
        <span>Remove element</span>
      </button>
    </div>
  )
}
