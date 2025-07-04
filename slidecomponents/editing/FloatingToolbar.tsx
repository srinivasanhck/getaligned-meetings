"use client"

import type React from "react"
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
  Link,
  Palette,
  PaintBucket,
  Copy,
  Trash2,
} from "lucide-react"
import type { TextElementProps } from "@/types"

interface FloatingToolbarProps {
  element: TextElementProps
  onUpdate: (updatedProps: Partial<TextElementProps>) => void
  onDelete?: () => void
  onDuplicate?: () => void
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ element, onUpdate, onDelete, onDuplicate }) => {
  const commonButtonClass =
    "p-1 hover:bg-slate-100 rounded focus:bg-slate-200 transition-colors border-0 bg-transparent flex items-center justify-center"
  const activeClass = "bg-blue-100 text-blue-700 hover:bg-blue-200"

  const handleToggleStyle = (propName: keyof TextElementProps, activeValue: any, inactiveValue?: any) => {
    onUpdate({ [propName]: element[propName] === activeValue ? inactiveValue : activeValue })
  }

  const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72]

  return (
    <div
      className="w-full h-full px-1.5 py-1 bg-white border border-slate-200 rounded-lg shadow-lg flex items-center gap-0.5 min-w-max overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ position: "relative" }} // Ensure content stays within container
    >
      {/* Text Style Dropdown */}
      {/* <select
        value={element.semanticType || "paragraph"}
        onChange={(e) => onUpdate({ semanticType: e.target.value as any })}
        className="text-xs px-1.5 py-1 border border-slate-200 rounded hover:border-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white min-w-[80px]"
        title="Text Style"
      >
        <option value="paragraph">Normal</option>
        <option value="title">Title</option>
        <option value="heading1">Heading 1</option>
        <option value="heading2">Heading 2</option>
        <option value="heading3">Heading 3</option>
        <option value="heading4">Heading 4</option>
        <option value="quote">Quote</option>
      </select> */}


      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* Bold */}
      <button
        onClick={() => handleToggleStyle("fontWeight", "bold", "normal")}
        className={`${commonButtonClass} w-6 h-6 ${element.fontWeight === "bold" ? activeClass : ""}`}
        title="Bold"
      >
        <Bold size={12} />
      </button>

      {/* Italic */}
      <button
        onClick={() => handleToggleStyle("fontStyle", "italic", "normal")}
        className={`${commonButtonClass} w-6 h-6 ${element.fontStyle === "italic" ? activeClass : ""}`}
        title="Italic"
      >
        <Italic size={12} />
      </button>

      {/* Underline */}
      <button
        onClick={() => handleToggleStyle("textDecoration", "underline", "none")}
        className={`${commonButtonClass} w-6 h-6 ${element.textDecoration === "underline" ? activeClass : ""}`}
        title="Underline"
      >
        <Underline size={12} />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* Font Size */}
      <select
        value={element.fontSize || 16}
        onChange={(e) => onUpdate({ fontSize: Number.parseInt(e.target.value) })}
        className="text-xs px-1.5 py-1 border border-slate-200 rounded hover:border-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white w-12"
        title="Font Size"
      >
        {FONT_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* Text Color */}
      <div className="relative flex items-center" title="Text Color">
        <div className="relative">
          <button className={`${commonButtonClass} relative w-6 h-6`}>
            <Palette size={12} className="text-slate-600" />
          </button>
          <input
            type="color"
            value={element.color || "#000000"}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-sm"
            style={{ backgroundColor: element.color || "#000000" }}
          ></div>
        </div>
      </div>

      {/* Background Color */}
      <div className="relative flex items-center" title="Background Color">
        <div className="relative">
          <button className={`${commonButtonClass} relative w-6 h-6`}>
            <PaintBucket size={12} className="text-slate-600" />
          </button>
          <input
            type="color"
            value={element.backgroundColor || "#ffffff"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-sm border border-slate-300"
            style={{ backgroundColor: element.backgroundColor || "transparent" }}
          ></div>
        </div>
      </div>

      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* Text Alignment */}
      <button
        onClick={() => onUpdate({ textAlign: "left" })}
        className={`${commonButtonClass} w-6 h-6 ${element.textAlign === "left" || !element.textAlign ? activeClass : ""}`}
        title="Align Left"
      >
        <AlignLeft size={12} />
      </button>
      <button
        onClick={() => onUpdate({ textAlign: "center" })}
        className={`${commonButtonClass} w-6 h-6 ${element.textAlign === "center" ? activeClass : ""}`}
        title="Align Center"
      >
        <AlignCenter size={12} />
      </button>
      <button
        onClick={() => onUpdate({ textAlign: "right" })}
        className={`${commonButtonClass} w-6 h-6 ${element.textAlign === "right" ? activeClass : ""}`}
        title="Align Right"
      >
        <AlignRight size={12} />
      </button>
      <button
        onClick={() => onUpdate({ textAlign: "justify" })}
        className={`${commonButtonClass} w-6 h-6 ${element.textAlign === "justify" ? activeClass : ""}`}
        title="Justify"
      >
        <AlignJustify size={12} />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* List Options */}
      <button
        onClick={() =>
          onUpdate({
            isList: !element.isList || element.listType !== "bullet",
            listType: element.isList && element.listType === "bullet" ? undefined : "bullet",
          })
        }
        className={`${commonButtonClass} w-6 h-6 ${element.isList && element.listType === "bullet" ? activeClass : ""}`}
        title="Bullet List"
      >
        <List size={12} />
      </button>
      <button
        onClick={() =>
          onUpdate({
            isList: !element.isList || element.listType !== "number",
            listType: element.isList && element.listType === "number" ? undefined : "number",
          })
        }
        className={`${commonButtonClass} w-6 h-6 ${element.isList && element.listType === "number" ? activeClass : ""}`}
        title="Numbered List"
      >
        <ListOrdered size={12} />
      </button>

      <div className="h-4 w-px bg-slate-200 mx-1"></div>

      {/* Link */}
      <button
        onClick={() => {
          const url = prompt("Enter URL:", element.hyperlink || "")
          if (url !== null) {
            onUpdate({ hyperlink: url || undefined })
          }
        }}
        className={`${commonButtonClass} w-6 h-6 ${element.hyperlink ? activeClass : ""}`}
        title="Add Link"
      >
        <Link size={12} />
      </button>

      {/* More Actions */}
      {(onDelete || onDuplicate) && (
        <>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>

          {onDuplicate && (
            <button onClick={onDuplicate} className={`${commonButtonClass} w-6 h-6`} title="Duplicate">
              <Copy size={12} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className={`${commonButtonClass} w-6 h-6 text-red-600 hover:bg-red-50 hover:text-red-700`}
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default FloatingToolbar
