import { DEFINITION_FALLBACK } from '../types'
import type { DefinitionResponse } from '../types'

export function buildDefinitionPrompt(concept: string, parentConcept: string): string {
  return `You are a concept explainer. Define "${concept}" in the context of "${parentConcept}".

Return ONLY valid JSON in this exact shape — no markdown, no explanation, no surrounding text:
{
  "definition": "2–3 sentences, max 60 words. Explain what ${concept} means and how it connects to ${parentConcept}.",
  "relatedTags": ["tag1", "tag2", "tag3", "tag4"]
}

Rules:
- definition: 2–3 sentences, max 60 words, plain English, no jargon
- relatedTags: exactly 4 items, each 1–3 words, lowercase
- Return pure JSON only — no code fences, no extra keys`
}

function isValidShape(data: unknown): data is { definition: string; relatedTags: string[] } {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.definition === 'string' &&
    Array.isArray(obj.relatedTags) &&
    obj.relatedTags.length === 4
  )
}

export function parseDefinitionResponse(text: string, isRetry = false): DefinitionResponse {
  const cleaned = text.replace(/```json|```/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    if (isRetry) return DEFINITION_FALLBACK
    return parseDefinitionResponse(cleaned, true)
  }

  if (!isValidShape(parsed)) {
    if (isRetry) return DEFINITION_FALLBACK
    return parseDefinitionResponse(cleaned, true)
  }

  return {
    definition: parsed.definition,
    relatedTags: parsed.relatedTags as [string, string, string, string],
  }
}
