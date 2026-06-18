'use client'

import { useRef, useCallback } from 'react'
import { X, Move } from 'lucide-react'

export interface Overlay {
  id: string
  type: 'text' | 'image'
  x: number    // px from resume page left
  y: number    // px from resume page top
  width: number
  content: string
}

interface Props {
  overlay: Overlay
  scale: number
  onChange: (updated: Overlay) => void
  onDelete: (id: string) => void
}

export default function OverlayElement({ overlay, scale, onChange, onDelete }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: overlay.x,
      origY: overlay.y,
    }

    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return
      const { startX, startY, origX, origY } = dragRef.current
      // Divide by scale because pointer moves are in screen px, but overlay positions
      // are in resume-page px (before the CSS transform is applied).
      onChange({
        ...overlay,
        x: origX + (mv.clientX - startX) / scale,
        y: origY + (mv.clientY - startY) / scale,
      })
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [overlay, scale, onChange])

  return (
    <div
      className="absolute group"
      style={{ left: overlay.x, top: overlay.y, width: overlay.width, zIndex: 20 }}
    >
      {/* Drag handle — shows on hover */}
      <div
        className="absolute -top-7 left-0 hidden group-hover:flex items-center gap-1 bg-blue-600 rounded-t-lg px-2 py-1 cursor-move select-none z-30"
        onMouseDown={onDragStart}
      >
        <Move size={11} className="text-white" />
        <span className="text-[10px] text-white font-medium">drag</span>
      </div>

      {/* Delete button */}
      <button
        className="absolute -top-3 -right-3 hidden group-hover:flex w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full items-center justify-center z-30 transition-colors"
        onClick={() => onDelete(overlay.id)}
        onMouseDown={e => e.stopPropagation()}
      >
        <X size={11} className="text-white" />
      </button>

      {/* Hover border */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none opacity-0 group-hover:opacity-100 z-10" />

      {overlay.type === 'text' ? (
        <div
          contentEditable
          suppressContentEditableWarning
          className="text-sm outline-none p-1 min-h-[24px] cursor-text select-text"
          dangerouslySetInnerHTML={{ __html: overlay.content }}
          onBlur={e => onChange({ ...overlay, content: e.currentTarget.innerHTML })}
          onMouseDown={e => e.stopPropagation()}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={overlay.content}
          alt="element"
          className="w-full h-auto"
          draggable={false}
          onMouseDown={e => e.stopPropagation()}
        />
      )}
    </div>
  )
}
