'use client'

import type { ConceptNode } from '@/lib/types'

interface NodeTooltipProps {
  node: ConceptNode | null
  x: number
  y: number
}

export default function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  if (!node) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 14,
        top: y + 14,
        background: '#FFFFFF',
        border: '1px solid rgba(73,101,128,0.12)',
        borderRadius: 10,
        padding: '6px 13px',
        pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(73,101,128,0.12)',
        zIndex: 150,
        maxWidth: 140,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          color: '#496580',
          lineHeight: 1.4,
          wordWrap: 'break-word',
        }}
      >
        {node.label}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          fontSize: 11,
          color: '#8AABBC',
          lineHeight: 1.4,
        }}
      >
        {node.category}
      </p>
    </div>
  )
}
