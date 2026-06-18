'use client'

import { useState } from 'react'
import { Sparkles, Loader2, PenLine, X, Zap } from 'lucide-react'

interface Props {
  fileName: string | null
  credits: number | null
  onTailor: (jd: string, customPrompt: string) => Promise<void>
  onSkip: () => void
}

const COST_BASIC = 2
const COST_PROMPT = 4

export default function TailorModal({ fileName, credits, onTailor, onSkip }: Props) {
  const [jd, setJd] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cost = prompt.trim() ? COST_PROMPT : COST_BASIC
  const canAfford = credits === null || credits === -1 || credits >= cost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jd.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onTailor(jd.trim(), prompt.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Tailor to a job</h2>
              <p className="text-xs text-gray-400">
                {fileName ? `${fileName} uploaded` : 'Resume uploaded'} · paste a job description to optimize
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              autoFocus
              required
              value={jd}
              onChange={e => { setJd(e.target.value); setError(null) }}
              rows={7}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 leading-relaxed"
              placeholder="Paste the job posting, LinkedIn description, recruiter message — anything that describes the role…"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <PenLine size={11} /> Custom Instructions
              <span className="text-[10px] text-amber-500 font-normal normal-case">(costs 4 credits)</span>
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
              placeholder='e.g. "Highlight leadership. Remove the Cybrom job. Keep summary under 2 lines."'
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {!canAfford && credits !== -1 && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Zap size={13} /> Not enough credits — {credits} remaining, this costs {cost}.
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !jd.trim() || !canAfford}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Tailoring…</>
              ) : (
                <><Sparkles size={15} /> Tailor Now
                  <span className="text-xs opacity-70 font-normal">({cost} credits)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onSkip}
              disabled={loading}
              className="px-5 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40"
            >
              Later
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
