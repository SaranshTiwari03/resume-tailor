'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import {
  ArrowLeft, Download, Minus, Plus, Maximize2,
  Sparkles, Type, Image as ImageIcon, Link2, RotateCcw,
  AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import { buildResumeHtml } from '@/lib/resume-template'
import type { ResumeData } from '@/types/resume'
import AvatarDropdown from '@/components/AvatarDropdown'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'
import FloatingToolbar from '@/components/FloatingToolbar'
import OverlayElement, { type Overlay } from '@/components/OverlayElement'
import type { EditableIframeHandle } from '@/components/EditableResumeIframe'

const EditableResumeIframe = dynamic(
  () => import('@/components/EditableResumeIframe'),
  { ssr: false },
)

const RESUME_DATA_KEY = 'rbt_resume_data'
let _counter = 0
const uid = () => `el-${++_counter}`

// Curated font list for inline toolbar (full picker is in TopBar for whole-resume styling)
const TOOLBAR_FONTS = [
  'Inter', 'DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Manrope', 'Figtree',
  'Open Sans', 'Roboto', 'Lato', 'Source Sans 3', 'Noto Sans',
  'Montserrat', 'Poppins', 'Raleway', 'Nunito', 'Josefin Sans',
  'IBM Plex Sans Condensed', 'Barlow Condensed', 'Oswald',
  'Merriweather', 'Playfair Display', 'Lora', 'EB Garamond',
  'JetBrains Mono', 'Source Code Pro', 'IBM Plex Mono', 'Fira Code',
]

// ── Toolbar UI primitives ─────────────────────────────────────────────────────

function FmtBtn({
  active, onClick, title, children,
}: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`flex items-center justify-center gap-1 rounded px-1.5 h-7 text-[12px] font-medium transition-colors shrink-0 ${
        active ? 'bg-white/20 text-white' : 'text-white/55 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function TbDiv() {
  return <div className="w-px h-5 bg-white/[0.1] mx-1 shrink-0" />
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditorPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [resume, setResume] = useState<ResumeData | null>(null)
  const [zoom, setZoom] = useState(0.75)
  const [credits, setCredits] = useState<number | null>(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [spaceDown, setSpaceDown] = useState(false)
  const [extraPages, setExtraPages] = useState<string[]>([])

  // Format state (for both toolbars)
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false })
  const [colorVal, setColorVal] = useState('#000000')
  const [selFontSize, setSelFontSize] = useState(9)
  const [selFontFamily, setSelFontFamily] = useState('Inter')

  // Floating mini toolbar position (restored)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)

  const iframeHandle = useRef<EditableIframeHandle>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const zoomRef = useRef(zoom)
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)
  // Saved iframe selection range so toolbar interactions don't lose it
  const savedRangeRef = useRef<Range | null>(null)

  // ── Load resume ───────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(RESUME_DATA_KEY)
    if (!raw) { router.push('/'); return }
    try { setResume(JSON.parse(raw) as ResumeData) }
    catch { router.push('/') }
  }, [router])

  // ── Credits ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) { setCredits(null); return }
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(d => { if (d.unlimited) setCredits(-1); else if (typeof d.credits === 'number') setCredits(d.credits) })
      .catch(() => {})
  }, [session])

  // ── Space key → grab cursor ───────────────────────────────────────────────
  useEffect(() => {
    const ed = (t: EventTarget | null) =>
      t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement ||
      (t instanceof HTMLElement && t.contentEditable === 'true')
    const dn = (e: KeyboardEvent) => { if (e.code === 'Space' && !ed(e.target)) { e.preventDefault(); setSpaceDown(true) } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  // ── Save/restore iframe selection ─────────────────────────────────────────
  const saveRange = useCallback(() => {
    const d = iframeHandle.current?.getDoc()
    if (!d) return
    const sel = d.getSelection()
    if (sel && sel.rangeCount > 0) savedRangeRef.current = sel.getRangeAt(0).cloneRange()
  }, [])

  const restoreRange = useCallback(() => {
    const d = iframeHandle.current?.getDoc()
    if (!d || !savedRangeRef.current) return
    const sel = d.getSelection()
    if (sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current) }
  }, [])

  // ── Selection callback ────────────────────────────────────────────────────
  // Fires on every selectionchange inside the iframe. Updates floating toolbar
  // position, format button states, and detected font/size at cursor.
  const handleSelectionChange = useCallback(
    (rect: DOMRect | null, iframeEl: HTMLIFrameElement | null) => {
      // Floating mini toolbar position
      if (rect && iframeEl && rect.width > 0) {
        const ir = iframeEl.getBoundingClientRect()
        const s = zoomRef.current
        setToolbarPos({ x: ir.left + (rect.left + rect.width / 2) * s, y: ir.top + rect.top * s })
      } else {
        setToolbarPos(null)
      }

      const d = iframeHandle.current?.getDoc()
      if (!d) return

      setFormats({
        bold: d.queryCommandState('bold'),
        italic: d.queryCommandState('italic'),
        underline: d.queryCommandState('underline'),
      })

      // Save selection range for toolbar use
      const sel = d.getSelection()
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange()

        // Detect computed font size + family at cursor position
        const node = sel.getRangeAt(0).startContainer
        const el = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node) as Element | null
        if (el && iframeEl?.contentWindow) {
          const cs = iframeEl.contentWindow.getComputedStyle(el)
          const px = parseFloat(cs.fontSize)
          if (!isNaN(px)) setSelFontSize(Math.round(px * 0.75)) // px → pt
          const fam = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
          if (fam) setSelFontFamily(fam)
        }
      }
    },
    [],
  )

  // ── execCommand bridge ────────────────────────────────────────────────────
  const execCmd = useCallback((cmd: string, value?: string) => {
    iframeHandle.current?.execCmd(cmd, value)
    const d = iframeHandle.current?.getDoc()
    if (d) setFormats({ bold: d.queryCommandState('bold'), italic: d.queryCommandState('italic'), underline: d.queryCommandState('underline') })
  }, [])

  const handleColorChange = useCallback((color: string) => {
    setColorVal(color); execCmd('foreColor', color)
  }, [execCmd])

  const handleLink = useCallback(() => {
    const url = window.prompt('Enter link URL:', 'https://')
    if (url?.trim()) execCmd('createLink', url.trim())
  }, [execCmd])

  // ── Apply font size to selection (pt) ─────────────────────────────────────
  // Uses the font[size="7"] trick to inject real CSS pt values.
  const applyFontSize = useCallback((pt: number) => {
    const clamped = Math.max(6, Math.min(72, pt))
    setSelFontSize(clamped)
    restoreRange()
    const d = iframeHandle.current?.getDoc()
    if (!d) return
    d.execCommand('styleWithCSS', false, 'true')
    d.execCommand('fontSize', false, '7')
    ;(Array.from(d.querySelectorAll('font[size="7"]')) as HTMLElement[]).forEach(el => {
      const span = d.createElement('span')
      span.style.fontSize = `${clamped}pt`
      while (el.firstChild) span.appendChild(el.firstChild)
      el.parentNode?.replaceChild(span, el)
    })
  }, [restoreRange])

  // ── Apply font family to selection ────────────────────────────────────────
  const applyFontFamily = useCallback((family: string) => {
    setSelFontFamily(family)
    restoreRange()
    const d = iframeHandle.current?.getDoc()
    if (!d) return
    d.execCommand('fontName', false, family)
  }, [restoreRange])

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!resume) return
    const html = iframeHandle.current?.getHtml() ?? buildResumeHtml(resume, true)
    if (overlays.length > 0) {
      const oh = overlays.map(el => {
        const s = `position:absolute;left:${Math.round(el.x)}px;top:${Math.round(el.y)}px;width:${el.width}px;`
        return el.type === 'text' ? `<div style="${s}font-size:inherit;">${el.content}</div>` : `<img src="${el.content}" alt="" style="${s}" />`
      }).join('\n')
      printHtml(html.replace('</body>', `<div style="position:relative;">${oh}</div></body>`))
    } else {
      printHtml(html)
    }
  }, [resume, overlays])

  // ── Add elements ──────────────────────────────────────────────────────────
  const addTextBox = useCallback(() => {
    setOverlays(prev => [...prev, { id: uid(), type: 'text', x: 48, y: 48 + prev.length * 64, width: 220, content: 'Click to edit this text' }])
  }, [])

  const onImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setOverlays(prev => [...prev, { id: uid(), type: 'image', x: 48, y: 48, width: 160, content: ev.target?.result as string }])
    reader.readAsDataURL(file); e.target.value = ''
  }, [])

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!resume) {
    return (
      <div className="flex items-center justify-center h-screen"
        style={{ backgroundColor: '#2b2b2b', backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  const previewHtml = buildResumeHtml(resume)

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none">

      {showCreditsModal && <InsufficientCreditsModal creditsRemaining={credits ?? 0} cost={2} onClose={() => setShowCreditsModal(false)} />}
      <input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={onImageFile} />

      {/* Floating mini-toolbar — appears above selected text (restored) */}
      <FloatingToolbar
        position={toolbarPos}
        formats={formats}
        colorVal={colorVal}
        onExec={execCmd}
        onColorChange={handleColorChange}
      />

      {/* ── PRIMARY TOP BAR ──────────────────────────────────────────────────── */}
      <header className="h-[52px] bg-[#1f1f1f] border-b border-white/[0.07] flex items-center gap-2 px-3 shrink-0 z-20">
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-white/40 hover:text-white/90 text-xs transition-colors px-2 py-1.5 rounded-md hover:bg-white/5">
          <ArrowLeft size={14} /><span className="hidden sm:inline">Back</span>
        </button>
        <div className="w-px h-5 bg-white/[0.07]" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0"><Sparkles size={11} className="text-white" /></div>
          <span className="text-white/80 text-sm font-medium truncate select-text">{resume.name}</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium shrink-0">Tailored</span>
          <span className="text-[10px] text-white/20 hidden lg:block ml-1">Select text to format · Drag grey area to pan · Scroll to zoom</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleDownload} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors">
            <Download size={13} /> Download PDF
          </button>
          {session?.user && (
            <AvatarDropdown name={session.user.name} email={session.user.email} role={session.user.role} credits={credits} onBuyCredits={() => setShowCreditsModal(true)} />
          )}
        </div>
      </header>

      {/* ── CANVA-STYLE FORMATTING TOOLBAR ───────────────────────────────────── */}
      <div className="h-[44px] bg-[#262626] border-b border-white/[0.07] flex items-center px-3 gap-0.5 shrink-0 z-20 overflow-x-auto">

        {/* Font family */}
        <select
          value={selFontFamily}
          onMouseDown={saveRange}
          onChange={e => applyFontFamily(e.target.value)}
          className="h-7 rounded px-2 text-[11px] text-white/80 bg-white/10 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 w-[130px] cursor-pointer shrink-0"
          title="Font family of selected text"
        >
          {TOOLBAR_FONTS.map(f => <option key={f} value={f} className="bg-[#1f1f1f]">{f}</option>)}
        </select>

        {/* Font size − [n] + */}
        <div className="flex items-center shrink-0 ml-1.5">
          <button
            title="Decrease font size"
            onMouseDown={e => { e.preventDefault(); applyFontSize(selFontSize - 1) }}
            className="w-6 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-l text-base leading-none transition-colors select-none"
          >
            −
          </button>
          <input
            type="number"
            value={selFontSize}
            min={6} max={72}
            title="Font size in pt"
            onMouseDown={e => { e.stopPropagation(); saveRange() }}
            onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setSelFontSize(v) }}
            onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) applyFontSize(v) }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyFontSize(selFontSize) } }}
            className="w-9 h-7 text-center text-[11px] text-white/80 bg-white/10 border-none focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            title="Increase font size"
            onMouseDown={e => { e.preventDefault(); applyFontSize(selFontSize + 1) }}
            className="w-6 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-r text-base leading-none transition-colors select-none"
          >
            +
          </button>
        </div>

        <TbDiv />

        {/* Text color */}
        <label
          className="flex flex-col items-center justify-center w-8 h-7 rounded cursor-pointer text-white/55 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          title="Text color"
          onMouseDown={e => e.preventDefault()}
        >
          <span className="text-[12px] font-bold leading-none">A</span>
          <div className="w-4 h-[3px] rounded-sm mt-[3px]" style={{ background: colorVal }} />
          <input type="color" value={colorVal} onChange={e => handleColorChange(e.target.value)} className="sr-only" />
        </label>

        <TbDiv />

        {/* Bold / Italic / Underline / Strikethrough */}
        <FmtBtn active={formats.bold} onClick={() => execCmd('bold')} title="Bold (Ctrl+B)">
          <span className="font-bold text-[13px]">B</span>
        </FmtBtn>
        <FmtBtn active={formats.italic} onClick={() => execCmd('italic')} title="Italic (Ctrl+I)">
          <span className="italic font-serif text-[13px]">I</span>
        </FmtBtn>
        <FmtBtn active={formats.underline} onClick={() => execCmd('underline')} title="Underline (Ctrl+U)">
          <span className="underline text-[13px]">U</span>
        </FmtBtn>
        <FmtBtn active={false} onClick={() => execCmd('strikeThrough')} title="Strikethrough">
          <span className="line-through text-[13px]">S</span>
        </FmtBtn>

        <TbDiv />

        {/* Text alignment */}
        <FmtBtn active={false} onClick={() => execCmd('justifyLeft')} title="Align left">
          <AlignLeft size={13} />
        </FmtBtn>
        <FmtBtn active={false} onClick={() => execCmd('justifyCenter')} title="Align center">
          <AlignCenter size={13} />
        </FmtBtn>
        <FmtBtn active={false} onClick={() => execCmd('justifyRight')} title="Align right">
          <AlignRight size={13} />
        </FmtBtn>

        <TbDiv />

        {/* Link */}
        <FmtBtn active={false} onClick={handleLink} title="Insert hyperlink">
          <Link2 size={12} /><span className="text-[11px]">Link</span>
        </FmtBtn>

        <TbDiv />

        {/* Add elements */}
        <FmtBtn active={false} onClick={addTextBox} title="Add a draggable text box">
          <Type size={12} /><span className="text-[11px]">Text</span>
        </FmtBtn>
        <FmtBtn active={false} onClick={() => imageInputRef.current?.click()} title="Add image or logo">
          <ImageIcon size={12} /><span className="text-[11px]">Image</span>
        </FmtBtn>

        <div className="flex-1 min-w-0" />

        <TbDiv />

        {/* Reset view */}
        <FmtBtn active={false} onClick={() => transformRef.current?.resetTransform()} title="Reset canvas to default position">
          <RotateCcw size={11} /><span className="text-[11px]">Reset</span>
        </FmtBtn>
      </div>

      {/* ── CANVAS ───────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          backgroundColor: '#2b2b2b',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          cursor: spaceDown ? 'grab' : 'default',
        }}
      >
        <TransformWrapper
          initialScale={0.75}
          minScale={0.1}
          maxScale={4}
          centerOnInit
          limitToBounds={false}
          smooth
          wheel={{ step: 0.05 }}
          panning={{ velocityDisabled: true, excluded: ['no-pan'] }}
          onTransform={(_ref, state) => { zoomRef.current = state.scale }}
          onZoomStop={(ref: ReactZoomPanPinchRef) => setZoom(ref.state.scale)}
        >
          {(controls) => {
            transformRef.current = controls
            return (
              <>
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{
                    padding: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    cursor: spaceDown ? 'grab' : 'default',
                  }}
                >
                  {/* ── Page 1: tailored resume ── */}
                  <div
                    className="no-pan bg-white relative"
                    style={{ width: 816, minHeight: 1056, boxShadow: '0 2px 8px rgba(0,0,0,0.35),0 16px 48px rgba(0,0,0,0.5)', cursor: 'text' }}
                  >
                    <EditableResumeIframe
                      ref={iframeHandle}
                      html={previewHtml}
                      zoom={zoom}
                      onSelectionRect={handleSelectionChange}
                    />
                    {overlays.map(el => (
                      <OverlayElement
                        key={el.id}
                        overlay={el}
                        scale={zoom}
                        onChange={updated => setOverlays(prev => prev.map(o => o.id === updated.id ? updated : o))}
                        onDelete={id => setOverlays(prev => prev.filter(o => o.id !== id))}
                      />
                    ))}
                  </div>

                  {/* ── Extra blank pages ── */}
                  {extraPages.map((pageId, idx) => (
                    <div
                      key={pageId}
                      className="no-pan bg-white relative group"
                      style={{ width: 816, minHeight: 1056, boxShadow: '0 2px 8px rgba(0,0,0,0.35),0 16px 48px rgba(0,0,0,0.5)', cursor: 'text' }}
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="w-full min-h-[1056px] p-10 outline-none text-sm text-gray-800 select-text"
                      />
                      <span className="absolute top-2 left-3 text-[10px] text-gray-300 pointer-events-none select-none">
                        Page {idx + 2}
                      </span>
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-red-500 bg-white/90 border border-gray-200 px-2 py-0.5 rounded-md transition-all"
                        onClick={() => setExtraPages(p => p.filter(id => id !== pageId))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* ── + Add page ── */}
                  <button
                    className="no-pan flex items-center justify-center gap-2 text-white/40 hover:text-white/80 text-sm transition-all border border-dashed border-white/20 hover:border-white/50 rounded-xl hover:bg-white/5 py-3"
                    style={{ width: 816 }}
                    onClick={() => setExtraPages(p => [...p, uid()])}
                  >
                    <Plus size={15} />
                    Add page
                  </button>
                </TransformComponent>

                {/* ── BOTTOM ZOOM PILL ─────────────────────────────────────── */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/[0.1] rounded-full shadow-2xl px-2 py-1 gap-0.5 z-10 select-none">
                  <button onClick={() => controls.zoomOut(0.25)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Zoom out">
                    <Minus size={14} />
                  </button>
                  <button onClick={() => controls.centerView(1)} className="min-w-[54px] text-center text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 rounded-full px-2 py-1.5 transition-colors" title="Reset to 100%">
                    {Math.round(zoom * 100)}%
                  </button>
                  <button onClick={() => controls.zoomIn(0.25)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Zoom in">
                    <Plus size={14} />
                  </button>
                  <div className="w-px h-5 bg-white/10 mx-1" />
                  <button onClick={() => controls.resetTransform()} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Fit to screen">
                    <Maximize2 size={13} />
                  </button>
                </div>
              </>
            )
          }}
        </TransformWrapper>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function printHtml(html: string) {
  const withPrint = html.replace('</body>', `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),800));<\/script></body>`)
  const win = window.open('', '_blank')
  if (!win) { alert('Pop-up blocked — please allow pop-ups for this site.'); return }
  win.document.write(withPrint)
  win.document.close()
}
