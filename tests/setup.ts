import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Global fetch mock — tests override per-test as needed
global.fetch = vi.fn()

// Reset all mocks between tests to prevent bleed
afterEach(() => {
  vi.clearAllMocks()
})

// Silence React act() warnings in tests where async rendering is intentional
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('act(')) return
    originalError.apply(console, args)
  }
})
afterAll(() => {
  console.error = originalError
})
