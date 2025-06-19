// components/rich-text/keep-inline-style.ts
import { Extension } from '@tiptap/core'

/**
 * Lets “heading”, “paragraph”, “image”, etc. keep their inline style attr.
 * Add or remove types as you see fit.
 */
export const KeepInlineStyle = Extension.create({
  name: 'keepInlineStyle',
  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
          "image",
          "table",
          "tableRow",
          "tableCell",
          "tableHeader",
          // add more node names here whenever you add new extensions
        ], 
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => ({ style: attributes.style }),
          },
        },
      },
    ]
  },
})
