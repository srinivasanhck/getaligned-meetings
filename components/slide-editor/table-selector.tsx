"use client"

import type React from "react"

import { useState, useRef, useEffect, forwardRef } from "react"

interface TableSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTable: (rows: number, cols: number) => void
  onMouseLeave?: (event: React.MouseEvent) => void
  triggerRect?: DOMRect
}

const TableSelector = forwardRef<HTMLDivElement, TableSelectorProps>(
  ({ isOpen, onClose, onSelectTable, onMouseLeave, triggerRect }, ref) => {
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 })
    const internalRef = useRef<HTMLDivElement>(null)

    // Use the forwarded ref or fall back to internal ref
    const selectorRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    const maxRows = 8
    const maxCols = 10

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
          onClose()
        }
      }

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isOpen, onClose, selectorRef])

    const handleCellHover = (row: number, col: number) => {
      setHoveredCell({ row, col })
    }

    const handleCellClick = (row: number, col: number) => {
      onSelectTable(row + 1, col + 1) // +1 because we're 0-indexed
      onClose()
    }

    const getPosition = () => {
      if (!triggerRect) {
        return { left: 0, top: 0 }
      }

      return {
        left: triggerRect.right + 8, // 8px offset from the trigger
        top: triggerRect.top,
      }
    }

    if (!isOpen) return null

    const position = getPosition()

    return (
      <div
        ref={selectorRef}
        className="fixed bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-[60]"
        style={{
          left: position.left,
          top: position.top,
        }}
        onMouseLeave={onMouseLeave}
      >
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-700 mb-1">Insert Table</div>
          <div className="text-xs text-gray-500">
            {hoveredCell.row + 1} x {hoveredCell.col + 1} table
          </div>
        </div>

        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
          {Array.from({ length: maxRows }, (_, rowIndex) =>
            Array.from({ length: maxCols }, (_, colIndex) => {
              const isSelected = rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-4 h-4 border border-gray-300 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-500 border-blue-600" : "bg-white hover:bg-gray-100"
                  }`}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                />
              )
            }),
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            className="text-xs text-blue-600 hover:text-blue-800 underline"
            onClick={() => {
              // For now, just insert a default 3x3 table
              onSelectTable(3, 3)
              onClose()
            }}
          >
            Insert custom table...
          </button>
        </div>
      </div>
    )
  },
)

TableSelector.displayName = "TableSelector"

export default TableSelector
