'use client'

import { useState } from 'react'
import { IconAtom, IconSparkles } from '@tabler/icons-react'

interface SearchBarProps {
  onSubmit: (concept: string) => void
  disabled?: boolean
}

export default function SearchBar({ onSubmit, disabled }: SearchBarProps) {
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
          gap: 8,
          width: 320,
          height: 42,
          background: '#FFFFFF',
          border: `1px solid ${focused ? 'rgba(73,101,128,0.30)' : 'rgba(73,101,128,0.15)'}`,
          borderRadius: 22,
          padding: '0 12px',
          boxSizing: 'border-box',
        }}
      >
        <IconAtom size={18} color="#BADDFF" aria-hidden />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter any concept to explore…"
          aria-label="Enter a concept to explore"
          disabled={disabled}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 13,
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
          <IconSparkles size={18} color="#BADDFF" />
        </button>
      </div>
      {error && (
        <p style={{ marginTop: 4, fontSize: 11, color: '#BACCDA', margin: '4px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  )
}
