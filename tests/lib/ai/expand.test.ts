import { describe, it, expect } from 'vitest'
import { buildExpansionPrompt, parseExpansionResponse, buildRing1Prompt, buildRing2Prompt, parseRing1Response, parseRing2Response } from '@/lib/ai/expand'
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

  it('parseExpansionResponse with partial ring1 (fewer than 6 items) returns fallback', () => {
    const partial = {
      ring1: [
        { label: 'meaning', category: 'awareness', reason: 'Core concept.' },
        { label: 'context', category: 'awareness', reason: 'Shapes understanding.' },
      ],
      ring2: [],
    }
    const result = parseExpansionResponse(JSON.stringify(partial))
    expect(result).toEqual(EXPANSION_FALLBACK)
  })
})

describe('buildRing1Prompt', () => {
  it('includes the concept name', () => {
    expect(buildRing1Prompt('love', 0)).toContain('love')
  })

  it('includes depth hint for seed', () => {
    expect(buildRing1Prompt('love', 0)).toContain('seed')
  })

  it('includes depth hint for non-seed', () => {
    expect(buildRing1Prompt('love', 2)).toContain('2')
  })
})

describe('buildRing2Prompt', () => {
  it('includes the concept name', () => {
    expect(buildRing2Prompt('love', ['attachment', 'longing'], 0)).toContain('love')
  })

  it('includes all ring1 labels', () => {
    const prompt = buildRing2Prompt('love', ['attachment', 'longing'], 0)
    expect(prompt).toContain('attachment')
    expect(prompt).toContain('longing')
  })
})

describe('parseRing1Response', () => {
  const validRing1 = {
    ring1: [
      { label: 'meaning', category: 'awareness', definition: 'How we assign significance to experience.' },
      { label: 'context', category: 'awareness', definition: 'The surrounding circumstances that shape understanding.' },
      { label: 'feeling', category: 'experiential', definition: 'The lived emotional texture of an experience.' },
      { label: 'identity', category: 'identity', definition: 'How the concept relates to our sense of self.' },
      { label: 'change', category: 'experiential', definition: 'The process of transformation over time.' },
      { label: 'connection', category: 'identity', definition: 'Bonds formed with others through shared experience.' },
    ],
  }

  it('returns a ring1 array from valid response', () => {
    const result = parseRing1Response(JSON.stringify(validRing1))
    expect(result).toHaveLength(6)
    expect(result[0].label).toBe('meaning')
  })

  it('handles JSON wrapped in markdown fences', () => {
    const result = parseRing1Response('```json\n' + JSON.stringify(validRing1) + '\n```')
    expect(result).toHaveLength(6)
  })

  it('returns fallback on invalid JSON', () => {
    const result = parseRing1Response('not json')
    expect(result).toEqual(EXPANSION_FALLBACK.ring1)
  })

  it('returns fallback when ring1 has fewer than 3 items', () => {
    const result = parseRing1Response(JSON.stringify({ ring1: [{ label: 'a', category: 'awareness' }] }))
    expect(result).toEqual(EXPANSION_FALLBACK.ring1)
  })

  it('extracts definition field from ring1 items when present', () => {
    const result = parseRing1Response(JSON.stringify(validRing1))
    expect(result[0].definition).toBe('How we assign significance to experience.')
    expect(result[1].definition).toBe('The surrounding circumstances that shape understanding.')
  })

  it('leaves definition undefined when absent from ring1 items', () => {
    const noDefinition = {
      ring1: validRing1.ring1.map(({ definition: _def, ...rest }) => rest),
    }
    const result = parseRing1Response(JSON.stringify(noDefinition))
    expect(result[0].definition).toBeUndefined()
  })
})

describe('parseRing2Response', () => {
  const ring1Labels = ['meaning', 'context', 'feeling', 'identity', 'change', 'connection']
  const validRing2 = {
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

  it('returns a ring2 array from valid response', () => {
    const result = parseRing2Response(JSON.stringify(validRing2), ring1Labels)
    expect(result).toHaveLength(12)
  })

  it('filters out items with invalid parentLabel', () => {
    const withBadParent = {
      ring2: [
        ...validRing2.ring2,
        { label: 'orphan', parentLabel: 'nonexistent', category: 'awareness' },
      ],
    }
    const result = parseRing2Response(JSON.stringify(withBadParent), ring1Labels)
    expect(result).toHaveLength(12)
  })

  it('returns empty array on invalid JSON', () => {
    const result = parseRing2Response('not json', ring1Labels)
    expect(result).toEqual([])
  })

  it('returns empty array when ring2 has fewer than 4 items', () => {
    const result = parseRing2Response(JSON.stringify({ ring2: [{ label: 'a', parentLabel: 'meaning', category: 'awareness' }] }), ring1Labels)
    expect(result).toEqual([])
  })
})
