"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface TableDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreateTable: (rows: number, cols: number) => void
}

export default function TableDialog({ isOpen, onClose, onCreateTable }: TableDialogProps) {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 })
  // Initialize with a default, e.g., 3x3, so "Insert Table" can be clicked directly
  const [selectedRows, setSelectedRows] = useState(3)
  const [selectedCols, setSelectedCols] = useState(3)
  const dialogRef = useRef<HTMLDivElement>(null)

  const maxRows = 8
  const maxCols = 10

  // Reset selection when dialog opens, or reflect current selection
  useEffect(() => {
    if (isOpen) {
      console.log("TableDialog: Opened. Initializing selectedRows/Cols to 3x3.")
      setSelectedRows(3)
      setSelectedCols(3)
      setHoveredCell({ row: 2, col: 2 }) // Corresponds to 3x3
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        console.log("TableDialog: Clicked outside, closing.")
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log("TableDialog: Escape pressed, closing.")
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const handleCellHover = (row: number, col: number) => {
    // console.log(`TableDialog: Hovering over cell: ${row + 1}x${col + 1}`); // Too noisy
    setHoveredCell({ row, col })
  }

  const handleCellClick = (row: number, col: number) => {
    console.log(`TableDialog: Grid cell clicked: ${row + 1}x${col + 1}`)
    setSelectedRows(row + 1)
    setSelectedCols(col + 1)
    // Optionally, immediately create table on grid click:
    // handleCreateTableInternal(row + 1, col + 1);
  }

  const handleCreateTableInternal = (r: number, c: number) => {
    console.log(`TableDialog: handleCreateTableInternal called with ${r}x${c}.`)
    if (r > 0 && c > 0) {
      onCreateTable(r, c)
      // onClose(); // The parent (InsertMenu) will call its own onClose after successful insertion.
      // The dialog's onClose is called by InsertMenu setting tableDialogOpen to false.
    } else {
      console.error("TableDialog: Invalid rows or columns for table creation.")
    }
  }

  if (!isOpen) return null
  console.log("TableDialog: Rendering.")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      {" "}
      {/* Increased z-index */}
      <div
        ref={dialogRef}
        className="bg-white rounded-lg shadow-xl p-6 w-[400px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside dialog from closing it via handleClickOutside
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Insert Table</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("TableDialog: Close button clicked.")
              onClose()
            }}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Select table size:</p>
          <div className="text-sm font-medium mb-2">
            {hoveredCell.row + 1} x {hoveredCell.col + 1}
            {(selectedRows !== hoveredCell.row + 1 || selectedCols !== hoveredCell.col + 1) &&
              ` (Selected: ${selectedRows}x${selectedCols})`}
          </div>

          <div className="border border-gray-200 rounded p-2 bg-gray-50">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: maxRows }, (_, rowIndex) =>
                Array.from({ length: maxCols }, (_, colIndex) => {
                  const isHovered = rowIndex <= hoveredCell.row && colIndex <= hoveredCell.col
                  // Highlight cells that are part of the currently *selected* dimensions
                  const isActiveSelection = rowIndex < selectedRows && colIndex < selectedCols
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      className={`w-6 h-6 border transition-colors ${
                        isHovered
                          ? "bg-blue-500 border-blue-600" // Hovered cells are always blue
                          : isActiveSelection
                            ? "bg-blue-300 border-blue-400" // Actively selected cells (persisted)
                            : "bg-white border-gray-300" // Default
                      } hover:ring-2 hover:ring-blue-400`}
                      onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      aria-label={`${rowIndex + 1}x${colIndex + 1} table`}
                    />
                  )
                }),
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <label htmlFor="table-rows" className="text-sm font-medium">
            Rows:
          </label>
          <input
            id="table-rows"
            type="number"
            min="1"
            max="20"
            value={selectedRows}
            onChange={(e) => setSelectedRows(Math.max(1, Math.min(20, Number.parseInt(e.target.value) || 1)))}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <label htmlFor="table-cols" className="text-sm font-medium">
            Columns:
          </label>
          <input
            id="table-cols"
            type="number"
            min="1"
            max="20"
            value={selectedCols}
            onChange={(e) => setSelectedCols(Math.max(1, Math.min(20, Number.parseInt(e.target.value) || 1)))}
            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              console.log("TableDialog: Cancel button clicked.")
              onClose()
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              console.log("TableDialog: 'Insert Table' button clicked.")
              handleCreateTableInternal(selectedRows, selectedCols)
            }}
          >
            Insert Table
          </Button>
        </div>
      </div>
    </div>
  )
}
