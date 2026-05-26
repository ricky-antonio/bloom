import { EXPANSION_FALLBACK } from '../types'
import type { ExpansionResponse, Category } from '../types'

export function buildExpansionPrompt(concept: string, depth: number): string {
  const depthHint =
    depth === 0
      ? 'This is the seed concept — choose broadly across different dimensions of human understanding.'
      : `The user has explored ${depth} level${depth === 1 ? '' : 's'} — go deeper and more specific.`

  return `You are a knowledge graph builder. Expand the concept "${concept}" into a structured web of related ideas.

${depthHint}

Return ONLY valid JSON in this exact shape — no markdown, no explanation, no surrounding text:
{
  "ring1": [
    { "label": "1–3 word concept", "category": "awareness|identity|experiential", "reason": "One sentence why this relates to ${concept}." }
  ],
  "ring2": [
    { "label": "1–3 word concept", "parentLabel": "must match a ring1 label exactly", "category": "awareness|identity|experiential" }
  ]
}

Rules:
- ring1: exactly 6 items, each label is 1–3 words, lowercase
- ring2: exactly 12 items (2 per ring1 concept), each parentLabel must exactly match a ring1 label
- category must be one of: "awareness", "identity", "experiential"
  - awareness: how we think about, perceive, or know the concept
  - identity: how the concept relates to self and being
  - experiential: how the concept feels or manifests in lived experience
- All labels lowercase, 1–3 words
- Return pure JSON only — no code fences, no extra keys`
}

const VALID_CATEGORIES: Category[] = ['awareness', 'identity', 'experiential']

function toCategory(s: string): Category {
  return VALID_CATEGORIES.includes(s as Category) ? (s as Category) : 'awareness'
}

function isValidShape(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  return (
    Array.isArray(obj.ring1) &&
    obj.ring1.length === 6 &&
    Array.isArray(obj.ring2) &&
    obj.ring2.length === 12
  )
}

export function parseExpansionResponse(text: string, isRetry = false): ExpansionResponse {
  const cleaned = text.replace(/```json|```/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    if (isRetry) return EXPANSION_FALLBACK
    return parseExpansionResponse(cleaned, true)
  }

  if (!isValidShape(parsed)) {
    if (isRetry) return EXPANSION_FALLBACK
    return parseExpansionResponse(cleaned, true)
  }

  const obj = parsed as Record<string, unknown>
  return {
    ring1: (obj.ring1 as any[]).map((item: any) => ({ // d3 internal
      label: item.label as string,
      category: toCategory(item.category as string),
      reason: item.reason as string,
    })),
    ring2: (obj.ring2 as any[]).map((item: any) => ({ // d3 internal
      label: item.label as string,
      parentLabel: item.parentLabel as string,
      category: toCategory(item.category as string),
    })),
  }
}
