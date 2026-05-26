'use client'

import type { Category } from '@/lib/types'

interface ConceptTagProps {
  label: string
  category?: Category
  onClick?: (label: string) => void
}

const TAG_STYLE: Record<Category, { bg: string; border: string; color: string }> = {
  awareness: {
    bg: 'rgba(186,221,255,0.1)',
    border: 'rgba(186,221,255,0.55)',
    color: '#4A7A9A',
  },
  identity: {
    bg: 'rgba(255,219,187,0.1)',
    border: 'rgba(255,219,187,0.55)',
    color: '#B06030',
  },
  experiential: {
    bg: 'rgba(186,255,245,0.1)',
    border: 'rgba(186,255,245,0.55)',
    color: '#309080',
  },
}

const NEUTRAL = {
  bg: 'rgba(73,101,128,0.04)',
  border: 'rgba(73,101,128,0.12)',
  color: '#6A8AA0',
}

export default function ConceptTag({ label, category, onClick }: ConceptTagProps) {
  const style = category ? TAG_STYLE[category] : NEUTRAL

  return (
    <button
      onClick={() => onClick?.(label)}
      aria-label={`Explore concept: ${label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '4px 9px',
        borderRadius: 10,
        border: `0.5px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        fontSize: 9,
        fontWeight: 500,
        fontFamily: 'var(--font-sans), Inter, sans-serif',
        letterSpacing: '0.01em',
        cursor: 'pointer',
        transition: 'transform 150ms ease',
        lineHeight: 1.4,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {label}
    </button>
  )
}
