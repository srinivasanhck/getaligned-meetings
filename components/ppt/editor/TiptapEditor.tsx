"use client";

import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import React, { useEffect } from "react";
import {
  Bold, Italic, Underline as UnderIcon, AlignLeft,
  AlignCenter, AlignRight, List, ListOrdered
} from "lucide-react";

interface Props {
  html: string;
  onChange: (html: string) => void;
  isActive: boolean;         // true when the block is selected
}

export default function TipTapEditor({ html, onChange, isActive }: Props) {
  console.log("TipTapEditor rendered",html);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content: html || "<p></p>",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    autofocus: false,
    editable: true,
  });

  /* -------- autofocus when block becomes active -------- */
  useEffect(() => {
    if (isActive) editor?.commands.focus("end");
  }, [isActive, editor]);

  /* -------- keep in sync when *not* focused ------------- */
  useEffect(() => {
    if (!editor) return;
    if (!editor.isFocused && html !== editor.getHTML()) {
      editor.commands.setContent(html, false);
    }
  }, [html, editor]);

  if (!editor) return null;

  /* -------------- bubble toolbar ------------------------ */
  const Toolbar = (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150 }}
      className="flex gap-1 bg-white border rounded shadow p-1"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "text-purple-600" : ""}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "text-purple-600" : ""}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive("underline") ? "text-purple-600" : ""}
        title="Underline"
      >
        <UnderIcon size={16} />
      </button>

      <span className="w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={editor.isActive({ textAlign: "left" }) ? "text-purple-600" : ""}
        title="Align left"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={editor.isActive({ textAlign: "center" }) ? "text-purple-600" : ""}
        title="Center"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={editor.isActive({ textAlign: "right" }) ? "text-purple-600" : ""}
        title="Align right"
      >
        <AlignRight size={16} />
      </button>

      <span className="w-px bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "text-purple-600" : ""}
        title="Bullet list"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "text-purple-600" : ""}
        title="Numbered list"
      >
        <ListOrdered size={16} />
      </button>
    </BubbleMenu>
  );

  return (
    <>
      {Toolbar}
      <EditorContent
        editor={editor}
        className="editable w-full h-full outline-none"
        spellCheck={false}
      />
    </>
  );
}
