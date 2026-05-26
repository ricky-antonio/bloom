'use client'

import type { ConceptEdge, NodeRing, Category } from '@/lib/types'

interface GraphEdgeProps {
  edge: ConceptEdge
  isHighlighted: boolean
  sourceCategory?: Category
}

const CATEGORY_COLOUR: Record<Category, string> = {
  awareness: '#BADDFF',
  identity:  '#FFDBBB',
  experiential: '#BAFFF5',
}

function getStroke(ring: NodeRing, isHighlighted: boolean, category?: Category): string {
  const colour = category ? CATEGORY_COLOUR[category] : '#BADDFF'

  if (ring === 'ring3') return 'rgba(73,101,128,0.08)'

  if (ring === 'ring1') {
    // Highlighted: brighter; default: category colour at moderate opacity
    const opacity = isHighlighted ? 0.55 : 0.38
    if (category === 'identity')    return `rgba(255,219,187,${opacity})`
    if (category === 'experiential') return `rgba(186,255,245,${opacity})`
    return `rgba(186,221,255,${opacity})`
  }

  if (ring === 'ring2') {
    // Solid category colour at 0.18 opacity
    const opacity = isHighlighted ? 0.28 : 0.18
    if (category === 'identity')    return `rgba(255,219,187,${opacity})`
    if (category === 'experiential') return `rgba(186,255,245,${opacity})`
    return `rgba(186,221,255,${opacity})`
  }

  // Core edges
  return isHighlighted ? colour : 'rgba(186,221,255,0.3)'
}

function getStrokeWidth(ring: NodeRing): number {
  if (ring === 'ring1') return 1.5
  if (ring === 'ring2') return 0.75
  return 0.5
}

export default function GraphEdge({ edge, isHighlighted, sourceCategory }: GraphEdgeProps) {
  return (
    <line
      data-edge-id={edge.id}
      x1={0}
      y1={0}
      x2={0}
      y2={0}
      stroke={getStroke(edge.ring, isHighlighted, sourceCategory)}
      strokeWidth={getStrokeWidth(edge.ring)}
    />
  )
}
