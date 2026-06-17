'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  Loader2, Sparkles, Download, RotateCcw,
  ChevronDown, ChevronUp, SlidersHorizontal,
  FileText, PenLine,
} from 'lucide-react'
import StyleControls from '@/components/StyleControls'
import ResumeUpload from '@/components/ResumeUpload'
import AuthGateModal from '@/components/AuthGateModal'
import { buildResumeHtml } from '@/lib/resume-template'
import { DEFAULT_STYLES } from '@/types/resume'
import type { ResumeData, StyleConfig, TailorResponse } from '@/types/resume'

const ResumePreview = dynamic(() => import('@/components/ResumePreview'), { ssr: false })

const FREE_USE_KEY = 'rbt_free_used'

export default function Home() {
  const [resumeText, setResumeText] = useState('')
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [jd, setJd] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notesOpen, setNotesOpen] = useState(false)
  const [showStyles, setShowStyles] = useState(false)
  const [styles, setStyles] = useState<StyleConfig>(DEFAULT_STYLES)
  const [showAuthGate, setShowAuthGate] = useState(false)
  const [freeUsed, setFreeUsed] = useState(false)

  useEffect(() => {
    setFreeUsed(localStorage.getItem(FREE_USE_KEY) === 'true')
  }, [])

  const updateStyles = useCallback((s: StyleConfig) => {
    setStyles(s)
  }, [])

  const resumeWithStyles = useMemo(
    () => (resume ? { ...resume, styles } : null),
    [resume, styles]
  )

  const previewHtml = useMemo(
    () => (resumeWithStyles ? buildResumeHtml(resumeWithStyles) : null),
    [resumeWithStyles]
  )

  const handleResumeLoaded = (text: string) => {
    setResumeText(text)
    setResume(null)
    setNotes(null)
    setError(null)
  }

  const handleChangeResume = () => {
    setResumeText('')
    setResume(null)
    setNotes(null)
    setJd('')
    setCustomPrompt('')
    setError(null)
  }

  const handleTailor = async () => {
    if (!resumeText.trim() || !jd.trim()) return

    if (freeUsed) {
      setShowAuthGate(true)
      return
    }

    setLoading(true)
    setError(null)
    setNotes(null)
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jd, customPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')

      const tailored = data as TailorResponse
      setResume({ ...tailored, styles })
      setNotes(tailored.notes)
      setNotesOpen(true)

      localStorage.setItem(FREE_USE_KEY, 'true')
      setFreeUsed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResume(null)
    setNotes(null)
    setError(null)
  }

  const handleDownload = () => {
    if (!resumeWithStyles) return
    const html = buildResumeHtml(resumeWithStyles, true)
    const printHtml = html.replace(
      '</body>',
      `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},800);});<\/script></body>`
    )
    const win = window.open('', '_blank')
    if (!win) {
      alert('Pop-up blocked. Please allow pop-ups for this site.')
      return
    }
    win.document.write(printHtml)
    win.document.close()
  }

  // ── UPLOAD SCREEN ──────────────────────────────────────────────────
  if (!resumeText) {
    return (
      <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
        {/* minimal sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col px-5 pt-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Resume Tailor</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mt-1">
            Paste your resume, drop in a job description, and get a tailored version in seconds.
          </p>

          <div className="mt-6 space-y-3 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">1</span>
              <span>Paste your resume text</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">2</span>
              <span>Enter the job description</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">3</span>
              <span>Download your tailored PDF</span>
            </div>
          </div>

          <div className="mt-auto pb-5">
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              <strong>1 free tailor</strong> — no account needed to start.
            </div>
          </div>
        </aside>

        {/* upload content */}
        <main className="flex-1 overflow-auto">
          <ResumeUpload onResume={handleResumeLoaded} />
        </main>
      </div>
    )
  }

  // ── TAILOR SCREEN ──────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className="w-80 shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <h1 className="text-sm font-bold tracking-tight">Resume Tailor</h1>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {freeUsed
              ? <span className="text-amber-500 font-medium">Free tailor used — sign up to continue</span>
              : '1 free tailor · no account needed'}
          </p>
        </div>

        {/* Resume status */}
        <div className="px-4 py-2.5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={13} className="text-green-600" />
              <span className="text-xs font-medium text-gray-700">Resume loaded</span>
              <span className="text-[10px] text-gray-400">
                {resumeText.trim().split(/\s+/).length} words
              </span>
            </div>
            <button
              onClick={handleChangeResume}
              className="text-[10px] text-blue-500 hover:text-blue-700"
            >
              Change
            </button>
          </div>
        </div>

        {/* JD Input */}
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Job Description
          </label>
          <textarea
            className="w-full h-40 text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-300"
            placeholder="Paste JD, LinkedIn post, recruiter invite, career page text — anything describing the role…"
            value={jd}
            onChange={e => setJd(e.target.value)}
          />

          {/* Custom prompt toggle */}
          <button
            onClick={() => setShowCustomPrompt(p => !p)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <PenLine size={11} />
            {showCustomPrompt ? 'Hide custom instructions' : 'Add custom instructions'}
          </button>

          {showCustomPrompt && (
            <textarea
              className="w-full h-20 text-xs border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-gray-300"
              placeholder='e.g. "Emphasize product ownership. Keep summary under 2 sentences. Use action verbs."'
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
            />
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleTailor}
            disabled={loading || !jd.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <><Loader2 size={13} className="animate-spin" /> Tailoring…</>
            ) : (
              <><Sparkles size={13} /> {resume ? 'Re-tailor' : 'Tailor with AI'}</>
            )}
          </button>

          {resume && (
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1"
            >
              <RotateCcw size={11} /> Clear tailoring
            </button>
          )}
        </div>

        {/* AI Notes */}
        {notes && (
          <div className="px-4 py-2 border-b border-gray-100">
            <button
              onClick={() => setNotesOpen(o => !o)}
              className="flex items-center justify-between w-full text-xs font-medium text-green-700"
            >
              <span>✓ Tailoring complete</span>
              {notesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {notesOpen && (
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{notes}</p>
            )}
          </div>
        )}

        {/* Style Controls */}
        <div className="px-4 py-2.5 border-b border-gray-100">
          <button
            onClick={() => setShowStyles(s => !s)}
            className="flex items-center justify-between w-full text-xs font-medium text-gray-600 uppercase tracking-wide"
          >
            <span className="flex items-center gap-1.5"><SlidersHorizontal size={11} /> Style</span>
            {showStyles ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showStyles && (
            <div className="mt-3">
              <StyleControls styles={styles} onChange={updateStyles} />
            </div>
          )}
        </div>

        {/* Download */}
        <div className="px-4 py-3 mt-auto">
          <button
            onClick={handleDownload}
            disabled={!resume}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
          >
            <Download size={13} /> Download PDF
          </button>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center leading-tight">
            Opens print dialog — use Chrome&apos;s <em>Save as PDF</em> to keep clickable links
          </p>
        </div>

      </aside>

      {/* ── PREVIEW PANE ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
          <span className="text-xs text-gray-400">Preview</span>
          {resume && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
              Tailored
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto bg-gray-300 flex justify-center py-6">
          {previewHtml ? (
            <div className="bg-white shadow-lg" style={{ width: '8.5in', minHeight: '11in' }}>
              <ResumePreview html={previewHtml} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-16 h-16 bg-white rounded-2xl shadow flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-blue-400" />
              </div>
              <p className="text-gray-500 font-medium mb-1">Your tailored resume will appear here</p>
              <p className="text-sm text-gray-400">
                Paste a job description and hit <strong>Tailor with AI</strong>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
