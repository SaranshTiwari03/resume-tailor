'use client'

import { useEffect, useRef } from 'react'

interface Props {
  html: string
}

export default function ResumePreview({ html }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      title="Resume Preview"
      className="w-full h-full border-0"
      sandbox="allow-same-origin"
    />
  )
}
