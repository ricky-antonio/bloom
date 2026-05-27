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
        gap: 16,
      }}
    >
      {/* Animated background pulse */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
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
          fontSize: 72,
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
          fontSize: 20,
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
          fontSize: 15,
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
          gap: 10,
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
              padding: '7px 18px',
              borderRadius: 14,
              border: '0.5px solid rgba(73,101,128,0.15)',
              background: 'rgba(73,101,128,0.05)',
              color: '#6A8AA0',
              fontSize: 13,
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
          gap: 32,
          position: 'relative',
          marginTop: 24,
        }}
      >
        {([
          { dot: '#BADDFF', text: '#3D6E8C', name: 'awareness',    desc: 'How you perceive and relate to the world — attention, consciousness, and observation.' },
          { dot: '#FFDBBB', text: '#9E5830', name: 'identity',     desc: 'Who you are and how you define yourself — beliefs, roles, values, and self-concept.' },
          { dot: '#BAFFF5', text: '#2A8070', name: 'experiential', desc: 'What you feel and live through — emotions, sensations, memories, and lived moments.' },
        ] as const).map(({ dot, text, name, desc }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: dot,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: text,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {name}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 11,
              color: '#7A9AAA',
              lineHeight: 1.55,
              textAlign: 'center',
              maxWidth: 140,
            }}>
              {desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
