'use client'

import { useState } from 'react'

const ITEMS = [
  {
    dot: '#BADDFF',
    text: '#3D6E8C',
    label: 'Awareness',
    tooltip: 'How you perceive and relate to the world around you — attention, consciousness, and observation.',
  },
  {
    dot: '#FFDBBB',
    text: '#9E5830',
    label: 'Identity',
    tooltip: 'Who you are and how you define yourself — beliefs, roles, values, and self-concept.',
  },
  {
    dot: '#BAFFF5',
    text: '#2A8070',
    label: 'Experiential',
    tooltip: 'What you feel and live through — emotions, sensations, memories, and lived moments.',
  },
]

export default function Legend() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  return (
    <div
      aria-label="Graph legend"
      className="bloom-legend"
      style={{
        position: 'absolute',
        bottom: 16,
        left: 18,
        zIndex: 5,
        display: 'flex',
        gap: 14,
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '0.5px solid rgba(73,101,128,0.1)',
        borderRadius: 12,
        padding: '7px 14px',
      }}
    >
      {ITEMS.map(({ dot, text, label, tooltip }) => (
        <div
          key={label}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, cursor: 'default' }}
          onMouseEnter={() => setActiveTooltip(label)}
          onMouseLeave={() => setActiveTooltip(null)}
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

          {activeTooltip === label && (
            <div
              role="tooltip"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 10px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 180,
                background: 'rgba(255,255,255,0.97)',
                border: '0.5px solid rgba(73,101,128,0.12)',
                borderRadius: 10,
                padding: '8px 11px',
                boxShadow: '0 4px 16px rgba(73,101,128,0.12)',
                fontFamily: 'var(--font-sans), Inter, sans-serif',
                fontSize: 11,
                fontWeight: 400,
                color: '#7A92A8',
                lineHeight: 1.55,
                pointerEvents: 'none',
                animation: 'tooltip-appear 150ms ease',
                zIndex: 10,
                whiteSpace: 'normal',
              }}
            >
              {tooltip}
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                bottom: -5,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 8,
                height: 8,
                background: 'rgba(255,255,255,0.97)',
                border: '0.5px solid rgba(73,101,128,0.12)',
                borderTop: 'none',
                borderLeft: 'none',
              }} />
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes tooltip-appear {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
        @media (max-width: 640px) {
          .bloom-legend {
            left: 50% !important;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  )
}
