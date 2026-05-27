'use client'

import { IconAtom } from '@tabler/icons-react'

interface ToolbarProps {
  seedConcept: string
  nodeCount: number
  depth: number
  isConfirmingNewConcept: boolean
  onNewConceptRequest: () => void
  onConfirmNewConcept: () => void
  onCancelNewConcept: () => void
}

const secondaryBtn: React.CSSProperties = {
  border: '0.5px solid rgba(73,101,128,0.15)',
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  borderRadius: 10,
  padding: '6px 14px',
  fontSize: 12,
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  color: '#7A9AAA',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
}

const accentBtn: React.CSSProperties = {
  border: '0.5px solid rgba(186,255,245,0.7)',
  background: 'rgba(186,255,245,0.4)',
  borderRadius: 10,
  padding: '6px 14px',
  fontSize: 12,
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  color: '#2A8070',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  fontWeight: 600,
}

export default function Toolbar({
  seedConcept,
  nodeCount,
  depth,
  isConfirmingNewConcept,
  onNewConceptRequest,
  onConfirmNewConcept,
  onCancelNewConcept,
}: ToolbarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 22,
        paddingRight: 18,
        gap: 12,
        background: 'rgba(253,248,242,0.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '0.5px solid rgba(73,101,128,0.08)',
        zIndex: 100,
      }}
    >
      {/* Left — logo */}
      <span
        style={{
          fontFamily: 'var(--font-display), "Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 20,
          fontWeight: 800,
          color: '#496580',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        bloom
      </span>

      {/* Centre — active concept pill */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {seedConcept && (
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: '#F0F7FF',
              border: '1px solid rgba(186,221,255,0.65)',
              borderRadius: 99,
              padding: '5px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconAtom size={15} color="#BADDFF" aria-hidden />
              <span
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4A7A96',
                  lineHeight: 1,
                }}
              >
                {seedConcept}
              </span>
            </div>
            {nodeCount > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-sans), Inter, sans-serif',
                  fontSize: 10,
                  fontWeight: 400,
                  color: '#8AABBC',
                  lineHeight: 1,
                }}
                aria-label={`${nodeCount} nodes, depth ${depth}`}
              >
                {nodeCount} nodes · depth {depth}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right — action buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {isConfirmingNewConcept ? (
          <>
            <button
              onClick={onConfirmNewConcept}
              aria-label="Confirm new concept"
              style={{
                border: '0.5px solid rgba(192,64,64,0.3)',
                background: 'rgba(255,220,220,0.5)',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                color: '#C04040',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Clear map?
            </button>
            <button
              onClick={onCancelNewConcept}
              aria-label="Cancel new concept"
              style={secondaryBtn}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={nodeCount > 0 ? onNewConceptRequest : onConfirmNewConcept}
              aria-label="New concept"
              style={accentBtn}
            >
              + New concept
            </button>
          </>
        )}
      </div>
    </div>
  )
}
