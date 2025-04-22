"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface RichTextEditorProps {
  initialValue: string
  onChange: (html: string) => void
  className?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onChange, className = "" }) => {
  const [editorContent, setEditorContent] = useState(initialValue)

  // Update editor content when initialValue changes
  useEffect(() => {
    setEditorContent(initialValue)
  }, [initialValue])

  // Basic toolbar buttons
  const formatDoc = (command: string, value = "") => {
    document.execCommand(command, false, value)

    // Get the updated HTML content
    const editorElement = document.getElementById("rich-text-editor")
    if (editorElement) {
      const newContent = editorElement.innerHTML
      setEditorContent(newContent)
      onChange(newContent)
    }
  }

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button type="button" onClick={() => formatDoc("bold")} className="p-1 rounded hover:bg-gray-200" title="Bold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => formatDoc("italic")}
          className="p-1 rounded hover:bg-gray-200"
          title="Italic"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => formatDoc("underline")}
          className="p-1 rounded hover:bg-gray-200"
          title="Underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </button>

        <span className="w-px h-6 bg-gray-300 mx-1"></span>

        <button
          type="button"
          onClick={() => formatDoc("insertUnorderedList")}
          className="p-1 rounded hover:bg-gray-200"
          title="Bullet List"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => formatDoc("insertOrderedList")}
          className="p-1 rounded hover:bg-gray-200"
          title="Numbered List"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
      </div>

      {/* Editor */}
      <div
        id="rich-text-editor"
        contentEditable
        dangerouslySetInnerHTML={{ __html: editorContent }}
        onInput={(e) => {
          const newContent = (e.target as HTMLDivElement).innerHTML
          setEditorContent(newContent)
          onChange(newContent)
        }}
        className="p-3 min-h-[150px] focus:outline-none"
      />
    </div>
  )
}

export default RichTextEditor
