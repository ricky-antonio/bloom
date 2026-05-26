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
        left: x + 12,
        top: y + 12,
        background: '#FFFFFF',
        border: '1px solid rgba(73,101,128,0.1)',
        borderRadius: 8,
        padding: '4px 10px',
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(73,101,128,0.1)',
        zIndex: 150,
        maxWidth: 120,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          fontSize: 10,
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
          fontSize: 9,
          color: '#8AABBC',
          lineHeight: 1.4,
        }}
      >
        {node.category}
      </p>
    </div>
  )
}
