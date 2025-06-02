// lib/tiptap/extensions/fontSize.ts
import { Extension } from "@tiptap/core";

const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],               // any mark that may hold fontSize
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: el => {
              const v = el.style.fontSize?.replace(/['"]+/g, "");
              return v ? (v.endsWith("px") ? v : `${v}px`) : null;
            },
            renderHTML: attrs =>
              attrs.fontSize ? { style: `font-size:${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

export default FontSize;
