"use client"

import React, { createContext, useState, useContext } from "react"
import type { Editor } from "@tiptap/react"

interface Ctx {
  editor: Editor | null
  setEditor: (e: Editor | null) => void
}

const EditorCtx = createContext<Ctx | null>(null)

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null)
  return <EditorCtx.Provider value={{ editor, setEditor }}>{children}</EditorCtx.Provider>
}

export function useCurrentEditor() {
  const ctx = useContext(EditorCtx)
  if (!ctx) throw new Error("useCurrentEditor must be inside <EditorProvider>")
  return ctx
}
