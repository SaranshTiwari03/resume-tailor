'use client'

import type { StyleConfig } from '@/types/resume'

const FONT_LIST = [
  'IBM Plex Sans Condensed',
  'IBM Plex Sans',
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Raleway',
  'Source Sans 3',
  'Nunito',
  'Poppins',
  'DM Sans',
  'Noto Sans',
  'PT Sans',
  'Merriweather',
  'Playfair Display',
  'Georgia',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Garamond',
]

interface Props {
  styles: StyleConfig
  onChange: (s: StyleConfig) => void
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function StyleControls({ styles, onChange }: Props) {
  const set = (patch: Partial<StyleConfig>) => onChange({ ...styles, ...patch })

  return (
    <div className="space-y-3 text-sm">
      <Row label="Font family">
        <select
          className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white"
          value={styles.fontFamily}
          onChange={e => set({ fontFamily: e.target.value })}
        >
          {FONT_LIST.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </Row>

      <Row label={`Base size (${styles.baseFontSize}pt)`}>
        <input
          type="range" min={7} max={11} step={0.1}
          value={styles.baseFontSize}
          onChange={e => set({ baseFontSize: parseFloat(e.target.value) })}
          className="w-full accent-blue-600"
        />
      </Row>

      <Row label={`Line height (${styles.lineHeight})`}>
        <input
          type="range" min={1.1} max={1.6} step={0.01}
          value={styles.lineHeight}
          onChange={e => set({ lineHeight: parseFloat(e.target.value) })}
          className="w-full accent-blue-600"
        />
      </Row>

      <Row label={`Section gap (${styles.sectionSpacing}px)`}>
        <input
          type="range" min={3} max={14} step={1}
          value={styles.sectionSpacing}
          onChange={e => set({ sectionSpacing: parseInt(e.target.value) })}
          className="w-full accent-blue-600"
        />
      </Row>

      <Row label={`Job gap (${styles.jobSpacing}px)`}>
        <input
          type="range" min={2} max={12} step={1}
          value={styles.jobSpacing}
          onChange={e => set({ jobSpacing: parseInt(e.target.value) })}
          className="w-full accent-blue-600"
        />
      </Row>

      <button
        onClick={() => set({
          fontFamily: 'IBM Plex Sans Condensed',
          baseFontSize: 8.7,
          lineHeight: 1.25,
          sectionSpacing: 6,
          jobSpacing: 5,
        })}
        className="w-full text-xs text-gray-400 hover:text-gray-600 underline mt-1"
      >
        Reset to defaults
      </button>
    </div>
  )
}
