'use client'

import { useState, useRef } from 'react'
import { ClipboardPaste, X, CheckCircle2, FileText } from 'lucide-react'

interface ResumeUploadProps {
  onResume: (text: string) => void
}

export default function ResumeUpload({ onResume }: ResumeUploadProps) {
  const [text, setText] = useState('')
  const [clipboardError, setClipboardError] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const isReady = wordCount >= 50

  const handlePasteFromClipboard = async () => {
    setClipboardError(false)
    try {
      const clipText = await navigator.clipboard.readText()
      if (clipText.trim()) {
        setText(clipText)
        textareaRef.current?.focus()
      }
    } catch {
      setClipboardError(true)
      textareaRef.current?.focus()
    }
  }

  const handleConfirm = () => {
    if (isReady) onResume(text.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
        <FileText size={26} className="text-blue-600" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Paste your resume</h2>
      <p className="text-sm text-gray-400 mb-1 text-center max-w-sm">
        Open your PDF in Chrome → Select All (Ctrl+A) → Copy (Ctrl+C) → paste below
      </p>
      <p className="text-xs text-gray-300 mb-6 text-center">Works with any resume format</p>

      <div className="w-full max-w-lg">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full h-64 text-xs border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 font-mono leading-relaxed"
          placeholder="Paste your full resume text here..."
        />

        <div className="flex items-center justify-between mt-2 mb-3">
          <span className="text-xs text-gray-400">
            {wordCount > 0 ? `${wordCount} words` : ''}
            {wordCount > 0 && wordCount < 50 ? ' — paste the full resume' : ''}
          </span>
          <div className="flex items-center gap-3">
            {text && (
              <button
                onClick={() => setText('')}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <X size={11} /> Clear
              </button>
            )}
            <button
              onClick={handlePasteFromClipboard}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1.5"
            >
              <ClipboardPaste size={12} /> Paste from clipboard
            </button>
          </div>
        </div>

        {clipboardError && (
          <p className="text-xs text-amber-500 mb-2">
            Clipboard access denied — please paste manually (Ctrl+V in the box above).
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={!isReady}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-xl transition-colors"
        >
          <CheckCircle2 size={16} /> Use this resume
        </button>
      </div>
    </div>
  )
}
