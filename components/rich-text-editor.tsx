"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextStyle from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import Color from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import { Bold, Italic, UnderlineIcon, List, ListOrdered, Undo, Redo, Type, ChevronDown, LinkIcon } from "lucide-react"

// Use memo to prevent unnecessary re-renders
const RichTextEditor = memo(
  ({ initialValue, onChange }: { initialValue: string; onChange: (content: string) => void }) => {
    const [isMounted, setIsMounted] = useState(false)
    const [parsedContent, setParsedContent] = useState("")
    const [editor, setEditor] = useState<Editor | null>(null)
    const [emailContent, setEmailContent] = useState("")

    // Parse markdown-style formatting in the initial content
    useEffect(() => {
      // Convert markdown-style bold to HTML
      let content = initialValue.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

      // Convert newlines to <br> tags
      content = content.replace(/\n/g, "<br>")

      // Preserve indentation and spacing
      content = content.replace(/ {2}/g, "&nbsp;&nbsp;")

      setParsedContent(content)
    }, [initialValue])

    const newEditor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        Color,
        FontFamily,
        Link.configure({
          openOnClick: false,
        }),
      ],
      content: parsedContent,
      onUpdate: ({ editor }) => {
        // Only update parent component when content actually changes
        const newContent = editor.getHTML()
        if (newContent !== emailContent) {
          onChange(newContent)
          setEmailContent(newContent)
        }
      },
      editorProps: {
        attributes: {
          class: "prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none font-figtree",
        },
      },
    })

    useEffect(() => {
      setEditor(newEditor)
    }, [newEditor])

    useEffect(() => {
      setIsMounted(true)
    }, [])

    useEffect(() => {
      if (editor && parsedContent) {
        // Only update content from parsedContent on initial load or when switching emails
        // NOT during regular typing
        const currentContent = editor.getHTML()
        if (currentContent === "<p></p>" || !currentContent || initialValue !== editor.getHTML()) {
          // Store current selection before updating content
          const { from, to } = editor.state.selection

          // Update content
          editor.commands.setContent(parsedContent)

          // Try to restore cursor position if this wasn't an initial load
          if (currentContent && currentContent !== "<p></p>") {
            try {
              // Attempt to restore selection
              editor.commands.setTextSelection(from)
            } catch (e) {
              // If restoring selection fails, move to end of document
              editor.commands.focus("end")
            }
          }
        }
      }
    }, [editor, parsedContent])

    // Handle initial value changes separately
    useEffect(() => {
      if (initialValue && editor) {
        // Only update when initialValue actually changes (like switching emails)
        // This helps prevent cursor jumps when typing
        if (initialValue !== editor.getHTML()) {
          // Update content when initialValue changes
          editor.commands.setContent(parsedContent)
          // Focus at the end of the content
          setTimeout(() => {
            editor.commands.focus("end")
          }, 0)
        }
      }
    }, [initialValue, editor, parsedContent])

    // Add this new useEffect to prevent cursor jumps during typing:
    useEffect(() => {
      if (editor) {
        // Disable automatic content updates when the editor has focus
        const handleFocus = () => {
          editor.setOptions({
            editorProps: {
              ...editor.options.editorProps,
              attributes: {
                class: "prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none font-figtree editor-focused",
              },
            },
          })
        }

        const handleBlur = () => {
          editor.setOptions({
            editorProps: {
              ...editor.options.editorProps,
              attributes: {
                class: "prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none font-figtree",
              },
            },
          })
        }

        // Add event listeners
        editor.on("focus", handleFocus)
        editor.on("blur", handleBlur)

        return () => {
          // Remove event listeners on cleanup
          editor.off("focus", handleFocus)
          editor.off("blur", handleBlur)
        }
      }
    }, [editor])

    if (!isMounted) {
      return <EditorPlaceholder />
    }

    return (
      <div className="rich-text-editor border rounded-md overflow-hidden">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    )
  },
)

const EditorPlaceholder = () => (
  <div className="border rounded-md min-h-[300px] bg-gray-50">
    <div className="border-b bg-gray-100 p-2 rounded-t-md">
      <div className="flex gap-2">
        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-6 w-6 rounded bg-gray-200 animate-pulse"></div>
      </div>
    </div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
    </div>
  </div>
)

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  const fontOptions = [
    { label: "Figtree (Default)", value: "Figtree, sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Monospace", value: "monospace" },
  ]

  const sizeOptions = [
    { label: "Small", value: "0.875rem" },
    { label: "Normal", value: "1rem" },
    { label: "Medium", value: "1.125rem" },
    { label: "Large", value: "1.25rem" },
  ]

  const [fontMenuOpen, setFontMenuOpen] = useState(false)
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false)
  const [selectedFont, setSelectedFont] = useState(fontOptions[0])
  const [selectedSize, setSelectedSize] = useState(sizeOptions[1])

  const handleFontSelect = useCallback(
    (option: { label: string; value: string }) => {
      editor?.chain().focus().setFontFamily(option.value).run()
      setSelectedFont(option)
      setFontMenuOpen(false)
    },
    [editor],
  )

  const handleSizeSelect = useCallback(
    (option: { label: string; value: string }) => {
      editor?.chain().focus().setMark("textStyle", { fontSize: option.value }).run()
      setSelectedSize(option)
      setSizeMenuOpen(false)
    },
    [editor],
  )

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1"></div>

      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-200"
          onClick={() => setFontMenuOpen(!fontMenuOpen)}
        >
          <span>{selectedFont.label}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {fontMenuOpen && (
          <div className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 min-w-[150px]">
            {fontOptions.map((option) => (
              <button
                key={option.value}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                onClick={() => {
                  handleFontSelect(option)
                }}
              >
                <span style={{ fontFamily: option.value }}>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-200"
          onClick={() => setSizeMenuOpen(!sizeMenuOpen)}
        >
          <Type className="h-3 w-3" />
          <span>{selectedSize.label}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {sizeMenuOpen && (
          <div className="absolute top-full left-0 bg-white border rounded shadow-lg z-10 min-w-[100px]">
            {sizeOptions.map((option) => (
              <button
                key={option.value}
                className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
                onClick={() => {
                  handleSizeSelect(option)
                }}
              >
                <span style={{ fontSize: option.value }}>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-px bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
        title="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>

      <div className="h-4 w-px bg-gray-300 mx-1"></div>

      <button
        onClick={() => {
          const url = window.prompt("URL")
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          } else {
            editor.chain().focus().unsetLink().run()
          }
        }}
        className={`p-1 rounded hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-200" : ""}`}
        title="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

export default RichTextEditor

