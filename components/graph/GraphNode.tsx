'use client'

import { useState } from 'react'
import { getNodeColour } from '@/lib/colour'
import type { ConceptNode, NodeRing, Category } from '@/lib/types'

interface GraphNodeProps {
  node: ConceptNode
  isSelected: boolean
  isExpanding: boolean
  onSelect: (nodeId: string) => void
  onDeselect?: () => void
}

const RING_RADIUS: Record<NodeRing, number> = {
  core: 38,
  ring1: 30,
  ring2: 19,
  ring3: 16,
}

const RING_STROKE_WIDTH: Record<NodeRing, number> = {
  core: 2,
  ring1: 1.5,
  ring2: 1,
  ring3: 1,
}

/* Glow circle radii (the ambient halo behind each node) */
const GLOW_RADIUS: Partial<Record<NodeRing, number>> = {
  core: 58,
  ring1: 40,
}

/* Map category → gradient id defined in GraphCanvas defs */
const GLOW_GRADIENT: Record<Category, string> = {
  awareness: 'url(#node-glow-sky)',
  identity: 'url(#node-glow-peach)',
  experiential: 'url(#node-glow-mint)',
}

/* Float config for ring1 (8 variants, assigned by stable hash of node id) */
const FLOAT_CONFIGS = [
  { duration: '4.2s', delay: '0s',    name: 'float-1' },
  { duration: '3.8s', delay: '0.5s',  name: 'float-2' },
  { duration: '5.0s', delay: '1.1s',  name: 'float-3' },
  { duration: '4.6s', delay: '1.6s',  name: 'float-4' },
  { duration: '3.6s', delay: '0.9s',  name: 'float-5' },
  { duration: '5.2s', delay: '0.3s',  name: 'float-6' },
  { duration: '4.4s', delay: '1.3s',  name: 'float-7' },
  { duration: '4.0s', delay: '0.6s',  name: 'float-8' },
]

/* Drift config for ring2 (3 variants) */
const DRIFT_CONFIGS = [
  { duration: '9s',  delay: '0s',  name: 'drift-1' },
  { duration: '10s', delay: '1.3s', name: 'drift-2' },
  { duration: '11s', delay: '2.6s', name: 'drift-3' },
]

function stableIndex(id: string, max: number): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff
  return h % max
}

export default function GraphNode({ node, isSelected, isExpanding, onSelect, onDeselect }: GraphNodeProps) {
  const [hovered, setHovered] = useState(false)

  const colours = getNodeColour(node.ring, node.category)
  const radius = RING_RADIUS[node.ring]
  const glowR = GLOW_RADIUS[node.ring]
  const filterId = `glow-${node.id}`

  const spinnerRadius = radius + 8
  const circumference = 2 * Math.PI * spinnerRadius

  /* Animation selection */
  let animationStyle: string | undefined
  if (node.ring === 'ring1') {
    const cfg = FLOAT_CONFIGS[stableIndex(node.id, FLOAT_CONFIGS.length)]
    animationStyle = `${cfg.name} ${cfg.duration} ease-in-out ${cfg.delay} infinite`
  } else if (node.ring === 'ring2') {
    const cfg = DRIFT_CONFIGS[stableIndex(node.id, DRIFT_CONFIGS.length)]
    animationStyle = `${cfg.name} ${cfg.duration} ease-in-out ${cfg.delay} infinite`
  }

  /* Core pulsing glow (applied to main circle) */
  const coreFilter = node.ring === 'core'
    ? 'drop-shadow(0 6px 14px rgba(186,221,255,0.4)) drop-shadow(0 2px 4px rgba(73,101,128,0.08))'
    : undefined

  function handleClick() {
    if (isSelected) { onDeselect?.() } else { onSelect(node.id) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      if (isSelected) { onDeselect?.() } else { onSelect(node.id) }
    }
  }

  /* Scale for hover — ring2 uses 1.1, others 1.08 */
  const hoverScale = node.ring === 'ring2' ? 1.1 : 1.08
  const scaleValue = hovered ? hoverScale : 1

  return (
    <g data-node-id={node.id}>
      {/* Float / drift animation wrapper */}
      <g style={{ animation: animationStyle }}>
        {/* Hover + interaction wrapper */}
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
            transformBox: 'fill-box',
            transformOrigin: 'center',
            transform: `scale(${scaleValue})`,
            transition: 'transform 150ms ease',
            cursor: 'pointer',
            pointerEvents: 'all',
          }}
        >
          {/* Drop-shadow filter for selected state */}
          {isSelected && (
            <defs>
              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={colours.border} floodOpacity="0.6" />
              </filter>
            </defs>
          )}

          {/* Ambient glow halo (core + ring1 only) */}
          {glowR !== undefined && (
            <circle
              r={glowR}
              fill={GLOW_GRADIENT[node.category]}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Ghost ring behind core node */}
          {node.ring === 'core' && (
            <circle
              r={44}
              fill="none"
              stroke="#BADDFF"
              strokeWidth={0.75}
              opacity={0.18}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {/* Main circle */}
          <circle
            r={radius}
            fill={colours.background}
            stroke={colours.border}
            strokeWidth={RING_STROKE_WIDTH[node.ring]}
            filter={isSelected ? `url(#${filterId})` : undefined}
            style={{
              filter: isSelected ? undefined : coreFilter,
              animation: node.ring === 'core' ? 'pulse-core 3s ease-in-out infinite' : undefined,
              ...(isExpanding
                ? { transformBox: 'fill-box', transformOrigin: 'center', animation: 'pulse 800ms ease-in-out infinite alternate' }
                : {}),
            }}
          />

          {/* Core label — Playfair Display italic */}
          {node.ring === 'core' && (
            <>
              <text
                textAnchor="middle"
                dy="0.1em"
                style={{
                  fontFamily: 'var(--font-display), "Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: 13,
                  fontWeight: 800,
                  fill: '#496580',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  lineHeight: 1.1,
                }}
              >
                {node.label}
              </text>
              <text
                textAnchor="middle"
                y={radius + 14}
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 7,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fill: '#BADDFF',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                origin
              </text>
            </>
          )}

          {/* Ring 1 label — Playfair Display italic */}
          {node.ring === 'ring1' && (
            <>
              <text
                textAnchor="middle"
                dy="0.1em"
                style={{
                  fontFamily: 'var(--font-display), "Playfair Display", serif',
                  fontStyle: 'italic',
                  fontSize: 10,
                  fontWeight: 700,
                  fill: colours.text,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {node.label}
              </text>
              <text
                textAnchor="middle"
                y={radius + 12}
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 9,
                  fontWeight: 500,
                  fill: colours.text,
                  fillOpacity: 0.65,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {node.category}
              </text>
            </>
          )}

          {/* Ring 2 label — Inter */}
          {node.ring === 'ring2' && (
            <>
              <text
                textAnchor="middle"
                dy="0.1em"
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 8,
                  fontWeight: 500,
                  fill: colours.text,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {node.label}
              </text>
              <text
                textAnchor="middle"
                y={radius + 11}
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 8,
                  fill: '#C8D8E4',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {node.category}
              </text>
            </>
          )}

          {/* Ring 3 label — Inter, muted */}
          {node.ring === 'ring3' && (
            <text
              textAnchor="middle"
              dy="0.35em"
              style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 8,
                fontWeight: 400,
                fill: '#C8D8E4',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {node.label}
            </text>
          )}

          {/* Expanding spinner ring */}
          {isExpanding && (
            <circle
              r={spinnerRadius}
              fill="none"
              stroke={colours.border}
              strokeWidth={1.5}
              strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: 'spin 1s linear infinite',
              }}
            />
          )}
        </g>
      </g>
    </g>
  )
}
