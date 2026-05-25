import { describe, it, expect } from 'vitest'
import { buildDefinitionPrompt, parseDefinitionResponse } from '@/lib/ai/define'
import { DEFINITION_FALLBACK } from '@/lib/types'

const validResponse = {
  definition: 'Creativity is the ability to generate novel ideas. It connects to awareness by expanding perception and opening new ways of seeing the world.',
  relatedTags: ['imagination', 'innovation', 'expression', 'originality'],
}

describe('buildDefinitionPrompt', () => {
  it('includes concept name', () => {
    const prompt = buildDefinitionPrompt('creativity', 'awareness')
    expect(prompt).toContain('creativity')
  })

  it('includes parentConcept name', () => {
    const prompt = buildDefinitionPrompt('creativity', 'awareness')
    expect(prompt).toContain('awareness')
  })
})

describe('parseDefinitionResponse', () => {
  it('returns definition string', () => {
    const result = parseDefinitionResponse(JSON.stringify(validResponse))
    expect(typeof result.definition).toBe('string')
    expect(result.definition).toBe(validResponse.definition)
  })

  it('returns exactly 4 relatedTags', () => {
    const result = parseDefinitionResponse(JSON.stringify(validResponse))
    expect(result.relatedTags).toHaveLength(4)
  })

  it('handles JSON wrapped in markdown code fences', () => {
    const wrapped = '```json\n' + JSON.stringify(validResponse) + '\n```'
    const result = parseDefinitionResponse(wrapped)
    expect(result.definition).toBe(validResponse.definition)
    expect(result.relatedTags).toHaveLength(4)
  })

  it('returns fallback on malformed JSON', () => {
    const result = parseDefinitionResponse('{ this is not json }')
    expect(result).toEqual(DEFINITION_FALLBACK)
  })
})
