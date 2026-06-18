'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, Zap, CreditCard } from 'lucide-react'

interface Props {
  name?: string | null
  email?: string | null
  credits: number | null
  onBuyCredits: () => void
}

function initials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

const BG_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500',
]
function avatarColor(str?: string | null) {
  if (!str) return BG_COLORS[0]
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xfffffff
  return BG_COLORS[h % BG_COLORS.length]
}

export default function AvatarDropdown({ name, email, credits, onBuyCredits }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const label = initials(name, email)
  const bg = avatarColor(name ?? email)
  const low = credits !== null && credits <= 2

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-8 h-8 rounded-full ${bg} text-white text-xs font-bold flex items-center justify-center ring-2 ring-white hover:ring-blue-300 transition-all`}
      >
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-60 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-full ${bg} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                {label}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{name ?? 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="px-4 py-2.5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap size={13} className={low ? 'text-red-500' : 'text-amber-500'} />
                <span className={`text-sm font-semibold ${low ? 'text-red-500' : 'text-gray-800'}`}>
                  {credits ?? '…'} credits
                </span>
              </div>
              <button
                onClick={() => { setOpen(false); onBuyCredits() }}
                className="text-[11px] bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                <CreditCard size={11} /> Buy more
              </button>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${low ? 'bg-red-400' : 'bg-amber-400'}`}
                style={{ width: `${Math.min(100, ((credits ?? 0) / 50) * 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={14} className="text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
