'use client'

import Link from 'next/link'
import { Sparkles, RotateCcw, LogIn, Minus, Plus } from 'lucide-react'
import AvatarDropdown from './AvatarDropdown'
import type { StyleConfig } from '@/types/resume'
import { DEFAULT_STYLES } from '@/types/resume'

const WEIGHT_NAME: Record<number, string> = {
  300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold',
}

const FONT_GROUPS = [
  {
    label: 'Modern Sans',
    fonts: [
      { family: 'Inter',             weights: [300, 400, 500, 600, 700] },
      { family: 'DM Sans',           weights: [300, 400, 500, 600, 700] },
      { family: 'Plus Jakarta Sans', weights: [300, 400, 500, 600, 700] },
      { family: 'Nunito Sans',       weights: [300, 400, 600, 700] },
      { family: 'Outfit',            weights: [300, 400, 500, 600, 700] },
      { family: 'Figtree',           weights: [300, 400, 500, 600, 700] },
      { family: 'Sora',              weights: [300, 400, 500, 600, 700] },
      { family: 'Urbanist',          weights: [300, 400, 500, 600, 700] },
      { family: 'Manrope',           weights: [300, 400, 500, 600, 700] },
      { family: 'Be Vietnam Pro',    weights: [300, 400, 500, 600, 700] },
      { family: 'Lexend',            weights: [300, 400, 500, 600, 700] },
      { family: 'Mulish',            weights: [300, 400, 500, 600, 700] },
      { family: 'Work Sans',         weights: [300, 400, 500, 600, 700] },
      { family: 'Karla',             weights: [300, 400, 500, 600, 700] },
      { family: 'Rubik',             weights: [300, 400, 500, 600, 700] },
      { family: 'Jost',              weights: [300, 400, 500, 600, 700] },
      { family: 'Quicksand',         weights: [300, 400, 500, 600, 700] },
      { family: 'Onest',             weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Classic Sans',
    fonts: [
      { family: 'Open Sans',     weights: [300, 400, 600, 700] },
      { family: 'Roboto',        weights: [300, 400, 500, 700] },
      { family: 'Lato',          weights: [300, 400, 700] },
      { family: 'Source Sans 3', weights: [300, 400, 600, 700] },
      { family: 'Noto Sans',     weights: [300, 400, 600, 700] },
      { family: 'Ubuntu',        weights: [300, 400, 500, 700] },
      { family: 'Hind',          weights: [300, 400, 500, 600, 700] },
      { family: 'Titillium Web', weights: [300, 400, 600, 700] },
      { family: 'Exo 2',         weights: [300, 400, 500, 600, 700] },
      { family: 'Mukta',         weights: [300, 400, 500, 600, 700] },
      { family: 'Oxygen',        weights: [300, 400, 700] },
    ],
  },
  {
    label: 'Geometric',
    fonts: [
      { family: 'Montserrat',  weights: [300, 400, 500, 600, 700] },
      { family: 'Poppins',     weights: [300, 400, 500, 600, 700] },
      { family: 'Raleway',     weights: [300, 400, 500, 600, 700] },
      { family: 'Josefin Sans',weights: [300, 400, 600, 700] },
      { family: 'Nunito',      weights: [300, 400, 600, 700] },
      { family: 'Comfortaa',   weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Condensed',
    fonts: [
      { family: 'IBM Plex Sans Condensed', weights: [300, 400, 500, 600, 700] },
      { family: 'Barlow Condensed',        weights: [300, 400, 500, 600, 700] },
      { family: 'Barlow Semi Condensed',   weights: [300, 400, 500, 600, 700] },
      { family: 'Roboto Condensed',        weights: [300, 400, 500, 600, 700] },
      { family: 'Oswald',                  weights: [300, 400, 500, 600, 700] },
      { family: 'Yanone Kaffeesatz',       weights: [300, 400, 500, 600, 700] },
      { family: 'Saira Condensed',         weights: [300, 400, 500, 600, 700] },
    ],
  },
  {
    label: 'Humanist',
    fonts: [
      { family: 'IBM Plex Sans', weights: [300, 400, 500, 600, 700] },
      { family: 'Cabin',         weights: [400, 500, 600, 700] },
      { family: 'Fira Sans',     weights: [300, 400, 500, 600, 700] },
      { family: 'Dosis',         weights: [300, 400, 500, 600, 700] },
      { family: 'Catamaran',     weights: [300, 400, 500, 600, 700] },
      { family: 'Arimo',         weights: [400, 500, 600, 700] },
      { family: 'PT Sans',       weights: [400, 700] },
    ],
  },
  {
    label: 'Serif',
    fonts: [
      { family: 'Merriweather',       weights: [300, 400, 700] },
      { family: 'Playfair Display',   weights: [400, 500, 600, 700] },
      { family: 'Lora',               weights: [400, 500, 600, 700] },
      { family: 'EB Garamond',        weights: [400, 500, 600, 700] },
      { family: 'Crimson Pro',        weights: [300, 400, 600, 700] },
      { family: 'Spectral',           weights: [300, 400, 600, 700] },
      { family: 'Cormorant Garamond', weights: [300, 400, 500, 600, 700] },
      { family: 'Libre Baskerville',  weights: [400, 700] },
      { family: 'PT Serif',           weights: [400, 700] },
      { family: 'Bitter',             weights: [300, 400, 500, 600, 700] },
      { family: 'Arvo',               weights: [400, 700] },
      { family: 'Zilla Slab',         weights: [300, 400, 500, 600, 700] },
      { family: 'Vollkorn',           weights: [400, 500, 600, 700] },
      { family: 'Cardo',              weights: [400, 700] },
      { family: 'Libre Caslon Text',  weights: [400, 700] },
    ],
  },
  {
    label: 'Display',
    fonts: [
      { family: 'Bebas Neue', weights: [400] },
      { family: 'Anton',      weights: [400] },
      { family: 'Exo',        weights: [300, 400, 500, 600, 700] },
      { family: 'Audiowide',  weights: [400] },
      { family: 'Righteous',  weights: [400] },
    ],
  },
  {
    label: 'Monospace',
    fonts: [
      { family: 'JetBrains Mono', weights: [300, 400, 500, 600, 700] },
      { family: 'Fira Code',      weights: [300, 400, 500, 600, 700] },
      { family: 'IBM Plex Mono',  weights: [300, 400, 500, 600, 700] },
      { family: 'Source Code Pro',weights: [300, 400, 500, 600, 700] },
      { family: 'Roboto Mono',    weights: [300, 400, 500, 600, 700] },
      { family: 'Inconsolata',    weights: [300, 400, 500, 600, 700] },
      { family: 'Overpass Mono',  weights: [300, 400, 500, 600, 700] },
      { family: 'Space Mono',     weights: [400, 700] },
      { family: 'Courier Prime',  weights: [400, 700] },
      { family: 'Anonymous Pro',  weights: [400, 700] },
    ],
  },
  {
    label: 'System',
    fonts: [
      { family: 'Georgia',        weights: [400, 700] },
      { family: 'Arial',          weights: [400, 700] },
      { family: 'Helvetica',      weights: [400, 700] },
      { family: 'Trebuchet MS',   weights: [400, 700] },
      { family: 'Verdana',        weights: [400, 700] },
      { family: 'Times New Roman',weights: [400, 700] },
    ],
  },
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
          {/* Font family + weight (grouped) */}
          <div className="flex flex-col items-start gap-0.5 shrink-0">
            <span className="text-[9px] text-gray-400 uppercase tracking-wide leading-none">Font</span>
            <select
              value={`${styles.fontFamily}|${styles.fontWeight ?? 400}`}
              onChange={e => {
                const [family, w] = e.target.value.split('|')
                set({ fontFamily: family, fontWeight: parseInt(w) })
              }}
              className="text-[11px] font-medium text-gray-800 bg-gray-100 border-none rounded-md px-2 py-0.5 h-[26px] focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer max-w-[200px]"
            >
              {FONT_GROUPS.map(group => (
                <optgroup key={group.label} label={`── ${group.label}`}>
                  {group.fonts.map(font =>
                    font.weights.map(w => (
                      <option key={`${font.family}|${w}`} value={`${font.family}|${w}`}>
                        {font.family} · {WEIGHT_NAME[w] ?? w}
                      </option>
                    ))
                  )}
                </optgroup>
              ))}
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
            <AvatarDropdown
              name={session.user.name}
              email={session.user.email}
              role={session.user.role}
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
