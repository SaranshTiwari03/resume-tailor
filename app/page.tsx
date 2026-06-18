'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Loader2, Sparkles, RotateCcw,
  FileText, PenLine, ArrowRight,
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import ResumeUpload from '@/components/ResumeUpload'
import AuthGateModal from '@/components/AuthGateModal'
import InsufficientCreditsModal from '@/components/InsufficientCreditsModal'
import TailorModal from '@/components/TailorModal'
import { DEFAULT_STYLES } from '@/types/resume'
import type { ResumeData, StyleConfig, TailorResponse } from '@/types/resume'

const RESUME_TEXT_KEY = 'rbt_resume_text'
const RESUME_FILE_KEY = 'rbt_resume_filename'
const RESUME_DATA_KEY = 'rbt_resume_data'

const COST_BASIC = 2
const COST_PROMPT = 4

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  const [resumeText, setResumeText] = useState('')
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeData | null>(null)
  const [jd, setJd] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [styles, setStyles] = useState<StyleConfig>(DEFAULT_STYLES)
  const [credits, setCredits] = useState<number | null>(null)
  const [insufficientCost, setInsufficientCost] = useState(COST_BASIC)

  const [showAuthGate, setShowAuthGate] = useState(false)
  const [showCreditsModal, setShowCreditsModal] = useState(false)
  const [showTailorModal, setShowTailorModal] = useState(false)

  // Restore saved resume from localStorage (don't trigger tailor modal)
  useEffect(() => {
    const savedText = localStorage.getItem(RESUME_TEXT_KEY)
    const savedFile = localStorage.getItem(RESUME_FILE_KEY)
    const savedData = localStorage.getItem(RESUME_DATA_KEY)
    if (savedText) setResumeText(savedText)
    if (savedFile) setResumeFileName(savedFile)
    if (savedData) {
      try { setResume(JSON.parse(savedData)) } catch { /* ignore */ }
    }
  }, [])

  // Fetch credits when session loads (-1 = unlimited/admin)
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

  const updateStyles = useCallback((s: StyleConfig) => setStyles(s), [])

  const handleResumeLoaded = (text: string, fileName?: string) => {
    setResumeText(text)
    setResumeFileName(fileName ?? null)
    setResume(null)
    setError(null)
    localStorage.setItem(RESUME_TEXT_KEY, text)
    localStorage.setItem(RESUME_FILE_KEY, fileName ?? '')
    localStorage.removeItem(RESUME_DATA_KEY)
    // Show JD modal for fresh uploads (only if logged in, otherwise auth gate handles it)
    if (session) {
      setShowTailorModal(true)
    }
  }

  const handleChangeResume = () => {
    setResumeText('')
    setResumeFileName(null)
    setResume(null)
    setJd('')
    setCustomPrompt('')
    setError(null)
    localStorage.removeItem(RESUME_TEXT_KEY)
    localStorage.removeItem(RESUME_FILE_KEY)
    localStorage.removeItem(RESUME_DATA_KEY)
  }

  // Core tailor logic — called from both sidebar button and TailorModal
  const runTailor = async (tailorJd: string, tailorPrompt: string): Promise<void> => {
    if (!session) {
      setShowAuthGate(true)
      return
    }
    const cost = tailorPrompt.trim() ? COST_PROMPT : COST_BASIC
    const unlimited = credits === -1
    if (!unlimited && credits !== null && credits < cost) {
      setInsufficientCost(cost)
      setShowCreditsModal(true)
      throw new Error('Insufficient credits')
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jd: tailorJd, customPrompt: tailorPrompt }),
      })
      const data = await res.json()

      if (res.status === 402) {
        setInsufficientCost(data.cost ?? cost)
        if (typeof data.creditsRemaining === 'number') setCredits(data.creditsRemaining)
        setShowCreditsModal(true)
        throw new Error('Insufficient credits')
      }
      if (!res.ok) throw new Error(data.error ?? 'Request failed')

      const tailored = data as TailorResponse & { creditsRemaining?: number }
      const newResume = { ...tailored, styles }
      setResume(newResume)
      if (typeof tailored.creditsRemaining === 'number') setCredits(tailored.creditsRemaining)
      localStorage.setItem(RESUME_DATA_KEY, JSON.stringify(newResume))
      router.push('/editor')
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarTailor = async () => {
    if (!resumeText.trim() || !jd.trim()) return
    if (!session) { setShowAuthGate(true); return }
    try {
      await runTailor(jd, customPrompt)
    } catch (e) {
      if (e instanceof Error && e.message !== 'Insufficient credits') {
        setError(e.message)
      }
    }
  }

  const handleTailorModalSubmit = async (modalJd: string, modalPrompt: string) => {
    setJd(modalJd)
    setCustomPrompt(modalPrompt)
    await runTailor(modalJd, modalPrompt)
    setShowTailorModal(false)
  }

  // ── UPLOAD SCREEN ──────────────────────────────────────────────────
  if (!resumeText) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <TopBar
          styles={styles}
          onStyleChange={updateStyles}
          session={session}
          credits={credits}
          onBuyCredits={() => setShowCreditsModal(true)}
          showStyleControls={false}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Upload sidebar */}
          <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col px-5 py-6">
            <h2 className="text-sm font-bold text-gray-800 mb-1">Get started</h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Upload your resume PDF — we&apos;ll parse it and tailor it to any job description in seconds.
            </p>

            <div className="space-y-3 text-xs text-gray-500 mb-6">
              {['Upload your resume PDF', 'Paste a job description', 'Download your tailored PDF'].map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5 ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              {session ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700">
                  <p className="font-semibold mb-0.5">Ready to tailor</p>
                  <p className="text-green-600">{credits ?? '…'} credits available</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                  <p className="font-semibold mb-0.5">Free to start</p>
                  <p className="text-blue-600">Sign up for 7 free credits</p>
                </div>
              )}
            </div>
          </aside>

          <main className="flex-1 overflow-auto">
            <ResumeUpload onResume={handleResumeLoaded} />
          </main>
        </div>

        {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
        {showCreditsModal && (
          <InsufficientCreditsModal
            creditsRemaining={credits ?? 0}
            cost={insufficientCost}
            onClose={() => setShowCreditsModal(false)}
          />
        )}
      </div>
    )
  }

  // ── TAILOR SCREEN ──────────────────────────────────────────────────
  const cost = customPrompt.trim() ? COST_PROMPT : COST_BASIC

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Modals */}
      {showAuthGate && <AuthGateModal onClose={() => setShowAuthGate(false)} />}
      {showCreditsModal && (
        <InsufficientCreditsModal
          creditsRemaining={credits ?? 0}
          cost={insufficientCost}
          onClose={() => setShowCreditsModal(false)}
        />
      )}
      {showTailorModal && (
        <TailorModal
          fileName={resumeFileName}
          credits={credits}
          onTailor={handleTailorModalSubmit}
          onSkip={() => setShowTailorModal(false)}
        />
      )}

      {/* Top bar */}
      <TopBar
        styles={styles}
        onStyleChange={updateStyles}
        session={session}
        credits={credits}
        onBuyCredits={() => { setInsufficientCost(cost); setShowCreditsModal(true) }}
        showStyleControls={true}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-gray-200 overflow-y-auto">

          {/* Resume file */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={13} className="text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {resumeFileName ?? 'Resume loaded'}
                  </p>
                  <p className="text-[10px] text-gray-400">Ready to tailor</p>
                </div>
              </div>
              <button
                onClick={handleChangeResume}
                className="text-[11px] text-blue-500 hover:text-blue-700 font-medium shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          </div>

          {/* JD + Custom Prompt */}
          <div className="px-4 py-3 border-b border-gray-100 space-y-2.5 flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide block">
                Job Description
              </label>
              <textarea
                className="w-full h-36 text-xs border border-gray-200 rounded-xl p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-300 leading-relaxed"
                placeholder="Paste the job description, LinkedIn post, or recruiter message…"
                value={jd}
                onChange={e => setJd(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <PenLine size={10} /> Custom Instructions
                <span className="text-amber-500 font-normal normal-case">(4 cr)</span>
              </label>
              <textarea
                className="w-full h-20 text-xs border border-gray-200 rounded-xl p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-300"
                placeholder='e.g. "Highlight leadership. Remove the Cybrom job."'
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-2.5 py-2">{error}</p>
            )}

            <button
              onClick={handleSidebarTailor}
              disabled={loading || !jd.trim()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <><Loader2 size={13} className="animate-spin" /> Tailoring…</>
              ) : (
                <><Sparkles size={13} />
                  {resume ? 'Re-tailor' : 'Tailor with AI'}
                  <span className="opacity-60 font-normal">({cost} cr)</span>
                </>
              )}
            </button>

            {resume && (
              <button
                onClick={() => { setResume(null); setError(null) }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 py-1"
              >
                <RotateCcw size={11} /> Clear tailoring
              </button>
            )}
          </div>

          {/* Open Editor */}
          <div className="px-4 py-3 mt-auto">
            <button
              onClick={() => router.push('/editor')}
              disabled={!resume}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <ArrowRight size={13} /> Open in Editor
            </button>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center leading-tight">
              Edit, fine-tune and download your tailored resume
            </p>
          </div>
        </aside>

        {/* ── EDITOR PREVIEW ── */}
        <main className="flex-1 overflow-hidden flex flex-col bg-[#525659]">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            {loading ? (
              <>
                <Loader2 size={32} className="text-white/40 animate-spin" />
                <p className="text-white/60 text-sm font-medium">Tailoring your resume…</p>
                <p className="text-white/30 text-xs">Opening editor when done</p>
              </>
            ) : resume ? (
              <>
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} className="text-emerald-400" />
                </div>
                <p className="text-white/80 font-semibold">Resume tailored</p>
                <p className="text-white/40 text-xs">Click &quot;Open in Editor&quot; to edit and download</p>
                <button
                  onClick={() => router.push('/editor')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <ArrowRight size={15} /> Open Editor
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} className="text-white/20" />
                </div>
                <p className="text-white/50 font-medium text-sm">Tailor your resume to open the editor</p>
                <p className="text-white/25 text-xs">Paste a job description and hit Tailor with AI</p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
