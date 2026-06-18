'use client'

interface Props {
  position: { x: number; y: number } | null
  formats: { bold: boolean; italic: boolean; underline: boolean }
  colorVal: string
  onExec: (cmd: string, value?: string) => void
  onColorChange: (color: string) => void
}

export default function FloatingToolbar({ position, formats, colorVal, onExec, onColorChange }: Props) {
  if (!position) return null

  return (
    <div
      className="fixed z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl flex items-center gap-0.5 px-1.5 py-1 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
      // Prevent mousedown from collapsing the iframe selection
      onMouseDown={e => e.preventDefault()}
    >
      <Btn
        active={formats.bold}
        onClick={() => onExec('bold')}
        title="Bold (Ctrl+B)"
      >
        <b className="text-sm">B</b>
      </Btn>
      <Btn
        active={formats.italic}
        onClick={() => onExec('italic')}
        title="Italic (Ctrl+I)"
      >
        <i className="text-sm">I</i>
      </Btn>
      <Btn
        active={formats.underline}
        onClick={() => onExec('underline')}
        title="Underline (Ctrl+U)"
      >
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
        className="w-7 h-7 flex flex-col items-center justify-center gap-0.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors relative"
        title="Text color"
        onMouseDown={e => e.preventDefault()}
      >
        <span className="text-sm font-bold leading-none" style={{ color: colorVal }}>A</span>
        <div className="w-4 h-[3px] rounded-full" style={{ backgroundColor: colorVal }} />
        <input
          type="color"
          className="sr-only"
          value={colorVal}
          onChange={e => onColorChange(e.target.value)}
        />
      </label>
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
