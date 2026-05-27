'use client'

import { useState } from 'react'
import { IconAtom, IconSparkles } from '@tabler/icons-react'

interface SearchBarProps {
  onSubmit: (concept: string) => void
  disabled?: boolean
  onFocusChange?: (focused: boolean) => void
}

export default function SearchBar({ onSubmit, disabled, onFocusChange }: SearchBarProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const [shaking, setShaking] = useState(false)

  function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
      return
    }
    if (trimmed.length > 100) {
      setError('Keep it short — one concept at a time')
      return
    }
    onSubmit(trimmed)
    setValue('')
    setError(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className={shaking ? 'search-shake' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: 'min(400px, calc(100vw - 32px))',
          height: 50,
          background: '#FFFFFF',
          border: `1px solid ${focused ? 'rgba(73,101,128,0.35)' : 'rgba(73,101,128,0.18)'}`,
          borderRadius: 28,
          padding: '0 16px',
          boxSizing: 'border-box',
          boxShadow: focused ? '0 4px 20px rgba(73,101,128,0.08)' : '0 2px 8px rgba(73,101,128,0.05)',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      >
        <IconAtom size={20} color="#BADDFF" aria-hidden />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          onFocus={() => { setFocused(true); onFocusChange?.(true) }}
          onBlur={() => { setFocused(false); onFocusChange?.(false) }}
          placeholder="Enter any concept to explore…"
          aria-label="Enter a concept to explore"
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 15,
            color: '#496580',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled}
          aria-label="Submit concept"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconSparkles size={20} color="#BADDFF" />
        </button>
      </div>
      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: '#BACCDA', margin: '6px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  )
}
