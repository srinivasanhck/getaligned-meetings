"use client";

import { Rnd } from "react-rnd";
import { useCallback, useRef, useState, useMemo } from "react";
import type { Slide, SlideContentBlock } from "@/lib/redux/features/pptSlice";
import { renderBulletPointsElement, renderImageElement } from "./ElementRenders";
import TiptapEditor from "./TiptapEditor";
import ListEditor from "./ListEditor";

interface EditableSlideProps {
  slide: Slide;
  onUpdate: (updated: Slide) => void;
}

const bg = (bg: any) =>
  !bg
    ? "#fff"
    : bg.type === "gradient"
      ? bg.value
      : bg.type === "image"
        ? `url(${bg.value}) center/cover`
        : bg.value;

/* ------------------- Utility Functions ------------------- */

const num = (v: string | number | undefined | null): number =>
  typeof v === "string" ? parseFloat(v) : v ?? 0;

const pct2px = (pct: number, base: number) => Math.round((pct / 100) * base);

const px2pct = (px: number, base: number) =>
  parseFloat(((px / base) * 100).toFixed(2));

export default function EditableSlide({ slide, onUpdate }: EditableSlideProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cw = wrapRef.current?.clientWidth ?? 1200;
  const ch = wrapRef.current?.clientHeight ?? 675;

  const patch = useCallback(
    (id: string, partial: Partial<SlideContentBlock>) => {
      onUpdate({
        ...slide,
        content: slide.content.map((b) =>
          b.id === id
            ? { ...b, ...partial, style: { ...b.style, ...partial.style } }
            : b
        ),
      });
    },
    [slide, onUpdate]
  );

  // Create a separate component for blocks
  const EditableBlock = useCallback(({ el }: { el: SlideContentBlock }) => {
    const position = useMemo(() => ({
      initX: el.style?.left?.includes("%")
        ? pct2px(num(el.style.left), cw)
        : num(el.style?.left),
      initY: el.style?.top?.includes("%")
        ? pct2px(num(el.style.top), ch)
        : num(el.style?.top),
      initW: typeof el.style?.width === "string" && el.style.width.includes("%")
        ? pct2px(num(el.style.width), cw)
        : typeof el.style?.width === "number"
          ? el.style.width
          : undefined,
      initH: typeof el.style?.height === "string" && el.style.height.includes("%")
        ? pct2px(num(el.style.height), ch)
        : typeof el.style?.height === "number"
          ? el.style.height
          : undefined
    }), [el.style, cw, ch]);

    const savePos = useCallback((x: number, y: number, w?: number, h?: number) => {
      patch(el.id!, {
        style: {
          ...el.style,
          left: `${px2pct(x, cw)}%`,
          top: `${px2pct(y, ch)}%`,
          ...(w ? { width: `${px2pct(w, cw)}%` } : {}),
          ...(h ? { height: `${px2pct(h, ch)}%` } : {}),
          position: "absolute",
        },
      });
    }, [el, patch, cw, ch]);
    console.log("el", el);

    return (
      <Rnd
        key={el.id}
        default={{ 
          x: position.initX, 
          y: position.initY, 
          width: position.initW, 
          height: position.initH 
        }}
        lockAspectRatio={el.type === "image"}
        bounds="parent"
        cancel=".editable"
        dragHandleClassName="drag-handle"
        onDragStop={(_, d) => savePos(d.x, d.y)}
        onResizeStop={(_, __, ref, ___, pos) =>
          savePos(pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
        }
        onClick={() => setSelectedId(el.id!)}
        style={{
          border: selectedId === el.id ? "1px dashed #6366f1" : "none",
          zIndex: el.style?.zIndex ?? 1,
        }}
        resizeHandleClasses={{ bottomRight: "resize-handle" }}
      >
        <div className="h-full w-full p-1">
          {el.type === "heading" || el.type === "paragraph" ? (
            <TiptapEditor
              key={el.id}
              el={el}
              onUpdate={(updated:any) => patch(el.id!, updated)}
              isSelected={selectedId === el.id}
            />
          ) : el.type === "image" ? (
            renderImageElement(el, patch, selectedId)
          ) : el.type === "list" || el.type === "numbered_list" ? (
            renderBulletPointsElement(el, patch)
  //             <ListEditor
  //    key={el.id}
  //    el={el}
  //    onUpdate={(u) => patch(el.id!, u)}
  //    isSelected={selectedId === el.id}
  // />
          ) : null}
          <div
            className="drag-handle absolute top-0 left-0 w-2 h-2 cursor-move bg-gray-400 rounded-full z-10"
            title="Drag"
          />
        </div>
      </Rnd>
    );
  }, [cw, ch, patch, selectedId]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: bg(slide.background) }}
    >
      {slide.content.map((block) => (
        <EditableBlock key={block.id} el={block} />
      ))}
    </div>
  );
}