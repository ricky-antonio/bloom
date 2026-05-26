'use client'

import { IconPlus, IconMinus, IconFocusCentered } from '@tabler/icons-react'

interface ZoomControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const BTN_STYLE: React.CSSProperties = {
  width: 38,
  height: 38,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '0.5px solid rgba(73,101,128,0.12)',
  background: 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderRadius: 12,
  cursor: 'pointer',
  color: '#8AABBC',
  transition: 'background 150ms',
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 18,
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
      }}
    >
      <button
        onClick={onZoomIn}
        aria-label="Zoom in"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.75)' }}
      >
        <IconPlus size={16} aria-hidden />
      </button>
      <button
        onClick={onZoomOut}
        aria-label="Zoom out"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.75)' }}
      >
        <IconMinus size={16} aria-hidden />
      </button>
      <button
        onClick={onReset}
        aria-label="Reset zoom"
        style={BTN_STYLE}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.95)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.75)' }}
      >
        <IconFocusCentered size={16} aria-hidden />
      </button>
    </div>
  )
}
