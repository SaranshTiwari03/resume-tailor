'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'

interface Props {
  position: { x: number; y: number } | null
  formats: { bold: boolean; italic: boolean; underline: boolean }
  colorVal: string
  onExec: (cmd: string, value?: string) => void
  onColorChange: (color: string) => void
  onLink: (url: string) => void
}

export default function FloatingToolbar({ position, formats, colorVal, onExec, onColorChange, onLink }: Props) {
  const [showLink, setShowLink] = useState(false)
  const [linkUrl, setLinkUrl] = useState('https://')

  if (!position) return null

  const applyLink = () => {
    const trimmed = linkUrl.trim()
    if (trimmed && trimmed !== 'https://') onLink(trimmed)
    setShowLink(false)
    setLinkUrl('https://')
  }

  return (
    <div
      className="fixed z-50 pointer-events-auto flex flex-col items-center"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
      onMouseDown={e => e.preventDefault()}
    >
      {/* Link URL input panel — floats above the toolbar */}
      {showLink && (
        <div className="mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl px-2.5 py-2 flex items-center gap-1.5">
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') applyLink()
              if (e.key === 'Escape') setShowLink(false)
            }}
            onMouseDown={e => e.stopPropagation()}
            className="text-[11px] text-white bg-white/10 border border-white/10 rounded-lg px-2 py-1 w-52 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://"
            autoFocus
          />
          <button
            onMouseDown={applyLink}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            Apply
          </button>
          <button
            onMouseDown={() => setShowLink(false)}
            className="text-[11px] text-white/40 hover:text-white/80 px-1.5 py-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main floating toolbar */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl flex items-center gap-0.5 px-1.5 py-1">
        <Btn active={formats.bold} onClick={() => onExec('bold')} title="Bold (Ctrl+B)">
          <b className="text-sm">B</b>
        </Btn>
        <Btn active={formats.italic} onClick={() => onExec('italic')} title="Italic (Ctrl+I)">
          <i className="text-sm">I</i>
        </Btn>
        <Btn active={formats.underline} onClick={() => onExec('underline')} title="Underline (Ctrl+U)">
          <u className="text-sm">U</u>
        </Btn>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        <Btn active={false} onClick={() => onExec('fontSize', '2')} title="Smaller text">
          <span className="text-[10px] leading-none">A−</span>
        </Btn>
        <Btn active={false} onClick={() => onExec('fontSize', '4')} title="Larger text">
          <span className="text-sm leading-none">A+</span>
        </Btn>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Text color */}
        <label
          className="w-7 h-7 flex flex-col items-center justify-center gap-0.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          title="Text color"
          onMouseDown={e => e.preventDefault()}
        >
          <span className="text-sm font-bold leading-none" style={{ color: colorVal }}>A</span>
          <div className="w-4 h-[3px] rounded-full" style={{ backgroundColor: colorVal }} />
          <input type="color" className="sr-only" value={colorVal} onChange={e => onColorChange(e.target.value)} />
        </label>

        <div className="w-px h-4 bg-white/10 mx-0.5" />

        {/* Link */}
        <Btn active={showLink} onClick={() => setShowLink(v => !v)} title="Insert hyperlink">
          <Link2 size={12} />
        </Btn>
      </div>
    </div>
  )
}

function Btn({
  active, onClick, title, children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors select-none
        ${active ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
    >
      {children}
    </button>
  )
}
