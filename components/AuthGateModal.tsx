'use client'

import { useState } from 'react'
import { X, Sparkles, CheckCircle2, Lock } from 'lucide-react'

interface AuthGateModalProps {
  onClose: () => void
}

const FEATURES = [
  'Unlimited resume tailoring',
  'AI-powered ATS keyword optimization',
  'Live preview + one-click PDF export',
  'Custom instructions for every application',
  'Style controls — font, spacing, size',
]

export default function AuthGateModal({ onClose }: AuthGateModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleNotify = () => {
    const trimmed = email.trim()
    if (!trimmed.includes('@')) return
    localStorage.setItem('rbt_waitlist_email', trimmed)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Resume Tailor</span>
        </div>

        {/* Headline */}
        <div className="flex items-start gap-2 mb-1">
          <Lock size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            You&apos;ve used your free tailor
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-5 pl-6">
          Create an account to continue — unlimited tailoring for{' '}
          <strong className="text-gray-800">$5&thinsp;/&thinsp;month</strong>.
        </p>

        {/* Pricing card */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-extrabold text-gray-900">$5</span>
            <span className="text-sm text-gray-400 font-medium">/ month</span>
          </div>
          <div className="space-y-1.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!submitted ? (
          <>
            <p className="text-xs text-gray-400 text-center mb-3">
              Account system launching soon — be the first to know.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNotify()}
                placeholder="your@email.com"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
              />
              <button
                onClick={handleNotify}
                disabled={!email.includes('@')}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Notify me
              </button>
            </div>
          </>
        ) : (
          <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>
              You&apos;re on the list! We&apos;ll email <strong>{email}</strong> when it&apos;s ready.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
