'use client'

import Link from 'next/link'
import { Sparkles, RotateCcw, LogIn, Minus, Plus, Zap } from 'lucide-react'
import AvatarDropdown from './AvatarDropdown'
import type { StyleConfig } from '@/types/resume'
import { DEFAULT_STYLES } from '@/types/resume'
import { FONT_GROUPS, WEIGHT_NAME } from '@/lib/fonts'

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
    <div className="flex flex-col items-center gap-[3px] shrink-0">
      <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none font-medium">{label}</span>
      <div className="flex items-center bg-gray-100 hover:bg-gray-200/70 rounded-lg px-1 py-0.5 transition-colors">
        <button onClick={dec} disabled={value <= min}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 rounded transition-colors">
          <Minus size={9} />
        </button>
        <span className="text-[11px] font-semibold text-gray-700 w-11 text-center tabular-nums">
          {decimals > 0 ? value.toFixed(decimals) : value}{unit}
        </span>
        <button onClick={inc} disabled={value >= max}
          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-25 rounded transition-colors">
          <Plus size={9} />
        </button>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="h-6 w-px bg-gray-200 mx-1 shrink-0" />
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
  const low = credits !== null && credits !== -1 && credits <= 2

  return (
    <header className="h-[52px] bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 z-30">

      {/* ── Logo ─────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center gap-2 shrink-0 group">
        <div className="w-7 h-7 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
          <Sparkles size={13} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm hidden sm:block">Resume Tailor</span>
      </Link>

      {/* ── Style controls (tailor screen) ───────────────────── */}
      {showStyleControls ? (
        <>
          <Divider />
          <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide min-w-0">

            {/* Font family + weight */}
            <div className="flex flex-col items-start gap-[3px] shrink-0">
              <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none font-medium">Font</span>
              <div className="flex items-center gap-1">
                <select
                  value={styles.fontFamily}
                  onChange={e => set({ fontFamily: e.target.value })}
                  className="text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/70 border-none rounded-lg px-2 h-[26px] focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer max-w-[160px] transition-colors"
                >
                  {FONT_GROUPS.map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.fonts.map(f => (
                        <option key={f.family} value={f.family}>{f.family}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <select
                  value={styles.fontWeight ?? 400}
                  onChange={e => set({ fontWeight: parseInt(e.target.value) })}
                  className="text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200/70 border-none rounded-lg px-2 h-[26px] focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer w-[88px] transition-colors"
                >
                  {(FONT_GROUPS.flatMap(g => g.fonts).find(f => f.family === styles.fontFamily)?.weights ?? [400, 700]).map(w => (
                    <option key={w} value={w}>{WEIGHT_NAME[w] ?? w}</option>
                  ))}
                </select>
              </div>
            </div>

            <Divider />

            <Stepper label="Size" value={styles.baseFontSize} unit="pt"
              min={7} max={11} step={0.1} decimals={1}
              onChange={v => set({ baseFontSize: v })} />

            <Stepper label="Line H" value={styles.lineHeight}
              min={1.1} max={1.6} step={0.05} decimals={2}
              onChange={v => set({ lineHeight: v })} />

            <Divider />

            <Stepper label="Sec gap" value={styles.sectionSpacing} unit="px"
              min={3} max={14} step={1}
              onChange={v => set({ sectionSpacing: v })} />

            <Stepper label="Job gap" value={styles.jobSpacing} unit="px"
              min={2} max={12} step={1}
              onChange={v => set({ jobSpacing: v })} />

            <Divider />

            <Stepper label="Margin" value={styles.pageMargin ?? 0.5} unit="in"
              min={0.3} max={0.9} step={0.05} decimals={2}
              onChange={v => set({ pageMargin: v })} />

            <Divider />

            {/* Accent color */}
            <div className="flex flex-col items-center gap-[3px] shrink-0">
              <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none font-medium">Accent</span>
              <label className="flex flex-col items-center justify-center w-[42px] h-[26px] rounded-lg bg-gray-100 hover:bg-gray-200/70 cursor-pointer transition-colors relative overflow-hidden" title="Section heading & name colour">
                <div className="w-5 h-3.5 rounded-sm border border-gray-300/60" style={{ background: styles.accentColor ?? '#000000' }} />
                <input
                  type="color"
                  value={styles.accentColor ?? '#000000'}
                  onChange={e => set({ accentColor: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>

            <Divider />

            {/* Reset */}
            <button
              onClick={() => onStyleChange(DEFAULT_STYLES)}
              className="flex flex-col items-center gap-[3px] shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              title="Reset all styles to default"
            >
              <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none font-medium">Reset</span>
              <div className="w-[42px] h-[26px] flex items-center justify-center bg-gray-100 hover:bg-gray-200/70 rounded-lg transition-colors">
                <RotateCcw size={11} className="text-gray-600" />
              </div>
            </button>
          </div>
        </>
      ) : (
        /* ── Nav links (upload/landing screen) ──────────────── */
        <nav className="flex items-center gap-1 ml-4 flex-1">
          <span className="text-xs text-gray-400 px-3 py-1.5">
            AI-powered resume tailoring for any job
          </span>
        </nav>
      )}

      {/* ── Right: credits + avatar/sign-in ──────────────────── */}
      <div className="flex items-center gap-2.5 shrink-0 ml-auto">

        {/* Inline credits badge (only when logged in + not unlimited) */}
        {session && credits !== null && credits !== -1 && (
          <button
            onClick={onBuyCredits}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
              low
                ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                : 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
            }`}
            title="Buy more credits"
          >
            <Zap size={11} className={low ? 'text-red-500' : 'text-amber-500'} />
            {credits} cr
          </button>
        )}
        {session && credits === -1 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-200">
            <Zap size={11} className="text-violet-500" /> ∞
          </span>
        )}

        {session ? (
          <AvatarDropdown
            name={session.user.name}
            email={session.user.email}
            role={session.user.role}
            credits={credits}
            onBuyCredits={onBuyCredits}
          />
        ) : (
          <Link href="/login"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm">
            <LogIn size={12} /> Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
