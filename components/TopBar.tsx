'use client'

import Link from 'next/link'
import { Sparkles, RotateCcw, LogIn, ShieldCheck, Minus, Plus } from 'lucide-react'
import AvatarDropdown from './AvatarDropdown'
import type { StyleConfig } from '@/types/resume'
import { DEFAULT_STYLES } from '@/types/resume'

const FONT_LIST = [
  'IBM Plex Sans Condensed', 'IBM Plex Sans', 'Inter', 'Roboto',
  'Open Sans', 'Lato', 'Montserrat', 'Source Sans 3',
  'DM Sans', 'Poppins', 'Merriweather', 'Playfair Display', 'Georgia',
]

interface StepperProps {
  label: string
  value: number
  unit?: string
  min: number
  max: number
  step: number
  decimals?: number
  onChange: (v: number) => void
}

function Stepper({ label, value, unit = '', min, max, step, decimals = 0, onChange }: StepperProps) {
  const dec = () => onChange(Math.max(min, parseFloat((value - step).toFixed(decimals + 1))))
  const inc = () => onChange(Math.min(max, parseFloat((value + step).toFixed(decimals + 1))))
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none">{label}</span>
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-md px-1 py-0.5">
        <button
          onClick={dec} disabled={value <= min}
          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded transition-colors"
        >
          <Minus size={9} />
        </button>
        <span className="text-[11px] font-medium text-gray-800 w-10 text-center tabular-nums">
          {decimals > 0 ? value.toFixed(decimals) : value}{unit}
        </span>
        <button
          onClick={inc} disabled={value >= max}
          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-800 disabled:opacity-30 rounded transition-colors"
        >
          <Plus size={9} />
        </button>
      </div>
    </div>
  )
}

interface Props {
  styles: StyleConfig
  onStyleChange: (s: StyleConfig) => void
  session: { user: { name?: string | null; email?: string | null; role?: string } } | null
  credits: number | null
  onBuyCredits: () => void
  showStyleControls: boolean
}

export default function TopBar({ styles, onStyleChange, session, credits, onBuyCredits, showStyleControls }: Props) {
  const set = (patch: Partial<StyleConfig>) => onStyleChange({ ...styles, ...patch })

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0 mr-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <Sparkles size={13} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm hidden sm:block">Resume Tailor</span>
      </div>

      {/* Divider */}
      {showStyleControls && <div className="h-6 w-px bg-gray-200 shrink-0" />}

      {/* Style controls */}
      {showStyleControls && (
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {/* Font family */}
          <div className="flex flex-col items-start gap-0.5 shrink-0">
            <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none">Font</span>
            <select
              value={styles.fontFamily}
              onChange={e => set({ fontFamily: e.target.value })}
              className="text-[11px] font-medium text-gray-800 bg-gray-100 border-none rounded-md px-2 py-0.5 h-[26px] focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {FONT_LIST.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="h-6 w-px bg-gray-200 shrink-0" />

          <Stepper
            label="Size" value={styles.baseFontSize} unit="pt"
            min={7} max={11} step={0.1} decimals={1}
            onChange={v => set({ baseFontSize: v })}
          />

          <div className="h-6 w-px bg-gray-200 shrink-0" />

          <Stepper
            label="Line H" value={styles.lineHeight}
            min={1.1} max={1.6} step={0.05} decimals={2}
            onChange={v => set({ lineHeight: v })}
          />

          <div className="h-6 w-px bg-gray-200 shrink-0" />

          <Stepper
            label="Sec gap" value={styles.sectionSpacing} unit="px"
            min={3} max={14} step={1}
            onChange={v => set({ sectionSpacing: v })}
          />

          <Stepper
            label="Job gap" value={styles.jobSpacing} unit="px"
            min={2} max={12} step={1}
            onChange={v => set({ jobSpacing: v })}
          />

          <div className="h-6 w-px bg-gray-200 shrink-0" />

          {/* Reset */}
          <button
            onClick={() => onStyleChange(DEFAULT_STYLES)}
            className="flex flex-col items-center gap-0.5 opacity-50 hover:opacity-100 transition-opacity shrink-0"
            title="Reset to defaults"
          >
            <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none">Reset</span>
            <div className="w-[26px] h-[26px] flex items-center justify-center bg-gray-100 rounded-md">
              <RotateCcw size={11} className="text-gray-600" />
            </div>
          </button>
        </div>
      )}

      {/* Spacer */}
      {!showStyleControls && <div className="flex-1" />}

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {session ? (
          <>
            {session.user.role === 'admin' && (
              <Link href="/admin" className="text-[11px] text-amber-600 hover:underline flex items-center gap-1">
                <ShieldCheck size={12} /> Admin
              </Link>
            )}
            <AvatarDropdown
              name={session.user.name}
              email={session.user.email}
              credits={credits}
              onBuyCredits={onBuyCredits}
            />
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogIn size={13} /> Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
