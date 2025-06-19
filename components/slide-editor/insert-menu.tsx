"use client"
import { useRef, useEffect, useState } from "react"
import type React from "react"

import {
  ImageIcon,
  Type,
  Square,
  Grid3x3,
  BarChart4,
  LineChart,
  PenTool,
  Video,
  Music,
  Hash,
  Sparkles,
  Link,
  MessageSquare,
  Plus,
  LayoutTemplate,
  ListOrdered,
  FileBox,
  ChevronRight,
  Building2,
} from "lucide-react"
import TableDialog from "./table-dialog"
import { shapeCategories } from "./shapes/shape-data"

interface InsertMenuProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (type: string, data?: any) => void
}

export default function InsertMenu({ isOpen, onClose, onInsert }: InsertMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)

  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [activeShapeCategory, setActiveShapeCategory] = useState<string | null>(null) // Renamed for clarity

  const [submenuPosition, setSubmenuPosition] = useState({ x: 0, y: 0 })
  const [shapeSubmenuPosition, setShapeSubmenuPosition] = useState({ x: 0, y: 0 })

  const closeSubmenusTimerRef = useRef<NodeJS.Timeout | null>(null)

  const clearCloseSubmenusTimer = () => {
    if (closeSubmenusTimerRef.current) {
      clearTimeout(closeSubmenusTimerRef.current)
      closeSubmenusTimerRef.current = null
    }
  }

  const startCloseSubmenusTimer = () => {
    clearCloseSubmenusTimer()
    closeSubmenusTimerRef.current = setTimeout(() => {
      setHoveredItem(null)
      setActiveShapeCategory(null)
    }, 250) // Slightly increased delay for smoother transitions
  }

  useEffect(() => {
    // Cleanup timer on unmount or when main menu closes
    return () => {
      clearCloseSubmenusTimer()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isTableDialogEvent = (event.target as HTMLElement).closest(".fixed.inset-0.bg-black")
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && !isTableDialogEvent) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      // When the main menu is closed, ensure submenus are also cleared
      setHoveredItem(null)
      setActiveShapeCategory(null)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, tableDialogOpen])

  const handleCreateTableFromDialog = (rows: number, cols: number) => {
    onInsert("Table", { rows, cols })
    setTableDialogOpen(false)
    onClose()
  }

  const handleMenuItemClick = (itemLabel: string, isTableItem: boolean | undefined) => {
    if (isTableItem) {
      setTableDialogOpen(true)
    } else if (itemLabel !== "Shape") {
      // "Shape" hover opens submenu, click does nothing for now
      onInsert(itemLabel)
      onClose()
    }
  }

  const handleShapeSelect = (shapeId: string) => {
    onInsert("Shape", { shapeId })
    onClose() // Close all menus after selection
  }

  const handleMainItemMouseEnter = (itemLabel: string, event: React.MouseEvent) => {
    clearCloseSubmenusTimer()
    if (itemLabel !== "Shape") {
      setActiveShapeCategory(null) // Close shape grid if hovering over other items
    }
    setHoveredItem(itemLabel)
    if (itemLabel === "Shape") {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
      setSubmenuPosition({ x: rect.right, y: rect.top - 2 }) // Overlap slightly
    }
  }

  const handleShapeCategoryMouseEnter = (categoryId: string, event: React.MouseEvent) => {
    clearCloseSubmenusTimer()
    setHoveredItem("Shape") // Keep the "Shape" item conceptually active
    setActiveShapeCategory(categoryId)
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setShapeSubmenuPosition({ x: rect.right, y: rect.top - 2 }) // Overlap slightly
  }

  // These functions are for the containers of the submenus
  const onSubmenuContainerMouseEnter = () => {
    clearCloseSubmenusTimer()
  }

  const onSubmenuContainerMouseLeave = () => {
    startCloseSubmenusTimer()
  }

  if (!isOpen) return null

  const menuItems = [
    { icon: <ImageIcon className="h-4 w-4 mr-2" />, label: "Image", hasSubmenu: false },
    { icon: <Type className="h-4 w-4 mr-2" />, label: "Text box", hasSubmenu: false },
    { icon: <Square className="h-4 w-4 mr-2" />, label: "Shape", hasSubmenu: true },
    { icon: <Building2 className="h-4 w-4 mr-2" />, label: "Building blocks", hasSubmenu: false },
    { icon: <Grid3x3 className="h-4 w-4 mr-2" />, label: "Diagram", hasSubmenu: true },
    { icon: <Grid3x3 className="h-4 w-4 mr-2" />, label: "Table", hasSubmenu: false, isTable: true },
    { icon: <BarChart4 className="h-4 w-4 mr-2" />, label: "Chart", hasSubmenu: true },
    { icon: <LineChart className="h-4 w-4 mr-2" />, label: "Line", hasSubmenu: true },
    { icon: <PenTool className="h-4 w-4 mr-2" />, label: "Word art", hasSubmenu: false },
    { icon: <Video className="h-4 w-4 mr-2" />, label: "Video", hasSubmenu: false },
    { icon: <Music className="h-4 w-4 mr-2" />, label: "Audio", hasSubmenu: false },
    { icon: <Hash className="h-4 w-4 mr-2" />, label: "Special characters", hasSubmenu: false },
    { icon: <Sparkles className="h-4 w-4 mr-2" />, label: "Animation", hasSubmenu: false },
    { icon: <Link className="h-4 w-4 mr-2" />, label: "Link", shortcut: "Ctrl+K", hasSubmenu: false },
    { icon: <MessageSquare className="h-4 w-4 mr-2" />, label: "Comment", shortcut: "Ctrl+Alt+M", hasSubmenu: false },
    { icon: <Plus className="h-4 w-4 mr-2" />, label: "New slide", shortcut: "Ctrl+M", hasSubmenu: false },
    { icon: <LayoutTemplate className="h-4 w-4 mr-2" />, label: "Templates", isNew: true, hasSubmenu: false },
    { icon: <ListOrdered className="h-4 w-4 mr-2" />, label: "Slide numbers", hasSubmenu: false },
    { icon: <FileBox className="h-4 w-4 mr-2" />, label: "Placeholder", hasSubmenu: true },
  ]

  const shapeCategories_list = [
    { id: "basic", name: "Basic Shapes" },
    { id: "geometric", name: "Geometric" },
    { id: "arrows", name: "Arrows" },
    { id: "callouts", name: "Callouts" },
  ]

  return (
    <>
      <div
        ref={menuRef}
        className="absolute top-10 left-16 z-[60] w-96 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden"
        onMouseEnter={onSubmenuContainerMouseEnter} // Clear timer when mouse enters main menu
        onMouseLeave={onSubmenuContainerMouseLeave} // Start timer when mouse leaves main menu
      >
        <div className="max-h-[80vh] overflow-y-auto">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                index === 11 || index === 13 || index === 15 ? "border-t border-gray-200" : ""
              }`}
              onClick={() => handleMenuItemClick(item.label, item.isTable)}
              onMouseEnter={(e) => handleMainItemMouseEnter(item.label, e)}
              // onMouseLeave is handled by the parent container (menuRef)
            >
              <div className="flex items-center">
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {item.isNew && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-400 rounded-sm font-medium">New</span>
                )}
              </div>
              <div className="flex items-center">
                {item.shortcut && <span className="text-xs text-gray-500 mr-2">{item.shortcut}</span>}
                {item.hasSubmenu && !item.isTable && <ChevronRight className="h-4 w-4 text-gray-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shape Categories Submenu */}
      {hoveredItem === "Shape" && (
        <div
          className="fixed z-[70] w-48 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden"
          style={{ left: submenuPosition.x, top: submenuPosition.y }}
          onMouseEnter={onSubmenuContainerMouseEnter}
          onMouseLeave={onSubmenuContainerMouseLeave}
        >
          {shapeCategories_list.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseEnter={(e) => handleShapeCategoryMouseEnter(category.id, e)}
              // onMouseLeave for individual items is not strictly needed if container handles it
            >
              <span className="text-sm">{category.name}</span>
              <ChevronRight className="h-4 w-4 text-gray-500" />
            </div>
          ))}
        </div>
      )}

      {/* Shapes Grid Submenu */}
      {hoveredItem === "Shape" &&
        activeShapeCategory && ( // Ensure hoveredItem is "Shape" to keep category menu context
          <div
            className="fixed z-[80] w-80 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden"
            style={{ left: shapeSubmenuPosition.x, top: shapeSubmenuPosition.y }}
            onMouseEnter={onSubmenuContainerMouseEnter}
            onMouseLeave={onSubmenuContainerMouseLeave}
          >
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {shapeCategories_list.find((cat) => cat.id === activeShapeCategory)?.name}
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {shapeCategories[activeShapeCategory as keyof typeof shapeCategories]?.map((shape) => (
                  <div
                    key={shape.id}
                    className="aspect-square border border-gray-300 rounded flex items-center justify-center bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    onClick={() => handleShapeSelect(shape.id)}
                    title={shape.name}
                    onMouseEnter={clearCloseSubmenusTimer} // Keep menu open when hovering specific shape
                    // onMouseLeave is handled by parent container
                  >
                    {shape.type === "svg" ? (
                      <svg viewBox={shape.viewBox} className="w-6 h-6" fill="#ffffff" stroke="#000000" strokeWidth="2">
                        <path d={shape.svgPath} />
                      </svg>
                    ) : (
                      <div
                        className="w-6 h-6"
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
            </div>
          </div>
        )}

      <TableDialog
        isOpen={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        onCreateTable={handleCreateTableFromDialog}
      />
    </>
  )
}
