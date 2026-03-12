import { TableRow as BaseTableRow } from '@tiptap/extension-table-row'

export const AdvancedTableRow = BaseTableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: element => element.style.height || null,
        renderHTML: attributes => {
          if (!attributes.height) {
            return {}
          }
          return {
            style: `height: ${attributes.height}`,
          }
        },
      },
    }
  },
})
