'use client'

import type { ConceptEdge, NodeRing } from '@/lib/types'

interface GraphEdgeProps {
  edge: ConceptEdge
  isHighlighted: boolean
}

function getStroke(ring: NodeRing, isHighlighted: boolean): string {
  if (ring === 'ring3') return 'rgba(73,101,128,0.08)'
  if (ring === 'ring1') return isHighlighted ? '#BADDFF' : 'rgba(186,221,255,0.3)'
  if (ring === 'ring2') return isHighlighted ? 'rgba(186,221,255,0.6)' : 'rgba(186,221,255,0.15)'
  return '#BADDFF'
}

function getStrokeWidth(ring: NodeRing): number {
  if (ring === 'ring1') return 1.5
  if (ring === 'ring2') return 1
  return 0.5
}

export default function GraphEdge({ edge, isHighlighted }: GraphEdgeProps) {
  return (
    <line
      data-edge-id={edge.id}
      x1={0}
      y1={0}
      x2={0}
      y2={0}
      stroke={getStroke(edge.ring, isHighlighted)}
      strokeWidth={getStrokeWidth(edge.ring)}
    />
  )
}
