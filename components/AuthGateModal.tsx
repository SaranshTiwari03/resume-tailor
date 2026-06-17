'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

interface AuthGateModalProps {
  onClose: () => void
  onSuccess?: () => void
}

const FEATURES = [
  'Unlimited resume tailoring',
  'AI-powered ATS optimization',
  'Live preview + PDF export',
  'Custom instructions per application',
]

export default function AuthGateModal({ onClose, onSuccess }: AuthGateModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }

    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('Signup succeeded but login failed. Please sign in manually.'); setLoading(false); return }
    onSuccess?.()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) { setError('Invalid email or password.'); setLoading(false); return }
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-3.5 right-3.5 text-gray-300 hover:text-gray-500">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Resume Tailor</span>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">
          {mode === 'signup' ? "You've used your free tailor" : 'Welcome back'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {mode === 'signup'
            ? 'Create a free account for unlimited tailoring.'
            : 'Sign in to continue tailoring.'}
        </p>

        {mode === 'signup' && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-2.5">
          {mode === 'signup' && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'Password (min 6 chars)' : 'Password'}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> {mode === 'signup' ? 'Creating…' : 'Signing in…'}</>
              : mode === 'signup' ? 'Create free account' : 'Sign in'}
          </button>
        </form>

        <button
          onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(null) }}
          className="w-full text-xs text-gray-400 hover:text-gray-600 mt-3 text-center"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up free"}
        </button>
      </div>
    </div>
  )
}
