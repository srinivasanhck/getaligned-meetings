// components/ppt/editor/ListEditor.tsx
"use client"
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign   from "@tiptap/extension-text-align"
import TextStyle   from "@tiptap/extension-text-style"
import Underline   from "@tiptap/extension-underline"
import { useEffect, useMemo } from "react"
import FontSize from "./FontSize"
import Toolbar from "./Toolbar"


export default function ListEditor({
  el,
  onUpdate,
  isSelected,
}: {
  el: any
  onUpdate: (p: any) => void
  isSelected: boolean
}) {
  /* ------------ compute non-layout styles --------------- */
  const styles = useMemo(() => {
    const { position, left, top, width, height, ...s } = el.style ?? {}
    return s
  }, [el.style])

  /* ------------ TipTap instance ------------------------- */
  const editor = useEditor({
    extensions: [
      StarterKit,                     // list, list_item, etc.
      TextAlign.configure({ types: ["paragraph", "heading", "listItem"] }),
      TextStyle,
      Underline,
      FontSize,
    ],
    content: el.text || listItemsToHTML(el.items ?? [], el.type),
    editorProps: { attributes: { class: "editable focus:outline-none w-full h-full" } },
    onUpdate({ editor }) {
      // save both html and the split items[]
      const html = editor.getHTML()
      const items = htmlToItems(html, el.type)
      onUpdate({ text: html, items })
    },
  })

  if (!editor) return null

  return (
    <div className="w-full h-full" style={styles}>
      {isSelected && <Toolbar editor={editor} />}
      <EditorContent editor={editor} className="ProseMirror w-full h-full" />
    </div>
  )
}

/* ---- helpers: keep your JSON shape in sync ------------- */
function listItemsToHTML(items: string[], listType: string) {
  const wrap = listType === "numbered_list" ? "ol" : "ul"
  return `<${wrap}>${items.map(i => `<li>${i}</li>`).join("")}</${wrap}>`
}

function htmlToItems(html: string, listType: string) {
  // naive but works: parse li’s
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  const selector = listType === "numbered_list" ? "ol > li" : "ul > li"
  return Array.from(tmp.querySelectorAll(selector)).map(li => li.textContent || "")
}
