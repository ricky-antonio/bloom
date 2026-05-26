'use client'

import { useEffect } from 'react'
import { useGraphState } from '@/lib/context/GraphContext'
import type { ConceptNode, NodeRing, Category } from '@/lib/types'
import StreamingDefinition from './StreamingDefinition'
import ConceptTag from './ConceptTag'

interface DetailPanelProps {
  onExpand: (nodeId: string) => void
  onAddTag: (label: string, parentNodeId: string) => void
  onDefinitionLoaded?: (nodeId: string, definition: string, relatedTags: string[]) => void
}

/* ─── Category colour palettes ──────────────────────────────────────── */

const HERO_GRADIENT: Record<Category, string> = {
  awareness:   'linear-gradient(145deg, #E4F3FF 0%, #EDF8FF 55%, #E8F9F5 100%)',
  identity:    'linear-gradient(145deg, #FFF1E6 0%, #FFF6EE 55%, #FFF9F0 100%)',
  experiential:'linear-gradient(145deg, #E6FDF8 0%, #EDFFF9 55%, #EEF9FF 100%)',
}

const HERO_DECO_COLOUR: Record<Category, string> = {
  awareness:    '#BADDFF',
  identity:     '#FFDBBB',
  experiential: '#BAFFF5',
}

const CONCEPT_COLOUR: Record<Category, string> = {
  awareness:   '#2E5A78',
  identity:    '#7A3A18',
  experiential:'#1A6A58',
}

const BADGE_BG: Record<Category, string> = {
  awareness:   'rgba(186,221,255,0.2)',
  identity:    'rgba(255,219,187,0.2)',
  experiential:'rgba(186,255,245,0.2)',
}

const BADGE_BORDER: Record<Category, string> = {
  awareness:   'rgba(186,221,255,0.45)',
  identity:    'rgba(255,219,187,0.45)',
  experiential:'rgba(186,255,245,0.45)',
}

const BADGE_TEXT: Record<Category, string> = {
  awareness:   '#5A8AAA',
  identity:    '#C07040',
  experiential:'#40A090',
}

const EXPAND_GRADIENT: Record<Category, string> = {
  awareness:   'linear-gradient(135deg, #D4ECFF, #C8E4FF)',
  identity:    'linear-gradient(135deg, #FFE4C8, #FFDABB)',
  experiential:'linear-gradient(135deg, #C8FFF2, #BAFFF5)',
}

const EXPAND_SHADOW: Record<Category, string> = {
  awareness:   '0 3px 12px rgba(186,221,255,0.4)',
  identity:    '0 3px 12px rgba(255,219,187,0.45)',
  experiential:'0 3px 12px rgba(186,255,245,0.4)',
}

function ringLabel(ring: NodeRing): string {
  if (ring === 'core')  return 'Core'
  if (ring === 'ring1') return 'Ring 1'
  if (ring === 'ring2') return 'Ring 2'
  return 'Ring 3'
}

function categoryLabel(cat: Category): string {
  if (cat === 'awareness')    return 'Awareness'
  if (cat === 'identity')     return 'Identity'
  return 'Experiential'
}

function depthPips(node: ConceptNode) {
  const filled = node.ring === 'ring1' ? 1 : node.ring === 'ring2' ? 2 : node.ring === 'ring3' ? 3 : 0
  return Array.from({ length: 3 }, (_, i) => i < filled)
}

function getParentLabel(node: ConceptNode, nodes: ConceptNode[]): string {
  if (!node.parentId) return ''
  return nodes.find(n => n.id === node.parentId)?.label ?? ''
}

export default function DetailPanel({ onExpand, onAddTag, onDefinitionLoaded }: DetailPanelProps) {
  const { state, dispatch } = useGraphState()

  const node: ConceptNode | null = state.activeNodeId
    ? state.nodes.find(n => n.id === state.activeNodeId) ?? null
    : null

  /* Escape key closes the panel */
  useEffect(() => {
    if (!node) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_NODE', nodeId: null })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [node, dispatch])

  if (!node) return null

  const cat = node.category
  const decoColour = HERO_DECO_COLOUR[cat]
  const pips = depthPips(node)
  const parentLabel = getParentLabel(node, state.nodes)

  return (
    <div
      role="complementary"
      aria-label="Concept detail"
      style={{
        position: 'fixed',
        right: 14,
        top: 56,
        width: 216,
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(73,101,128,0.13), 0 4px 12px rgba(73,101,128,0.07), 0 1px 2px rgba(73,101,128,0.04)',
        border: '0.5px solid rgba(255,255,255,0.92)',
        animation: 'slide-in-right 200ms ease forwards',
        zIndex: 200,
      }}
    >
      {/* ─── Hero section ──────────────────────────────────────────────── */}
      <div
        style={{
          background: HERO_GRADIENT[cat],
          padding: '20px 18px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative large circle */}
        <div
          style={{
            position: 'absolute',
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${decoColour} 0%, transparent 70%)`,
            opacity: 0.35,
            right: -22,
            top: -22,
            pointerEvents: 'none',
          }}
        />
        {/* Decorative small circle */}
        <div
          style={{
            position: 'absolute',
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${decoColour} 0%, transparent 70%)`,
            opacity: 0.25,
            right: 16,
            bottom: -16,
            pointerEvents: 'none',
          }}
        />
        {/* Ghost ring */}
        <div
          style={{
            position: 'absolute',
            width: 68,
            height: 68,
            borderRadius: '50%',
            border: `1px solid ${decoColour}`,
            opacity: 0.15,
            right: -8,
            top: -8,
            pointerEvents: 'none',
          }}
        />

        {/* Ring + category badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px 3px 6px',
            borderRadius: 20,
            marginBottom: 10,
            background: BADGE_BG[cat],
            border: `1px solid ${BADGE_BORDER[cat]}`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: decoColour,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 8.5,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: BADGE_TEXT[cat],
              lineHeight: 1,
            }}
          >
            {categoryLabel(cat)} · {ringLabel(node.ring)}
          </span>
        </div>

        {/* Concept word */}
        <div
          style={{
            fontFamily: 'var(--font-display), "Playfair Display", serif',
            fontStyle: 'italic',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: CONCEPT_COLOUR[cat],
            position: 'relative',
            zIndex: 1,
            marginBottom: 12,
            wordBreak: 'break-word',
          }}
        >
          {node.label}
        </div>

        {/* Depth pips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {pips.map((filled, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 3,
                borderRadius: 2,
                background: filled ? decoColour : 'rgba(73,101,128,0.1)',
              }}
            />
          ))}
          <span
            style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 7.5,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(73,101,128,0.25)',
              marginLeft: 4,
            }}
          >
            depth {pips.filter(Boolean).length} of 3
          </span>
        </div>
      </div>

      {/* ─── Body section ──────────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          padding: '14px 17px 16px',
        }}
      >
        {/* Definition */}
        <div
          style={{
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontSize: 10.5,
            fontWeight: 400,
            color: '#7A92A8',
            lineHeight: 1.72,
            letterSpacing: '0.01em',
            marginBottom: 12,
          }}
        >
          <StreamingDefinition
            concept={node.label}
            parentConcept={parentLabel || node.label}
            onComplete={(def, tags) => onDefinitionLoaded?.(node.id, def, tags)}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            height: 0.5,
            background: 'rgba(73,101,128,0.07)',
            marginBottom: 13,
          }}
        />

        {/* Tags section */}
        {node.relatedTags && node.relatedTags.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 7.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#C8D8E4',
                marginBottom: 6,
              }}
            >
              Related concepts
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {node.relatedTags.map((tag, i) => (
                <ConceptTag
                  key={tag}
                  label={tag}
                  category={(['awareness', 'identity', 'experiential'] as Category[])[i % 3]}
                  onClick={label => onAddTag(label, node.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Expand button */}
        <button
          onClick={() => onExpand(node.id)}
          aria-label={`Expand concept: ${node.label}`}
          style={{
            width: '100%',
            border: 'none',
            borderRadius: 13,
            padding: '11px 14px',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            letterSpacing: '0.01em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: EXPAND_GRADIENT[cat],
            color: CONCEPT_COLOUR[cat],
            boxShadow: EXPAND_SHADOW[cat],
            cursor: 'pointer',
            transition: 'opacity 150ms',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.88' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <span>Expand this concept</span>
          {/* Arrow badge */}
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
              <path d="M2 5.5h7M6 2.5l3 3-3 3" stroke={CONCEPT_COLOUR[cat]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(240px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
