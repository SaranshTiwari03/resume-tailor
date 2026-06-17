import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'module'

// Use lib path to bypass pdf-parse's test-file loader which crashes in serverless
const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await pdfParse(buffer)

    const text = result.text?.trim()
    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try pasting your resume text instead.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('[parse-resume]', err)
    return NextResponse.json({ error: 'Failed to parse PDF. Try pasting your resume text instead.' }, { status: 500 })
  }
}
