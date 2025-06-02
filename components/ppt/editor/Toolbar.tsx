"use client";
import { Editor } from "@tiptap/react";
import { useMemo } from "react";

const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 56, 64, 72];

interface Props {
  editor: Editor;
}

export default function Toolbar({ editor }: Props) {
  /* current state helpers */
  const curFont = useMemo(
    () => editor.getAttributes("textStyle").fontSize?.replace("px", "") || "16",
    [editor]
  );
  const curAlign = useMemo(() => {
    const p = editor.getAttributes("paragraph").textAlign;
    const h = editor.getAttributes("heading").textAlign;
    return p || h || "left";
  }, [editor]);

  const btnCls = (active: boolean) =>
    `px-1 py-0.5 rounded ${
      active ? "bg-blue-100 border border-blue-300" : "hover:bg-gray-100"
    }`;

  return (
    <div className="bg-white border rounded-lg shadow-lg p-2 flex gap-2 items-center text-sm">
      {/* --- Font size --- */}
      <select
        value={curFont}
        onChange={e =>
          editor
            .chain()
            .focus()
            .setFontSize(`${e.target.value}px`)
            .run()
        }
        className="px-2 py-1 border rounded-md bg-white"
      >
        {fontSizeOptions.map(s => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* --- Alignment --- */}
      <div className="flex gap-1 border-l pl-2 ml-2">
        {(["left", "center", "right"] as const).map(a => (
          <button
            key={a}
            title={`align ${a}`}
            onClick={() =>
              editor.chain().focus().setTextAlign(a).run()
            }
            className={btnCls(curAlign === a)}
          >
            {a[0].toUpperCase()}
          </button>
        ))}
      </div>

      {/* --- Format --- */}
      <div className="flex gap-1 border-l pl-2 ml-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnCls(editor.isActive("bold"))}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnCls(editor.isActive("italic"))}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnCls(editor.isActive("underline"))}
          title="Underline"
        >
          <u>U</u>
        </button>
      </div>
    </div>
  );
}
