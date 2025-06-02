import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

type Props = {
  el: any;
  save: any;
};

export default function EditableTextBlock({ el, save }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      TextStyle,
    ],
    content: el.text ?? "",
    autofocus: false,
    onBlur({ editor }) {
      save({ text: editor.getHTML() }); //  round-trip back to JSON
    },
  });

  if (!editor) return null;

  return (
    <>
      <EditorContent
        editor={editor}
        className="editable outline-none w-full h-full"
        style={{ ...el.style }}
      />

      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150 }}
        className="rounded-md shadow-xl bg-white border p-2 flex gap-1"
      >
        <button onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'font-bold text-purple-600' : ''}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'italic text-purple-600' : ''}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'underline text-purple-600' : ''}>U</button>

        {/* align */}
        <button onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'text-purple-600' : ''}>⯇</button>
        <button onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'text-purple-600' : ''}>≡</button>
        <button onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'text-purple-600' : ''}>⯈</button>
      </BubbleMenu>
    </>
  );
}
