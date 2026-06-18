'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
  ArrowLeft, Download, Minus, Plus, Maximize2,
  Sparkles, Type, Image as ImageIcon,
} from 'lucide-react'
import { buildResumeHtml } from '@/lib/resume-template'
import type { ResumeData } from '@/types/resume'
import AvatarDropdown from '@/components/AvatarDropdown'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'
import FloatingToolbar from '@/components/FloatingToolbar'
import OverlayElement, { type Overlay } from '@/components/OverlayElement'
import type { EditableIframeHandle } from '@/components/EditableResumeIframe'

// Dynamically import the iframe editor (client-only)
const EditableResumeIframe = dynamic(
  () => import('@/components/EditableResumeIframe'),
  { ssr: false },
)

const RESUME_DATA_KEY = 'rbt_resume_data'
let _counter = 0
const uid = () => `el-${++_counter}`

export default function EditorPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [resume, setResume] = useState<ResumeData | null>(null)
  const [zoom, setZoom] = useState(0.75)
  const [credits, setCredits] = useState<number | null>(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [spaceDown, setSpaceDown] = useState(false)

  // Floating toolbar state
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false })
  const [colorVal, setColorVal] = useState('#000000')

  const iframeHandle = useRef<EditableIframeHandle>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  // Keep a ref to current zoom for the selection rect callback
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom

  // ── Load resume from localStorage ─────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem(RESUME_DATA_KEY)
    if (!raw) { router.push('/'); return }
    try { setResume(JSON.parse(raw) as ResumeData) }
    catch { router.push('/') }
  }, [router])

  // ── Fetch credits ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) { setCredits(null); return }
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(d => { if (d.unlimited) setCredits(-1); else if (typeof d.credits === 'number') setCredits(d.credits) })
      .catch(() => {})
  }, [session])

  // ── Space key → pan cursor ─────────────────────────────────────────────────
  useEffect(() => {
    const isEditable = (t: EventTarget | null) =>
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      (t instanceof HTMLElement && t.contentEditable === 'true')
    const dn = (e: KeyboardEvent) => { if (e.code === 'Space' && !isEditable(e.target)) { e.preventDefault(); setSpaceDown(true) } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceDown(false) }
    window.addEventListener('keydown', dn)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up) }
  }, [])

  // ── Selection callback from iframe ─────────────────────────────────────────
  // The rect comes in iframe-local coordinates (before CSS transform).
  // We convert to screen coords using the current zoom and the iframe's visual rect.
  const handleSelectionRect = useCallback((rect: DOMRect | null, iframeEl: HTMLIFrameElement | null) => {
    if (!rect || !iframeEl || rect.width === 0) {
      setToolbarPos(null)
      return
    }
    const iframeScreenRect = iframeEl.getBoundingClientRect()
    const scale = zoomRef.current
    setToolbarPos({
      x: iframeScreenRect.left + (rect.left + rect.width / 2) * scale,
      y: iframeScreenRect.top + rect.top * scale,
    })
    // Sync format buttons from iframe document
    const d = iframeHandle.current?.getDoc()
    if (d) {
      setFormats({
        bold: d.queryCommandState('bold'),
        italic: d.queryCommandState('italic'),
        underline: d.queryCommandState('underline'),
      })
    }
  }, [])

  // ── execCommand bridge ─────────────────────────────────────────────────────
  const execCmd = useCallback((cmd: string, value?: string) => {
    iframeHandle.current?.execCmd(cmd, value)
    // Re-sync formats after command
    const d = iframeHandle.current?.getDoc()
    if (d) {
      setFormats({
        bold: d.queryCommandState('bold'),
        italic: d.queryCommandState('italic'),
        underline: d.queryCommandState('underline'),
      })
    }
  }, [])

  const handleColorChange = useCallback((color: string) => {
    setColorVal(color)
    execCmd('foreColor', color)
  }, [execCmd])

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    if (!resume) return

    // Get edited HTML from the iframe
    const editedFullHtml = iframeHandle.current?.getHtml() ?? buildResumeHtml(resume, true)

    // Inject overlay elements into the HTML before the closing </body>
    if (overlays.length > 0) {
      const overlayHtml = overlays.map(el => {
        const style = `position:absolute;left:${Math.round(el.x)}px;top:${Math.round(el.y)}px;width:${el.width}px;`
        if (el.type === 'text') return `<div style="${style}font-size:inherit;">${el.content}</div>`
        return `<img src="${el.content}" alt="" style="${style}" />`
      }).join('\n')

      const withOverlays = editedFullHtml.replace(
        '</body>',
        `<div style="position:relative;">${overlayHtml}</div></body>`,
      )
      printHtml(withOverlays)
    } else {
      printHtml(editedFullHtml)
    }
  }, [resume, overlays])

  // ── Add elements ───────────────────────────────────────────────────────────
  const addTextBox = useCallback(() => {
    setOverlays(prev => [...prev, {
      id: uid(),
      type: 'text',
      x: 48,
      y: 48 + prev.length * 64,
      width: 220,
      content: 'Click to edit this text',
    }])
  }, [])

  const onImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setOverlays(prev => [...prev, {
        id: uid(),
        type: 'image',
        x: 48,
        y: 48,
        width: 160,
        content: ev.target?.result as string,
      }])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!resume) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#525659]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  const previewHtml = buildResumeHtml(resume)

  return (
    <div className="flex flex-col h-screen overflow-hidden select-none">

      {/* Modals */}
      {showCreditsModal && (
        <InsufficientCreditsModal creditsRemaining={credits ?? 0} cost={2} onClose={() => setShowCreditsModal(false)} />
      )}

      {/* Hidden image picker */}
      <input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={onImageFile} />

      {/* Floating text toolbar — rendered outside canvas so it's not scaled */}
      <FloatingToolbar
        position={toolbarPos}
        formats={formats}
        colorVal={colorVal}
        onExec={execCmd}
        onColorChange={handleColorChange}
      />

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header className="h-[52px] bg-[#1f1f1f] border-b border-white/[0.08] flex items-center gap-2 px-3 shrink-0 z-20">

        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-200 text-xs transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-5 bg-white/[0.08]" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="text-white/80 text-sm font-medium truncate max-w-[160px] select-text">
            {resume.name}
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium shrink-0">
            Tailored
          </span>
        </div>

        {/* Centre: add-element buttons */}
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="flex items-center bg-white/5 border border-white/[0.08] rounded-lg overflow-hidden">
            <button
              onClick={addTextBox}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 text-xs transition-colors border-r border-white/[0.08]"
              title="Add a draggable text box"
            >
              <Type size={13} /> Text
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white hover:bg-white/10 px-3 py-1.5 text-xs transition-colors"
              title="Add image or logo"
            >
              <ImageIcon size={13} /> Image
            </button>
          </div>
          <span className="text-[10px] text-white/20 hidden lg:block">
            Select text to format · Drag background to pan · Scroll to zoom
          </span>
        </div>

        {/* Right: download + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download size={13} /> Download PDF
          </button>
          {session?.user && (
            <AvatarDropdown
              name={session.user.name}
              email={session.user.email}
              credits={credits}
              onBuyCredits={() => setShowCreditsModal(true)}
            />
          )}
        </div>
      </header>

      {/* ── CANVAS ──────────────────────────────────────────────────────────── */}
      <div
        className="flex-1 relative overflow-hidden bg-[#525659]"
        style={{ cursor: spaceDown ? 'grab' : 'default' }}
      >
        <TransformWrapper
          initialScale={0.75}
          minScale={0.1}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.08 }}
          panning={{
            velocityDisabled: false,
            excluded: ['no-pan'],
          }}
          onTransform={(_ref, state) => {
            setZoom(state.scale)
            zoomRef.current = state.scale
          }}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{
                  padding: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: spaceDown ? 'grab' : 'default',
                }}
              >
                {/* Letter-size resume page: 8.5in × 11in @ 96dpi = 816 × 1056px */}
                <div
                  className="no-pan bg-white relative"
                  style={{
                    width: 816,
                    minHeight: 1056,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.5)',
                    cursor: 'text',
                  }}
                >
                  {/* Editable resume — drives the iframe document */}
                  <EditableResumeIframe
                    ref={iframeHandle}
                    html={previewHtml}
                    zoom={zoom}
                    onSelectionRect={handleSelectionRect}
                  />

                  {/* Draggable overlays (text boxes + images) */}
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
              </TransformComponent>

              {/* ── BOTTOM ZOOM BAR ─────────────────────────────────────────── */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#1f1f1f]/95 backdrop-blur-sm border border-white/[0.08] rounded-full shadow-2xl px-2 py-1 gap-0.5 z-10 select-none">
                <button
                  onClick={() => zoomOut(0.25)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Zoom out"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => centerView(1)}
                  className="min-w-[56px] text-center text-xs font-mono text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-2 py-1.5 transition-colors"
                  title="Click for 100%"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={() => zoomIn(0.25)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Zoom in"
                >
                  <Plus size={14} />
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button
                  onClick={() => resetTransform()}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Fit to screen"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function printHtml(html: string) {
  const withPrint = html.replace(
    '</body>',
    `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),800));<\/script></body>`,
  )
  const win = window.open('', '_blank')
  if (!win) { alert('Pop-up blocked — please allow pop-ups for this site.'); return }
  win.document.write(withPrint)
  win.document.close()
}
