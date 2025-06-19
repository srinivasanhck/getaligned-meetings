"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Plus,
  Type,
  Undo,
  Redo,
  Save,
  Link,
  Paintbrush,
  ChevronDown,
  Minus,
  IndentIncrease,
  IndentDecrease,
  MoreHorizontal,
  Download,
} from "lucide-react"
import { useCurrentEditor } from "@/components/rich-text/editor-context"
import { TooltipPortal } from "./tooltip-portal"
import InsertMenu from "./insert-menu"
import ColorPickerPortal from "./color-picker-portal"

interface Slide {
  slide_id: string // Updated from id to slide_id
  background: string
  content: any[] // Updated from elements to content
}

interface ToolbarProps {
  onInsertItem: (type: string, data?: any) => void
  selectedElementId: string | null
  onBackgroundColorChange: (color: string) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onSave: () => void
  slides: Slide[] // Updated type
  onDownloadPDF?: () => void // Made optional
  isDownloadingPDF?: boolean // Made optional
  isSaving?: boolean // New prop for save loading state
}

export default function Toolbar({
  onInsertItem,
  selectedElementId,
  onBackgroundColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  slides,
  onDownloadPDF,
  isDownloadingPDF = false,
  isSaving = false,
}: ToolbarProps) {
  const { editor } = useCurrentEditor()
  const [fontSize, setFontSize] = useState(16)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false)
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] = useState(false)
  const [currentTextColor, setCurrentTextColor] = useState("#000000")
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState("#ffffff")

  // Refs for the color picker trigger buttons
  const textColorButtonRef = useRef<HTMLButtonElement>(null)
  const backgroundColorButtonRef = useRef<HTMLButtonElement>(null)

  // Update fontSize and text color when selection changes
  useEffect(() => {
    if (!editor) return

    const updateAttributes = () => {
      try {
        const attrs = editor.getAttributes("textStyle")

        // Update font size
        if (attrs && attrs.fontSize) {
          const size = Number.parseInt(attrs.fontSize.replace("px", ""), 10)
          if (!isNaN(size) && size > 0) {
            setFontSize(size)
          }
        } else if (attrs && attrs.style && typeof attrs.style === "string") {
          const fontSizeMatch = attrs.style.match(/font-size:\s*(\d+)px/)
          if (fontSizeMatch && fontSizeMatch[1]) {
            const size = Number.parseInt(fontSizeMatch[1], 10)
            if (!isNaN(size) && size > 0) {
              setFontSize(size)
            }
          }
        }

        // Update text color
        const colorAttrs = editor.getAttributes("textStyle")
        if (colorAttrs && colorAttrs.color) {
          setCurrentTextColor(colorAttrs.color)
        } else {
          if (colorAttrs && colorAttrs.style && typeof colorAttrs.style === "string") {
            const colorMatch = colorAttrs.style.match(/color:\s*([^;]+)/)
            if (colorMatch && colorMatch[1]) {
              setCurrentTextColor(colorMatch[1].trim())
            }
          }
        }
      } catch (error) {
        console.error("Error getting attributes:", error)
      }
    }

    updateAttributes()

    editor.on("selectionUpdate", updateAttributes)
    editor.on("transaction", updateAttributes)

    return () => {
      editor.off("selectionUpdate", updateAttributes)
      editor.off("transaction", updateAttributes)
    }
  }, [editor])

  const decreaseFontSize = () => {
    if (!editor) return
    const newSize = Math.max(fontSize - 1, 2)
    setFontSize(newSize)
    editor.chain().focus().setFontSize(`${newSize}px`).run()
  }

  const increaseFontSize = () => {
    if (!editor) return
    const newSize = Math.min(fontSize + 1, 80)
    setFontSize(newSize)
    editor.chain().focus().setFontSize(`${newSize}px`).run()
  }

  const handleInsertItem = (type: string, data?: any) => {
    setInsertMenuOpen(false)
    onInsertItem(type, data)
  }

  const handleTextColorSelect = (color: string) => {
    if (!editor) return

    if (color === "") {
      // Reset to default color
      editor.chain().focus().unsetColor().run()
      setCurrentTextColor("#000000")
    } else {
      // Apply the selected color to the current selection
      editor.chain().focus().setColor(color).run()
      setCurrentTextColor(color)
    }
  }

  const handleBackgroundColorSelect = (color: string) => {
    setCurrentBackgroundColor(color)
    onBackgroundColorChange(color)
  }

  const handleBulletList = () => {
    if (!editor) return

    const bulletStyle = "font-size:22px;line-height:1.6;list-style-type: disc;"

    if (editor.isActive("orderedList")) {
      editor
        .chain()
        .focus()
        .liftListItem("listItem")
        .toggleBulletList()
        .updateAttributes("bulletList", { style: bulletStyle })
        .run()
    } else if (editor.isActive("bulletList")) {
      return
    } else {
      editor.chain().focus().toggleBulletList().updateAttributes("bulletList", { style: bulletStyle }).run()
    }
  }

  const handleOrderedList = () => {
    if (!editor) return

    const orderedStyle = "font-size:22px;line-height:1.6;list-style-type: decimal;"

    if (editor.isActive("bulletList")) {
      editor
        .chain()
        .focus()
        .liftListItem("listItem")
        .toggleOrderedList()
        .updateAttributes("orderedList", { style: orderedStyle })
        .run()
    } else if (editor.isActive("orderedList")) {
      return
    } else {
      editor.chain().focus().toggleOrderedList().updateAttributes("orderedList", { style: orderedStyle }).run()
    }
  }

  const handleSave = () => {
    onSave()
  }

  const handleDownloadPDF = async () => {
    if (!onDownloadPDF) {
      // Fallback to original PDF generation if onDownloadPDF is not provided
      try {
        const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
          import("jspdf"),
          import("html2canvas"),
        ])

        console.log("Starting PDF generation...")

        const loadingToast = document.createElement("div")
        loadingToast.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;background:#333;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:16px;height:16px;border:2px solid #fff;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;"></div>
            Generating PDF...
          </div>
        </div>
        <style>
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      `
        document.body.appendChild(loadingToast)

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: [1280, 720],
        })

        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i]
          console.log(`Processing slide ${i + 1}/${slides.length}`)

          const slideContainer = document.createElement("div")
          slideContainer.style.cssText = `
          width: 1280px;
          height: 720px;
          position: absolute;
          top: -10000px;
          left: -10000px;
          background: ${slide.background};
          font-family: Arial, sans-serif;
        `

          slide.content.forEach((element) => {
            const elementDiv = document.createElement("div")
            elementDiv.style.cssText = `
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            overflow: hidden;
          `
            if (element.type === "image") {
              const img = document.createElement("img")
              img.src = element.src
              img.alt = element.alt || ""
              img.style.width = "100%"
              img.style.height = "100%"
              if (element.style) {
                Object.assign(img.style, element.style)
              }
              elementDiv.appendChild(img)
              if (element.caption) {
                const captionDiv = document.createElement("div")
                captionDiv.textContent = element.caption
                captionDiv.style.cssText =
                  "position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);color:white;padding:2px;font-size:10px;text-align:center;"
                elementDiv.appendChild(captionDiv)
              }
            } else {
              elementDiv.innerHTML = element.html
            }
            slideContainer.appendChild(elementDiv)
          })

          document.body.appendChild(slideContainer)

          try {
            const canvas = await html2canvas(slideContainer, {
              width: 1280,
              height: 720,
              scale: 1,
              useCORS: true,
              allowTaint: true,
              backgroundColor: null,
            })

            if (i > 0) {
              pdf.addPage()
            }

            const imgData = canvas.toDataURL("image/png")
            pdf.addImage(imgData, "PNG", 0, 0, 1280, 720)

            document.body.removeChild(slideContainer)
          } catch (error) {
            console.error(`Error processing slide ${i + 1}:`, error)
            document.body.removeChild(slideContainer)
          }
        }

        const fileName = `presentation-${new Date().toISOString().split("T")[0]}.pdf`
        pdf.save(fileName)

        document.body.removeChild(loadingToast)

        const successToast = document.createElement("div")
        successToast.innerHTML = `
        <div style="position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          ✅ PDF downloaded successfully!
        </div>
      `
        document.body.appendChild(successToast)
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast)
          }
        }, 3000)

        console.log("PDF generation completed!")
      } catch (error) {
        console.error("Error generating PDF:", error)
      }
    } else {
      onDownloadPDF()
    }
  }

  return (
    <div className="border-b border-gray-200 bg-white relative">
      <div className="flex items-center p-2 space-x-1 overflow-x-auto">
        <TooltipPortal content="Insert menu">
          <Button
            variant="ghost"
            size="sm"
            className={`text-gray-700 ${insertMenuOpen ? "bg-gray-100" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault()
              setInsertMenuOpen(!insertMenuOpen)
            }}
          >
            Insert
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Font family">
          <div className="flex items-center h-8 px-2 border rounded text-sm cursor-pointer">
            <span className="mr-1">Montserrat</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </TooltipPortal>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <TooltipPortal content="Decrease font size">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!editor || fontSize <= 2}
            onMouseDown={(e) => {
              e.preventDefault()
              decreaseFontSize()
            }}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content={`Font size: ${fontSize}px`}>
          <div className="flex items-center h-8 px-2 border rounded text-sm w-10 justify-center cursor-default">
            {fontSize}
          </div>
        </TooltipPortal>

        <TooltipPortal content="Increase font size">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!editor || fontSize >= 80}
            onMouseDown={(e) => {
              e.preventDefault()
              increaseFontSize()
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <TooltipPortal content="Bold (Ctrl+B)">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive("bold") ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().toggleBold().run()
            }}
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Italic (Ctrl+I)">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive("italic") ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().toggleItalic().run()
            }}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Underline (Ctrl+U)">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive("underline") ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().toggleUnderline().run()
            }}
          >
            <Underline className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Text color">
          <Button
            ref={textColorButtonRef}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${textColorPickerOpen ? "bg-gray-200" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault()
              setTextColorPickerOpen(!textColorPickerOpen)
            }}
          >
            <div className="relative">
              <Type className="h-4 w-4" />
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5"
                style={{ backgroundColor: currentTextColor }}
              ></div>
            </div>
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Fill color">
          <Button
            ref={backgroundColorButtonRef}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${backgroundColorPickerOpen ? "bg-gray-200" : ""} ${
              !selectedElementId ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!selectedElementId}
            onMouseDown={(e) => {
              e.preventDefault()
              if (selectedElementId) {
                setBackgroundColorPickerOpen(!backgroundColorPickerOpen)
              }
            }}
          >
            <div className="relative">
              <Paintbrush className="h-4 w-4" />
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5"
                style={{ backgroundColor: currentBackgroundColor }}
              ></div>
            </div>
          </Button>
        </TooltipPortal>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <TooltipPortal content="Insert link">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Link className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Add comment">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </Button>
        </TooltipPortal>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <TooltipPortal content="Align left">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().setTextAlign("left").run()
            }}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Align center">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().setTextAlign("center").run()
            }}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Align right">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().setTextAlign("right").run()
            }}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Justify text">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              editor?.chain().focus().setTextAlign("justify").run()
            }}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        <TooltipPortal content="Bullet list">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive("bulletList") ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              handleBulletList()
            }}
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Numbered list">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${editor?.isActive("orderedList") ? "bg-gray-200" : ""}`}
            disabled={!editor}
            onMouseDown={(e) => {
              e.preventDefault()
              handleOrderedList()
            }}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Decrease indent">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IndentDecrease className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Increase indent">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IndentIncrease className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <TooltipPortal content="Line spacing">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </Button>
        </TooltipPortal>

        <TooltipPortal content="More options">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </TooltipPortal>

        <div className="w-full justify-end flex items-center space-x-2">
          <TooltipPortal content="Undo last action">
            <Button
              variant="outline"
              size="sm"
              disabled={!canUndo}
              onMouseDown={(e) => {
                e.preventDefault()
                onUndo()
              }}
            >
              <Undo className="h-4 w-4 mr-1" />
              Undo
            </Button>
          </TooltipPortal>

          <TooltipPortal content="Redo last action">
            <Button
              variant="outline"
              size="sm"
              disabled={!canRedo}
              onMouseDown={(e) => {
                e.preventDefault()
                onRedo()
              }}
            >
              <Redo className="h-4 w-4 mr-1" />
              Redo
            </Button>
          </TooltipPortal>

          <TooltipPortal content="Download as PDF">
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isDownloadingPDF}>
              {isDownloadingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  PDF
                </>
              )}
            </Button>
          </TooltipPortal>

          <TooltipPortal content="Save presentation">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </TooltipPortal>
        </div>
      </div>

      <InsertMenu isOpen={insertMenuOpen} onClose={() => setInsertMenuOpen(false)} onInsert={handleInsertItem} />

      {/* Text Color Picker Portal */}
      <ColorPickerPortal
        isOpen={textColorPickerOpen}
        onClose={() => setTextColorPickerOpen(false)}
        onColorSelect={handleTextColorSelect}
        currentColor={currentTextColor}
        triggerRef={textColorButtonRef}
      />

      {/* Background Color Picker Portal */}
      <ColorPickerPortal
        isOpen={backgroundColorPickerOpen}
        onClose={() => setBackgroundColorPickerOpen(false)}
        onColorSelect={handleBackgroundColorSelect}
        currentColor={currentBackgroundColor}
        triggerRef={backgroundColorButtonRef}
      />
    </div>
  )
}
