import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react'

export const AdvancedTableView = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ 
    width: node.attrs.width || '100%', 
    height: node.attrs.height || 'auto' 
  })

  // Sync state with node attributes
  useEffect(() => {
    setSize({
      width: node.attrs.width || '100%',
      height: node.attrs.height || 'auto',
    })
  }, [node.attrs.width, node.attrs.height])

  const onResize = useCallback((direction: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = containerRef.current?.offsetWidth || 0
    const startHeight = containerRef.current?.offsetHeight || 0

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newWidth = startWidth
      let newHeight = startHeight

      if (direction.includes('right')) newWidth = startWidth + deltaX
      if (direction.includes('left')) newWidth = startWidth - deltaX
      if (direction.includes('bottom')) newHeight = startHeight + deltaY
      if (direction.includes('top')) newHeight = startHeight - deltaY

      // Apply minimums
      newWidth = Math.max(100, newWidth)
      newHeight = Math.max(50, newHeight)

      setSize({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      })
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      
      updateAttributes({
        width: containerRef.current?.style.width,
        height: containerRef.current?.style.height,
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [updateAttributes])

  const handles = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ]

  const getHandleStyle = (dir: string): React.CSSProperties => {
    const size = 10
    const pos = -size / 2
    const style: React.CSSProperties = {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: '#fff',
      border: '1px solid #3b82f6',
      zIndex: 100,
      cursor: dir.includes('top') || dir.includes('bottom') 
        ? dir.includes('left') || dir.includes('right') ? 'nwse-resize' : 'ns-resize'
        : 'ew-resize',
    }

    if (dir.includes('top')) style.top = pos
    if (dir.includes('bottom')) style.bottom = pos
    if (dir.includes('left')) style.left = pos
    if (dir.includes('right')) style.right = pos
    if (dir.includes('center')) style.left = '50%'
    if (dir.includes('middle')) style.top = '50%'
    
    if (dir === 'top-center' || dir === 'bottom-center') style.transform = 'translateX(-50%)'
    if (dir === 'middle-left' || dir === 'middle-right') style.transform = 'translateY(-50%)'

    return style
  }

  return (
    <NodeViewWrapper 
      ref={containerRef}
      className={`advanced-table-wrapper ${selected ? 'is-selected' : ''}`}
      style={{
        width: size.width,
        height: size.height,
        position: 'relative',
        margin: '1.5rem 0',
        display: 'inline-block',
        minWidth: '100px',
      }}
    >
      {selected && handles.map(handle => (
        <div 
          key={handle}
          className={`resize-handle ${handle}`}
          style={getHandleStyle(handle)}
          onMouseDown={(e) => onResize(handle, e)}
        />
      ))}
      <div className="table-content-area" style={{ width: '100%', height: '100%' }}>
         <table style={{ width: '100%', height: '100%', margin: 0 }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <NodeViewContent as={'tbody' as any} />
         </table>
      </div>
    </NodeViewWrapper>
  )
}
