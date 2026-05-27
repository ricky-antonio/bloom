'use client'

const ITEMS = [
  { dot: '#BADDFF', text: '#3D6E8C', label: 'Awareness' },
  { dot: '#FFDBBB', text: '#9E5830', label: 'Identity' },
  { dot: '#BAFFF5', text: '#2A8070', label: 'Experiential' },
]

export default function Legend() {
  return (
    <div
      aria-label="Graph legend"
      style={{
        position: 'absolute',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        left: 18,
        zIndex: 5,
        display: 'flex',
        gap: 14,
        pointerEvents: 'none',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '0.5px solid rgba(73,101,128,0.1)',
        borderRadius: 12,
        padding: '7px 14px',
      }}
    >
      {ITEMS.map(({ dot, text, label }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: text,
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
