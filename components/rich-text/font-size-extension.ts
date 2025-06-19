import { Extension } from "@tiptap/core"
import "@tiptap/extension-text-style"

export interface FontSizeOptions {
  types: string[]
  defaultSize: string
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
      defaultSize: "16px",
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain, editor }) => {
          // First, remove any existing inline font-size style
          // This is a workaround for the conflict between fontSize attribute and style attribute
          const { from, to } = editor.state.selection

          // Apply the new font size
          return (
            chain()
              .focus()
              // First unset any existing fontSize to clear conflicts
              .unsetMark("textStyle")
              // Then set the new fontSize
              .setMark("textStyle", { fontSize })
              .run()
          )
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().unsetMark("textStyle").run()
        },
    }
  },
})
