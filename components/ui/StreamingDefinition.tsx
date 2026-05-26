'use client'

import { useState, useEffect } from 'react'
import { DEFINITION_FALLBACK } from '@/lib/types'

interface StreamingDefinitionProps {
  concept: string
  parentConcept: string
  onComplete?: (definition: string, relatedTags: string[]) => void
}

export default function StreamingDefinition({ concept, parentConcept, onComplete }: StreamingDefinitionProps) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  const [relatedTags, setRelatedTags] = useState<string[]>([])

  useEffect(() => {
    setText('')
    setDone(false)
    setRelatedTags([])
    const controller = new AbortController()
    let intervalId: ReturnType<typeof setInterval> | null = null

    fetch('/api/define', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, parentConcept }),
      signal: controller.signal,
    })
      .then(async res => {
        const data = await res.json()
        const full = (data.definition as string) ?? DEFINITION_FALLBACK.definition
        const tags = (data.relatedTags as string[]) ?? DEFINITION_FALLBACK.relatedTags
        let i = 0
        intervalId = setInterval(() => {
          if (i < full.length) {
            setText(full.slice(0, ++i))
          } else {
            clearInterval(intervalId!)
            setDone(true)
            setRelatedTags(tags)
            onComplete?.(full, tags)
          }
        }, 18)
      })
      .catch(() => {
        // AbortError on unmount is expected — show fallback for genuine failures
        if (!controller.signal.aborted) {
          setText(DEFINITION_FALLBACK.definition)
          setDone(true)
        }
      })

    return () => {
      controller.abort()
      if (intervalId) clearInterval(intervalId)
    }
  // onComplete is intentionally excluded from deps — callers should memoize if needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept, parentConcept])

  void relatedTags // consumed via onComplete; suppress unused-variable lint

  return (
    <span>
      {text}
      {!done && (
        <span
          aria-hidden="true"
          style={{ animation: 'blink 1s step-end infinite', opacity: 0.4 }}
        >
          |
        </span>
      )}
    </span>
  )
}
