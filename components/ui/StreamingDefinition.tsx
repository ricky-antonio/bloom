'use client'

import { useState, useEffect } from 'react'
import { DEFINITION_FALLBACK } from '@/lib/types'

interface StreamingDefinitionProps {
  concept: string
  parentConcept: string
}

export default function StreamingDefinition({ concept, parentConcept }: StreamingDefinitionProps) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setText('')
    setDone(false)
    const controller = new AbortController()

    fetch('/api/define', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, parentConcept }),
      signal: controller.signal,
    })
      .then(async res => {
        const data = await res.json()
        const full = (data.definition as string) ?? DEFINITION_FALLBACK.definition
        let i = 0
        const interval = setInterval(() => {
          if (i < full.length) {
            setText(full.slice(0, ++i))
          } else {
            clearInterval(interval)
            setDone(true)
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

    return () => controller.abort()
  }, [concept, parentConcept])

  return (
    <span>
      {text}
      {!done && <span aria-hidden>|</span>}
    </span>
  )
}
