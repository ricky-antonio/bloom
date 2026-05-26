'use client'

interface EmptyStateProps {
  onSubmit: (concept: string) => void
}

const EXAMPLES = ['consciousness', 'time', 'love']

export default function EmptyState({ onSubmit }: EmptyStateProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        gap: 12,
      }}
    >
      {/* Animated background pulse */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,219,187,1) 0%, transparent 70%)',
          animation: 'pulse-bg 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Wordmark */}
      <div
        style={{
          fontFamily: 'var(--font-display), "Playfair Display", serif',
          fontStyle: 'italic',
          fontSize: 48,
          fontWeight: 800,
          color: '#FFDBBB',
          lineHeight: 1,
          position: 'relative',
        }}
      >
        bloom
      </div>

      {/* Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          fontSize: 16,
          color: '#8AABBC',
          margin: 0,
          position: 'relative',
        }}
      >
        Every idea has roots.
      </p>

      {/* Instruction */}
      <p
        style={{
          fontFamily: 'var(--font-sans), Inter, sans-serif',
          fontSize: 13,
          color: '#BACCDA',
          margin: 0,
          position: 'relative',
        }}
      >
        Type any concept above to begin
      </p>

      {/* Example pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          pointerEvents: 'all',
          position: 'relative',
          marginTop: 4,
        }}
      >
        {EXAMPLES.map(concept => (
          <button
            key={concept}
            onClick={() => onSubmit(concept)}
            aria-label={`Explore concept: ${concept}`}
            style={{
              padding: '5px 12px',
              borderRadius: 10,
              border: '0.5px solid rgba(73,101,128,0.12)',
              background: 'rgba(73,101,128,0.04)',
              color: '#6A8AA0',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'transform 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
          >
            {concept}
          </button>
        ))}
      </div>

      {/* Category key */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          position: 'relative',
          marginTop: 20,
        }}
      >
        {([
          { color: '#BADDFF', name: 'awareness',    desc: 'how you perceive it' },
          { color: '#FFDBBB', name: 'identity',     desc: 'how it shapes you' },
          { color: '#BAFFF5', name: 'experiential', desc: 'how it feels' },
        ] as const).map(({ color, name, desc }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                color,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {name}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 10,
              color: '#8AABBC',
              opacity: 0.7,
            }}>
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
