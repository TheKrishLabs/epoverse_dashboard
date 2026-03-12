import { Table as BaseTable } from '@tiptap/extension-table'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { AdvancedTableView } from './table-view'

export const AdvancedTable = BaseTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width}`,
        }),
      },
      height: {
        default: 'auto',
        parseHTML: element => element.style.height || 'auto',
        renderHTML: attributes => ({
          style: `height: ${attributes.height}`,
        }),
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(AdvancedTableView)
  },
})
