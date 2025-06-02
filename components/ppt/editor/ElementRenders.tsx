import React from "react";
import { SlideContentBlock } from "@/lib/redux/features/pptSlice";

export function renderImageElement(
  el: SlideContentBlock,
  patchElement: (id: string, partial: Partial<SlideContentBlock>) => void,
  selectedId: string | null
) {
  const handleFile = async (file: File) => {
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(file);
    });
    patchElement(el.id!, { src: dataUrl });
  };

  const triggerFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  };

  const promptUrl = () => {
    const url = window.prompt("Paste image URL");
    if (url) patchElement(el.id!, { src: url });
  };

  return (
    <div className="w-full h-full relative group">
      <img
        src={el.src ?? el.url}
        alt={el.caption ?? ""}
        className="w-full h-full object-contain pointer-events-none"
      />
      
      {selectedId === el.id && (
       <div className="absolute top-2 right-2 flex gap-2 bg-white/90 border border-gray-200 shadow-md rounded-md p-1 backdrop-blur-sm">
  <button
    onClick={triggerFile}
    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition"
  >
    File
  </button>
  <button
    onClick={promptUrl}
    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition"
  >
    URL
  </button>
  <button
    onClick={() => {
      if (confirm("Delete this image?")) patchElement(el.id!, { type: "deleted" } as any);
    }}
    className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
  >
    ✕
  </button>
</div>

      )}
    </div>
  );
}

export function renderBulletPointsElement( el: SlideContentBlock,
  patchElement: (id: string, partial: Partial<SlideContentBlock>) => void) {
  const items = el.items || [""];
   const isNumbered = el.type === "numbered_list";

  const handleBlur = (i: number, e: React.FocusEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    if (newText !== items[i]) {
      const newItems = [...items];
      newItems[i] = newText;
      patchElement(el.id!, { items: newItems });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, i: number) => {
    const target = e.currentTarget;

    if (e.key === "Enter") {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(i + 1, 0, "");
      patchElement(el.id!, { items: newItems });

      setTimeout(() => {
        const next = document.getElementById(`bullet-${el.id}-${i + 1}`);
        next?.focus();
      }, 0);
    }

    // Handle backspace only when bullet is empty
   else if (e.key === "Backspace") {
  const currentText = target.innerText.trim();

  if (currentText === "") {
    e.preventDefault();

    if (items.length === 1) return; // Don't remove last bullet

    const newItems = [...items];
    newItems.splice(i, 1);
    patchElement(el.id!, { items: newItems });

    setTimeout(() => {
      const prev = document.getElementById(`bullet-${el.id}-${Math.max(i - 1, 0)}`);
      if (prev) {
        prev.focus();

        // ✅ Move cursor to end
        const range = document.createRange();
        range.selectNodeContents(prev);
        range.collapse(false);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, 0);
  }
}

  };

  return (
    <div className="w-full h-full outline-none">
      {items.map((item, i) => (
        <div
          key={i}
          id={`bullet-${el.id}-${i}`}
          contentEditable
          suppressContentEditableWarning
          className={`pl-4 mb-1 min-h-[1.5em] outline-none ${
            isNumbered ? "list-decimal" : "list-disc"
          }`}
          style={{
            textAlign: el.style?.textAlign ?? "left",
            color: el.style?.color,
            fontSize: el.style?.fontSize,
            fontWeight: el.style?.fontWeight,
            lineHeight: el.style?.lineHeight,
            display: "list-item", // This is what actually turns div into a bullet or number
          }}
           onKeyDown={e => handleKeyDown(e, i)}
          onBlur={e => handleBlur(i, e)}
          tabIndex={0}
        >
          {item}
        </div>
      ))}
    </div>
  );
}


export function renderTextElement(
  el: SlideContentBlock,
  patchElement: (id: string, partial: Partial<SlideContentBlock>) => void
) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
       className="editable"
      style={{
        width: "100%",
        height: "100%",
        outline: "none",
        textAlign: el.style?.textAlign ?? "left",
        color: el.style?.color,
        fontSize: el.style?.fontSize,
        fontWeight: el.style?.fontWeight,
        lineHeight: el.style?.lineHeight,
        display: "inline-block",
        verticalAlign: "top",
      }}
      onBlur={(e) => patchElement(el.id!, { text: e.currentTarget.innerText })}
      dangerouslySetInnerHTML={{ __html: el.text || "" }}
    />
  );
}
