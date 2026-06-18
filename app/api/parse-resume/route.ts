import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'

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

    const arrayBuffer = await file.arrayBuffer()
    const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true })

    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try pasting your resume text instead.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text: text.trim() })
  } catch (err) {
    console.error('[parse-resume]', err)
    return NextResponse.json(
      { error: 'Failed to parse PDF. Please try pasting your resume text instead.' },
      { status: 500 }
    )
  }
}
