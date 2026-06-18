'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react'

interface ResumeUploadProps {
  onResume: (text: string, fileName?: string) => void
}

async function parsePdfClientSide(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()

  // Dynamic import keeps pdfjs out of the initial bundle
  const pdfjsLib = await import('pdfjs-dist')

  // Worker URL must match the installed version exactly — use unpkg CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableFontFace: true,
  }).promise

  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
    pages.push(pageText)
  }

  return pages.join('\n').trim()
}

export default function ResumeUpload({ onResume }: ResumeUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setParseError('File too large (max 5MB).')
      return
    }
    setParseError(null)
    setParsing(true)
    try {
      const text = await parsePdfClientSide(file)
      if (text.length < 100) {
        throw new Error('Could not extract text from this PDF. Try pasting your resume text instead.')
      }
      onResume(text, file.name)
    } catch (e) {
      setParseError(
        e instanceof Error
          ? e.message
          : 'Failed to parse PDF. Try pasting your resume text instead.'
      )
    } finally {
      setParsing(false)
    }
  }, [onResume])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handlePasteConfirm = () => {
    const words = pasteText.trim().split(/\s+/).filter(Boolean).length
    if (words < 50) {
      setParseError('Resume text is too short — paste the full resume.')
      return
    }
    onResume(pasteText.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-10">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
        <FileText size={26} className="text-blue-600" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Upload your resume</h2>
      <p className="text-sm text-gray-400 mb-8 text-center">PDF format · parsed in your browser</p>

      <div className="w-full max-w-md space-y-3">
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors
            ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
            ${parsing ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onFileChange}
          />
          {parsing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
              <p className="text-sm text-gray-500">Reading your resume…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={28} className={dragging ? 'text-blue-500' : 'text-gray-400'} />
              <p className="text-sm font-medium text-gray-700">
                {dragging ? 'Drop it here' : 'Drag & drop your PDF here'}
              </p>
              <p className="text-xs text-gray-400">or click to browse</p>
            </div>
          )}
        </div>

        {parseError && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{parseError}</span>
          </div>
        )}

        {!showPaste ? (
          <button
            onClick={() => setShowPaste(true)}
            className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors"
          >
            Or paste resume text instead →
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              autoFocus
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setParseError(null) }}
              className="w-full h-40 text-xs border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300 font-mono"
              placeholder="Paste your resume text here…"
            />
            <button
              onClick={handlePasteConfirm}
              disabled={pasteText.trim().split(/\s+/).filter(Boolean).length < 10}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
            >
              Use this resume
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
