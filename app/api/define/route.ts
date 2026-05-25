import Anthropic from '@anthropic-ai/sdk'
import { buildDefinitionPrompt, parseDefinitionResponse } from '@/lib/ai/define'

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

  const { concept, parentConcept } = body as { concept?: unknown; parentConcept?: unknown }

  if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
    return Response.json({ error: 'Missing concept', code: 'MISSING_CONCEPT' }, { status: 400 })
  }
  if (concept.length > 100) {
    return Response.json({ error: 'Concept too long', code: 'CONCEPT_TOO_LONG' }, { status: 400 })
  }
  if (!parentConcept || typeof parentConcept !== 'string' || parentConcept.trim().length === 0) {
    return Response.json({ error: 'Missing parentConcept', code: 'MISSING_CONCEPT' }, { status: 400 })
  }

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: buildDefinitionPrompt(concept.trim(), parentConcept.trim()),
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const result = parseDefinitionResponse(text)

    return Response.json(result)
  } catch {
    return Response.json(
      { error: 'AI service unavailable', code: 'AI_NETWORK_FAILURE' },
      { status: 500 }
    )
  }
}
