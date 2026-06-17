import { NextRequest, NextResponse } from 'next/server'

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (await import('pdf-parse')) as any
    const parse = pdfParse.default ?? pdfParse
    const result = await parse(buffer)

    const text = result.text?.trim()
    if (!text || text.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try a different file or paste your resume text instead.' },
        { status: 422 }
      )
    }

    return NextResponse.json({ text })
  } catch (err) {
    console.error('[parse-resume]', err)
    return NextResponse.json({ error: 'Failed to parse PDF.' }, { status: 500 })
  }
}
