import { NextResponse } from 'next/server'

// PDF parsing is now handled client-side in ResumeUpload.tsx using pdfjs-dist.
// This route is kept as a fallback stub.
export async function POST() {
  return NextResponse.json(
    { error: 'PDF parsing is handled client-side. This endpoint is no longer used.' },
    { status: 410 }
  )
}
