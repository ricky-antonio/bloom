'use client'

import { IconAtom } from '@tabler/icons-react'

interface ToolbarProps {
  seedConcept: string
  nodeCount: number
  depth: number
  onSave: () => void
  onExport: () => void
  onNewConcept: () => void
  isConfirmingClear: boolean
  onConfirmClear: () => void
  onCancelClear: () => void
  onClearRequest?: () => void
}

const secondaryBtn: React.CSSProperties = {
  border: '0.5px solid rgba(73,101,128,0.12)',
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  borderRadius: 8,
  padding: '4px 10px',
  fontSize: 11,
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  color: '#8AABBC',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
}

const accentBtn: React.CSSProperties = {
  border: '0.5px solid rgba(186,255,245,0.6)',
  background: 'rgba(186,255,245,0.35)',
  borderRadius: 8,
  padding: '4px 10px',
  fontSize: 11,
  fontFamily: 'var(--font-sans), Inter, sans-serif',
  color: '#40A090',
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
  fontWeight: 600,
}

export default function Toolbar({
  seedConcept,
  nodeCount,
  depth,
  onSave,
  onExport,
  onNewConcept,
  isConfirmingClear,
  onConfirmClear,
  onCancelClear,
  onClearRequest,
}: ToolbarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 18,
        paddingRight: 14,
        gap: 10,
        background: 'rgba(253,248,242,0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '0.5px solid rgba(73,101,128,0.07)',
        zIndex: 100,
      }}
    >
      {/* Left — logo */}
      <span
        style={{
          fontFamily: 'var(--font-display), "Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 15,
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
              alignItems: 'center',
              gap: 6,
              background: '#F0F7FF',
              border: '1px solid rgba(186,221,255,0.6)',
              borderRadius: 99,
              padding: '4px 12px',
            }}
          >
            <IconAtom size={14} color="#BADDFF" aria-hidden />
            <span
              style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: '#5A8AAA',
                lineHeight: 1,
              }}
            >
              {seedConcept}
            </span>
            {nodeCount > 0 && (
              <>
                <span style={{ color: '#BACCDA', fontSize: 10 }}>·</span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans), Inter, sans-serif',
                    fontSize: 10,
                    fontWeight: 400,
                    color: '#8AABBC',
                  }}
                  aria-label={`${nodeCount} nodes, depth ${depth}`}
                >
                  {nodeCount} nodes · depth {depth}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right — action buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        {isConfirmingClear ? (
          <>
            <button
              onClick={onConfirmClear}
              aria-label="Confirm clear graph"
              style={{
                border: '0.5px solid rgba(192,64,64,0.3)',
                background: 'rgba(255,220,220,0.5)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                color: '#C04040',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Confirm clear?
            </button>
            <button
              onClick={onCancelClear}
              aria-label="Cancel clear"
              style={secondaryBtn}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {nodeCount > 0 && onClearRequest && (
              <button
                onClick={onClearRequest}
                aria-label="Clear graph"
                style={secondaryBtn}
              >
                Clear
              </button>
            )}
            {nodeCount > 0 && (
              <button
                onClick={onSave}
                aria-label="Save map"
                style={secondaryBtn}
              >
                Save map
              </button>
            )}
            {nodeCount > 0 && (
              <button
                onClick={onExport}
                aria-label="Export graph as JSON"
                style={secondaryBtn}
              >
                Export
              </button>
            )}
            <button
              onClick={onNewConcept}
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
