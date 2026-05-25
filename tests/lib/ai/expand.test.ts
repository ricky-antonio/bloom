import { describe, it, expect } from 'vitest'
import { buildExpansionPrompt, parseExpansionResponse } from '@/lib/ai/expand'
import { EXPANSION_FALLBACK } from '@/lib/types'

const validResponse = {
  ring1: [
    { label: 'meaning', category: 'awareness', reason: 'Core to the concept.' },
    { label: 'context', category: 'awareness', reason: 'Shapes understanding.' },
    { label: 'feeling', category: 'experiential', reason: 'Lived experience.' },
    { label: 'identity', category: 'identity', reason: 'Relates to self.' },
    { label: 'change', category: 'experiential', reason: 'Evolves over time.' },
    { label: 'connection', category: 'identity', reason: 'Relates to others.' },
  ],
  ring2: [
    { label: 'interpretation', parentLabel: 'meaning', category: 'awareness' },
    { label: 'purpose', parentLabel: 'meaning', category: 'awareness' },
    { label: 'environment', parentLabel: 'context', category: 'awareness' },
    { label: 'perspective', parentLabel: 'context', category: 'awareness' },
    { label: 'emotion', parentLabel: 'feeling', category: 'experiential' },
    { label: 'sensation', parentLabel: 'feeling', category: 'experiential' },
    { label: 'self', parentLabel: 'identity', category: 'identity' },
    { label: 'values', parentLabel: 'identity', category: 'identity' },
    { label: 'growth', parentLabel: 'change', category: 'experiential' },
    { label: 'transition', parentLabel: 'change', category: 'experiential' },
    { label: 'relationship', parentLabel: 'connection', category: 'identity' },
    { label: 'belonging', parentLabel: 'connection', category: 'identity' },
  ],
}

describe('buildExpansionPrompt', () => {
  it('includes the concept name in the prompt string', () => {
    const prompt = buildExpansionPrompt('creativity', 0)
    expect(prompt).toContain('creativity')
  })

  it('includes depth hint for seed (depth 0)', () => {
    const prompt = buildExpansionPrompt('creativity', 0)
    expect(prompt).toContain('seed')
    expect(prompt).toContain('choose broadly')
  })

  it('includes depth hint for non-seed depth', () => {
    const prompt = buildExpansionPrompt('creativity', 3)
    expect(prompt).toContain('3')
    expect(prompt).toContain('deeper')
  })
})

describe('parseExpansionResponse', () => {
  it('returns correctly shaped ring1 array with 6 items', () => {
    const result = parseExpansionResponse(JSON.stringify(validResponse))
    expect(result.ring1).toHaveLength(6)
  })

  it('returns correctly shaped ring2 array with 12 items', () => {
    const result = parseExpansionResponse(JSON.stringify(validResponse))
    expect(result.ring2).toHaveLength(12)
  })

  it('handles JSON wrapped in markdown code fences', () => {
    const wrapped = '```json\n' + JSON.stringify(validResponse) + '\n```'
    const result = parseExpansionResponse(wrapped)
    expect(result.ring1).toHaveLength(6)
    expect(result.ring2).toHaveLength(12)
  })

  it('returns typed fallback after two parse failures', () => {
    const result = parseExpansionResponse('not json at all }{')
    expect(result).toEqual(EXPANSION_FALLBACK)
  })

  it('retries once before returning fallback', () => {
    const result = parseExpansionResponse('```json\n{ invalid json }\n```')
    expect(result).toEqual(EXPANSION_FALLBACK)
  })

  it('maps category strings to Category type correctly', () => {
    const withValidCategories = JSON.stringify(validResponse)
    const result = parseExpansionResponse(withValidCategories)
    expect(result.ring1[0].category).toBe('awareness')
    expect(result.ring1[2].category).toBe('experiential')
    expect(result.ring1[3].category).toBe('identity')
  })

  it('maps invalid category strings to awareness fallback', () => {
    const withBadCategory = {
      ...validResponse,
      ring1: validResponse.ring1.map((item, i) =>
        i === 0 ? { ...item, category: 'unknown_type' } : item
      ),
    }
    const result = parseExpansionResponse(JSON.stringify(withBadCategory))
    expect(result.ring1[0].category).toBe('awareness')
  })
})
