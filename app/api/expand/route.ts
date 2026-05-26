import Anthropic from '@anthropic-ai/sdk'
import { buildExpansionPrompt, buildRing1Prompt, buildRing2Prompt } from '@/lib/ai/expand'

const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60_000
  const limit = 15
  const times = (requestLog.get(ip) ?? []).filter(t => now - t < window)
  requestLog.set(ip, [...times, now])
  return times.length >= limit
}

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'

  if (isRateLimited(ip)) {
    return Response.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON', code: 'MISSING_CONCEPT' }, { status: 400 })
  }

  const { concept, depth, phase, ring1Labels } = body as {
    concept?: unknown
    depth?: unknown
    phase?: unknown
    ring1Labels?: unknown
  }

  if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
    return Response.json({ error: 'Missing concept', code: 'MISSING_CONCEPT' }, { status: 400 })
  }
  if (concept.length > 100) {
    return Response.json({ error: 'Concept too long', code: 'CONCEPT_TOO_LONG' }, { status: 400 })
  }

  const depthValue = typeof depth === 'number' ? depth : 0
  const labels = Array.isArray(ring1Labels) ? (ring1Labels as string[]) : []

  try {
    const client = new Anthropic()

    if (phase === 'ring1') {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        messages: [{ role: 'user', content: buildRing1Prompt(concept.trim(), depthValue) }],
      })
      const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
      return Response.json({ text })
    }

    if (phase === 'ring2') {
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: buildRing2Prompt(concept.trim(), labels, depthValue) }],
      })
      const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
      return Response.json({ text })
    }

    // Default: full combined response (used by tests and any legacy callers)
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: buildExpansionPrompt(concept.trim(), depthValue) }],
    })
    const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
    return Response.json({ text })
  } catch {
    return Response.json(
      { error: 'AI service unavailable', code: 'AI_NETWORK_FAILURE' },
      { status: 500 }
    )
  }
}
