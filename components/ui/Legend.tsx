'use client'

const ITEMS = [
  { colour: '#BADDFF', label: 'Awareness' },
  { colour: '#FFDBBB', label: 'Identity' },
  { colour: '#BAFFF5', label: 'Experiential' },
]

export default function Legend() {
  return (
    <div
      aria-label="Graph legend"
      style={{
        position: 'absolute',
        bottom: 13,
        left: 16,
        zIndex: 5,
        display: 'flex',
        gap: 12,
        pointerEvents: 'none',
      }}
    >
      {ITEMS.map(({ colour, label }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: colour,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-sans), Inter, sans-serif',
              fontSize: 9,
              color: '#C4D2DC',
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
