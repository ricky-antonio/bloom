'use client'

import { useState } from 'react'
import { IconAtom, IconX, IconDownload, IconTrash } from '@tabler/icons-react'

interface ToolbarProps {
  seedConcept: string
  nodeCount: number
  onClear: () => void
  onExport: () => void
}

export default function Toolbar({ seedConcept, nodeCount, onClear, onExport }: ToolbarProps) {
  const [confirmingClear, setConfirmingClear] = useState(false)

  function handleClearClick() {
    if (confirmingClear) {
      onClear()
      setConfirmingClear(false)
    } else {
      setConfirmingClear(true)
    }
  }

  function handleCancelClear() {
    setConfirmingClear(false)
  }

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
      {/* Logo */}
      <span
        style={{
          fontFamily: 'var(--font-display), "Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 15,
          fontWeight: 800,
          color: '#496580',
          lineHeight: 1,
          marginRight: 4,
        }}
      >
        bloom
      </span>

      {/* Active concept pill */}
      {seedConcept && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(73,101,128,0.12)',
            borderRadius: 22,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            padding: '4px 10px 4px 8px',
          }}
        >
          <IconAtom size={12} color="#BADDFF" aria-hidden />
          <span
            style={{
              fontFamily: 'var(--font-display), "Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: 13,
              fontWeight: 700,
              color: '#496580',
              lineHeight: 1,
            }}
          >
            {seedConcept}
          </span>
          <button
            onClick={onClear}
            aria-label="Clear concept"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              lineHeight: 0,
            }}
          >
            <IconX size={10} color="#BACCDA" aria-hidden />
          </button>
        </div>
      )}

      {/* Node count badge */}
      {nodeCount > 0 && (
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '0.5px solid rgba(73,101,128,0.08)',
            borderRadius: 20,
            padding: '3px 9px',
            fontSize: 10,
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            color: '#BACCDA',
            lineHeight: 1.4,
          }}
        >
          {nodeCount} nodes
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Clear button */}
      {nodeCount > 0 && (
        confirmingClear ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#8AABBC', fontFamily: 'var(--font-sans), Inter, sans-serif' }}>
              Clear graph?
            </span>
            <button
              onClick={handleClearClick}
              aria-label="Confirm clear graph"
              style={{
                border: '0.5px solid rgba(200,80,60,0.3)',
                background: 'rgba(255,220,210,0.4)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                color: '#C05040',
                cursor: 'pointer',
              }}
            >
              Yes, clear
            </button>
            <button
              onClick={handleCancelClear}
              aria-label="Cancel clear"
              style={{
                border: '0.5px solid rgba(73,101,128,0.1)',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 8,
                padding: '4px 10px',
                fontSize: 11,
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                color: '#8AABBC',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleClearClick}
            aria-label="Clear graph"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              border: '0.5px solid rgba(73,101,128,0.1)',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 11,
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              color: '#8AABBC',
              cursor: 'pointer',
            }}
          >
            <IconTrash size={13} aria-hidden />
            Clear
          </button>
        )
      )}

      {/* Export button */}
      {nodeCount > 0 && (
        <button
          onClick={onExport}
          aria-label="Export graph as JSON"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            border: '0.5px solid rgba(255,219,187,0.6)',
            background: 'rgba(255,219,187,0.4)',
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 11,
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            color: '#C07040',
            cursor: 'pointer',
          }}
        >
          <IconDownload size={13} aria-hidden />
          Export
        </button>
      )}
    </div>
  )
}
