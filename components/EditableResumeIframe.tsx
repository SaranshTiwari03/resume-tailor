'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'

export interface EditableIframeHandle {
  execCmd: (cmd: string, value?: string) => void
  queryState: (cmd: string) => boolean
  getHtml: () => string
  getDoc: () => Document | null
}

interface Props {
  html: string
  zoom: number
  onSelectionRect: (rect: DOMRect | null, iframe: HTMLIFrameElement | null) => void
}

const EditableResumeIframe = forwardRef<EditableIframeHandle, Props>(
  ({ html, zoom: _zoom, onSelectionRect }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    // Keep callback in a ref so the effect doesn't need to re-run when it changes
    const onSelectionRectRef = useRef(onSelectionRect)
    onSelectionRectRef.current = onSelectionRect

    const doc = useCallback(
      () => iframeRef.current?.contentDocument ?? iframeRef.current?.contentWindow?.document ?? null,
      [],
    )

    useImperativeHandle(ref, () => ({
      execCmd: (cmd, value) => { doc()?.execCommand(cmd, false, value) },
      queryState: (cmd) => doc()?.queryCommandState(cmd) ?? false,
      getHtml: () => doc()?.documentElement.outerHTML ?? '',
      getDoc: doc,
    }))

    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const d = iframe.contentDocument ?? iframe.contentWindow?.document
      if (!d) return

      d.open()
      d.write(html)
      d.close()

      // Make the whole body editable
      d.body.contentEditable = 'true'
      d.body.style.outline = 'none'
      d.body.style.cursor = 'text'

      // Auto-size iframe to body content
      const fitHeight = () => {
        iframe.style.height = Math.max(1056, d.body.scrollHeight + 32) + 'px'
      }
      fitHeight()

      // Track text selection inside the iframe
      const onSel = () => {
        const sel = d.defaultView?.getSelection()
        if (!sel || sel.isCollapsed || !sel.rangeCount) {
          onSelectionRectRef.current(null, null)
          return
        }
        onSelectionRectRef.current(sel.getRangeAt(0).getBoundingClientRect(), iframe)
      }
      d.addEventListener('selectionchange', onSel)

      // Resize when content is edited
      const mo = new MutationObserver(fitHeight)
      mo.observe(d.body, { childList: true, subtree: true, characterData: true })

      return () => {
        d.removeEventListener('selectionchange', onSel)
        mo.disconnect()
      }
    }, [html]) // only re-init when html prop changes

    return (
      <iframe
        ref={iframeRef}
        title="Resume Editor"
        className="w-full border-0 block"
        style={{ minHeight: 1056 }}
        sandbox="allow-same-origin"
      />
    )
  },
)

EditableResumeIframe.displayName = 'EditableResumeIframe'
export default EditableResumeIframe
