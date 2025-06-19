"use client"

import { useEffect } from "react"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import { KeepInlineStyle } from "./keep-inline-style"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Underline from "@tiptap/extension-underline"
import { FontSize } from "./font-size-extension"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"

// ---- keep *any* inline style that comes in ----
const StylePreserver = TextStyle.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (el) => el.getAttribute("style"),
        renderHTML: (attrs) => {
          // If we have a fontSize attribute, remove font-size from style to avoid conflicts
          if (attrs.fontSize && attrs.style) {
            // Remove font-size from style string
            const styleWithoutFontSize = attrs.style.replace(/font-size:\s*[^;]+;?/g, "")
            return { style: styleWithoutFontSize || null }
          }
          return { style: attrs.style }
        },
      },
    }
  },
})

// Custom Bullet List extension that preserves style attributes
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      style: {
        default: "font-size:22px;line-height:1.6;list-style-type: disc;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return { style: attributes.style }
        },
      },
    }
  },
})

// Custom Ordered List extension that preserves style attributes
const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      style: {
        default: "font-size:22px;line-height:1.6;list-style-type: decimal;",
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return { style: attributes.style }
        },
      },
    }
  },
})

// Custom List Item extension that preserves style attributes
const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return { style: attributes.style }
        },
      },
    }
  },
})

interface RichTextEditorProps {
  initialHTML: string
  onUpdateHTML: (html: string) => void
  onReady: (editor: Editor) => void // we'll surface the editor to the toolbar
  onBlur: () => void
}

export default function RichTextEditor({ initialHTML, onUpdateHTML, onReady, onBlur }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable the default list items to use custom ones
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      // Add custom list extensions with style preservation
      CustomBulletList,
      CustomOrderedList,
      CustomListItem,
      StylePreserver,
      TextStyle,
      Color,
      KeepInlineStyle,
      Underline,
      FontSize.configure({
        types: ["textStyle"],
        defaultSize: "16px",
      }),
      TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "w-full",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialHTML,
    editorProps: {
      attributes: { class: "w-full h-full outline-none" },
      handleDOMEvents: {
        blur: () => {
          onBlur()
          return false
        },
      },
    },
    onUpdate: ({ editor }) => {
      onUpdateHTML(editor.getHTML())
    },
  })

  // expose the editor instance upward for toolbar commands
  useEffect(() => {
    if (editor) onReady(editor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  if (!editor) return null
  return <EditorContent editor={editor} className="w-full h-full" />
}
