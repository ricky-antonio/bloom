'use client'

import { IconPlus, IconMinus, IconFocusCentered } from '@tabler/icons-react'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const BTN_STYLE: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '0.5px solid rgba(73,101,128,0.1)',
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  borderRadius: 10,
  cursor: 'pointer',
  color: '#8AABBC',
  transition: 'background 150ms',
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 13,
        right: 14,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.9)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)' }}
      >
        <IconPlus size={14} aria-hidden />
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.9)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)' }}
      >
        <IconMinus size={14} aria-hidden />
      </button>
      <button
        onClick={onReset}
        aria-label="Reset zoom"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.9)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)' }}
      >
        <IconFocusCentered size={14} aria-hidden />
      </button>
    </div>
  )
}
