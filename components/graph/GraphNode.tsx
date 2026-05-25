'use client'

import { useState } from 'react'
import { getNodeColour } from '@/lib/colour'
import type { ConceptNode, NodeRing } from '@/lib/types'

interface GraphNodeProps {
  node: ConceptNode
  isSelected: boolean
  isExpanding: boolean
  onSelect: (nodeId: string) => void
  onDeselect?: () => void
}

const RING_RADIUS: Record<NodeRing, number> = {
  core: 42,
  ring1: 32,
  ring2: 23,
  ring3: 16,
}

const RING_FONT_SIZE: Record<NodeRing, number> = {
  core: 13,
  ring1: 10,
  ring2: 8.5,
  ring3: 8,
}

const RING_FONT_WEIGHT: Record<NodeRing, number> = {
  core: 700,
  ring1: 600,
  ring2: 500,
  ring3: 400,
}

const RING_STROKE_WIDTH: Record<NodeRing, number> = {
  core: 2,
  ring1: 1.5,
  ring2: 1,
  ring3: 1,
}

export default function GraphNode({ node, isSelected, isExpanding, onSelect, onDeselect }: GraphNodeProps) {
  const [hovered, setHovered] = useState(false)

  const colours = getNodeColour(node.ring, node.category)
  const radius = RING_RADIUS[node.ring]
  const filterId = `glow-${node.id}`

  const spinnerRadius = radius + 8
  const circumference = 2 * Math.PI * spinnerRadius

  function handleClick() {
    if (isSelected) {
      onDeselect?.()
    } else {
      onSelect(node.id)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (isSelected) {
        onDeselect?.()
      } else {
        onSelect(node.id)
      }
    }
  }

  return (
    <g data-node-id={node.id}>
    <g
      data-expanding={isExpanding}
      role="button"
      tabIndex={0}
      aria-label={`${node.label}, ring ${node.ring}, ${node.category}`}
      aria-pressed={isSelected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 150ms ease',
        cursor: 'pointer',
        pointerEvents: 'all',
      }}
    >
      {isSelected && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={colours.border} />
          </filter>
        </defs>
      )}

      <circle
        r={radius}
        fill={colours.background}
        stroke={colours.border}
        strokeWidth={RING_STROKE_WIDTH[node.ring]}
        filter={isSelected ? `url(#${filterId})` : undefined}
        style={isExpanding ? { animation: 'pulse 800ms ease-in-out infinite alternate' } : undefined}
      />

      <text
        textAnchor="middle"
        dy="0.35em"
        fontSize={RING_FONT_SIZE[node.ring]}
        fontWeight={RING_FONT_WEIGHT[node.ring]}
        fill={colours.text}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.label}
      </text>

      {node.ring === 'core' && (
        <text
          textAnchor="middle"
          y={radius + 14}
          fontSize={8}
          fontWeight={600}
          fill="#BADDFF"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          origin
        </text>
      )}

      {node.ring === 'ring1' && (
        <text
          textAnchor="middle"
          y={radius + 12}
          fontSize={9}
          fontWeight={500}
          fill={colours.text}
          fillOpacity={0.7}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.category}
        </text>
      )}

      {isExpanding && (
        <circle
          r={spinnerRadius}
          fill="none"
          stroke={colours.border}
          strokeWidth={1.5}
          strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
          style={{
            transformOrigin: 'center',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
    </g>
    </g>
  )
}
