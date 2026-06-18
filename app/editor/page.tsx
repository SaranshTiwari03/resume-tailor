'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
  ArrowLeft, Download, Minus, Plus, Maximize2, Sparkles,
} from 'lucide-react'
import { buildResumeHtml } from '@/lib/resume-template'
import type { ResumeData } from '@/types/resume'
import AvatarDropdown from '@/components/AvatarDropdown'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'

const ResumePreview = dynamic(() => import('@/components/ResumePreview'), { ssr: false })

const RESUME_DATA_KEY = 'rbt_resume_data'

export default function EditorPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [zoom, setZoom] = useState(0.75)
  const [credits, setCredits] = useState<number | null>(null)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Load resume from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(RESUME_DATA_KEY)
    if (!raw) { router.push('/'); return }
    try {
      setResume(JSON.parse(raw) as ResumeData)
    } catch {
      router.push('/')
    }
  }, [router])

  // Fetch credits
  useEffect(() => {
    if (!session?.user?.id) { setCredits(null); return }
    fetch('/api/user/credits')
      .then(r => r.json())
      .then(d => {
        if (d.unlimited) setCredits(-1)
        else if (typeof d.credits === 'number') setCredits(d.credits)
      })
      .catch(() => {})
  }, [session])

  // Space key → pan cursor (cosmetic)
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setSpaceDown(true)
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  const handleDownload = useCallback(() => {
    if (!resume) return
    const html = buildResumeHtml(resume, true)
    const win = window.open('', '_blank')
    if (!win) { alert('Pop-up blocked — please allow pop-ups for this site.'); return }
    win.document.write(
      html.replace(
        '</body>',
        `<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),800));<\/script></body>`,
      ),
    )
    win.document.close()
  }, [resume])

  // ── Loading state ──────────────────────────────────────────────────────────
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
      {showCreditsModal && (
        <InsufficientCreditsModal
          creditsRemaining={credits ?? 0}
          cost={2}
          onClose={() => setShowCreditsModal(false)}
        />
      )}

      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header className="h-[52px] bg-[#1f1f1f] border-b border-white/[0.08] flex items-center gap-2 px-3 shrink-0 z-20">

        {/* Left: back + title */}
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
          <span className="text-white/80 text-sm font-medium truncate max-w-[180px] select-text">
            {resume.name}
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium shrink-0">
            Tailored
          </span>
        </div>

        {/* Center: formatting tools placeholder — expands in next phase */}
        <div className="flex-1 flex items-center justify-center">
          {/* Rich text toolbar mounts here */}
        </div>

        {/* Right: download + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download size={13} />
            <span>Download PDF</span>
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
        ref={wrapperRef}
        className="flex-1 relative overflow-hidden bg-[#525659]"
        style={{ cursor: spaceDown ? 'grab' : 'default' }}
      >
        <TransformWrapper
          initialScale={0.75}
          minScale={0.1}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.08 }}
          panning={{ velocityDisabled: false }}
          onTransform={(_ref, state) => setZoom(state.scale)}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              {/* The pannable/zoomable surface */}
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{
                  padding: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '40px',
                  cursor: spaceDown ? 'grab' : 'default',
                }}
              >
                {/* Letter-size resume page (8.5in × 11in at 96dpi = 816 × 1056px) */}
                <div
                  className="bg-white select-text"
                  style={{
                    width: 816,
                    minHeight: 1056,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.5)',
                  }}
                >
                  <ResumePreview html={previewHtml} />
                </div>
              </TransformComponent>

              {/* ── BOTTOM ZOOM BAR ─────────────────────────────────────────── */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#1f1f1f]/95 backdrop-blur-sm border border-white/[0.08] rounded-full shadow-2xl px-2 py-1 gap-0.5 z-10">
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
                  title="Click to reset to 100%"
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

              {/* Keyboard hint — fades to bottom-right */}
              <p className="absolute bottom-6 right-5 text-[10px] text-white/20 pointer-events-none select-none">
                Scroll to zoom · Drag to pan
              </p>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  )
}
