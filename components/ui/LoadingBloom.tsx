'use client'

/* Four-petal bloom: each petal is an ellipse rotated 90° apart.
   The whole SVG spins; each petal has a staggered scale pulse. */
export default function LoadingBloom() {
  const petals = [
    { colour: '#FFDBBB', rotate: 0,   delay: '0s' },     // peach — top
    { colour: '#BADDFF', rotate: 90,  delay: '0.75s' },  // sky   — right
    { colour: '#BAFFF5', rotate: 180, delay: '1.5s' },   // mint  — bottom
    { colour: '#BACCDA', rotate: 270, delay: '2.25s' },  // slate — left
  ]

  return (
    <div
      aria-live="polite"
      aria-label="Generating concept map"
      style={{ position: 'relative', width: 0, height: 0 }}
    >
      {/* Spinner — above the core node */}
      <div style={{
        position: 'absolute',
        left: '50%',
        bottom: 72,
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg
          width="80"
          height="80"
          viewBox="-32 -32 64 64"
          style={{ animation: 'spin 3s linear infinite' }}
          aria-hidden
        >
          {petals.map(({ colour, rotate, delay }) => (
            <g key={rotate} transform={`rotate(${rotate})`}>
              <ellipse
                cx={0}
                cy={-14}
                rx={8}
                ry={13}
                fill={colour}
                opacity={0.85}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animation: `pulse 1.2s ease-in-out ${delay} infinite alternate`,
                }}
              />
            </g>
          ))}
          <circle cx={0} cy={0} r={4} fill="rgba(73,101,128,0.15)" />
        </svg>
      </div>

      {/* Label — below the core node */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 100,
        transform: 'translateX(-50%)',
        whiteSpace: 'nowrap',
      }}>
        <p
          style={{
            fontFamily: 'var(--font-sans), Inter, sans-serif',
            fontSize: 14,
            color: '#BACCDA',
            margin: 0,
          }}
        >
          Growing your idea…
        </p>
      </div>
    </div>
  )
}
