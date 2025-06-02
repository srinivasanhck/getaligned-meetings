"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react"

interface EditableElementProps {
  element: any
  onUpdate: (updatedElement: any) => void
  isSelected: boolean
  onSelect: () => void
}

export function EditableElement({ element, onUpdate, isSelected, onSelect }: EditableElementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const editorRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Initialize edited content when element changes or is selected
  useEffect(() => {
    if (element.type === "heading" || element.type === "paragraph") {
      setEditedContent(element.text || "")
    } else if (element.type === "list" || element.type === "bullet_list") {
      setEditedContent((element.items || []).join("\n"))
    }
  }, [element])

  // Handle click outside to save changes
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        saveChanges()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const saveChanges = () => {
    const updatedElement = { ...element }

    if (element.type === "heading" || element.type === "paragraph") {
      updatedElement.text = editedContent
    } else if (element.type === "list" || element.type === "bullet_list") {
      updatedElement.items = editedContent.split("\n").filter((item) => item.trim() !== "")
    }

    onUpdate(updatedElement)
    setIsEditing(false)
  }

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value)

    // Update the edited content after formatting
    if (editorRef.current) {
      setEditedContent(editorRef.current.innerHTML)
    }
  }

  const renderToolbar = () => {
    if (!isEditing) return null

    return (
      <div
        ref={toolbarRef}
        className="absolute -top-12 left-0 z-50 bg-white rounded-md shadow-lg border border-gray-200 flex items-center p-1"
      >
        <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
          <div className="flex items-center mr-2">
            <span className="text-sm font-medium mr-1">Poppins</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="flex items-center">
            <input type="number" className="w-10 h-6 text-sm border border-gray-200 rounded px-1" defaultValue="16" />
          </div>
        </div>

        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("bold")}>
          <Bold className="h-4 w-4" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("italic")}>
          <Italic className="h-4 w-4" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("underline")}>
          <Underline className="h-4 w-4" />
        </button>

        <div className="border-l border-gray-200 mx-2 h-6"></div>

        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("justifyLeft")}>
          <AlignLeft className="h-4 w-4" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("justifyCenter")}>
          <AlignCenter className="h-4 w-4" />
        </button>
        <button className="p-1 rounded hover:bg-gray-100" onClick={() => applyFormatting("justifyRight")}>
          <AlignRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const renderEditableContent = () => {
    if (!isEditing) {
      // Render normal content when not editing
      if (element.type === "heading") {
        return <h2 style={element.style}>{element.text}</h2>
      } else if (element.type === "paragraph") {
        return <p style={element.style}>{element.text}</p>
      } else if (element.type === "list" || element.type === "bullet_list") {
        return (
          <ul className="list-disc pl-5" style={element.style}>
            {element.items?.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )
      }
      return null
    }

    // Render editable content
    if (element.type === "heading" || element.type === "paragraph") {
      return (
        <div
          ref={editorRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: editedContent }}
          onInput={(e) => setEditedContent((e.target as HTMLDivElement).innerHTML)}
          className="outline-none w-full h-full"
          style={element.style}
        />
      )
    } else if (element.type === "list" || element.type === "bullet_list") {
      return (
        <div
          ref={editorRef}
          contentEditable
          dangerouslySetInnerHTML={{ __html: editedContent.replace(/\n/g, "<br>") }}
          onInput={(e) => setEditedContent((e.target as HTMLDivElement).innerHTML.replace(/<br>/g, "\n"))}
          className="outline-none w-full h-full"
          style={element.style}
        />
      )
    }

    return null
  }

  return (
    <div
      className={`relative ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={handleDoubleClick}
    >
      {renderToolbar()}
      {renderEditableContent()}
    </div>
  )
}
