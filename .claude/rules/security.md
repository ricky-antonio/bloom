# Security Rules

---

## API key protection

`ANTHROPIC_API_KEY` must never reach the client.

- It is accessed only inside `app/api/expand/route.ts` and `app/api/define/route.ts`
- Never import it in any file under `components/`, `lib/context/`, or any file with `'use client'`
- Verify after every build:
  ```bash
  grep -r "sk-ant-" .next/static/ 2>/dev/null && echo "LEAK DETECTED" || echo "Clean"
  ```
  If this outputs "LEAK DETECTED", stop and fix before deploying.

---

## Input validation

Validate at the server-side route handler even when the client has already validated.

Required checks on both `/api/expand` and `/api/define`:

```ts
const body = await req.json()
const { concept } = body

if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
  return Response.json({ error: 'Missing concept', code: 'MISSING_CONCEPT' }, { status: 400 })
}
if (concept.length > 100) {
  return Response.json({ error: 'Concept too long', code: 'CONCEPT_TOO_LONG' }, { status: 400 })
}
```

Never trust the client to have done this first.

---

## Rate limiting

Every AI route must apply rate limiting before calling the Anthropic SDK.

Exact implementation pattern (paste into each route handler):

```ts
const requestLog = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60_000  // 1 minute
  const limit = 15       // 15 requests per minute per IP
  const times = (requestLog.get(ip) ?? []).filter(t => now - t < window)
  requestLog.set(ip, [...times, now])
  return times.length >= limit
}
```

In the route handler:

```ts
const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
if (isRateLimited(ip)) {
  return Response.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
}
```

This runs before input validation, before the Anthropic call.

---

## Content handling

All AI-generated content (definitions, concept labels, related tags) is rendered as **plain text only**.

- Never use `dangerouslySetInnerHTML` anywhere in this app
- Never call `DOMPurify.sanitize` — it is not needed because we never render HTML
- AI-generated strings are passed to React text nodes directly: `{node.definition}`
- If this policy ever changes (e.g. to render markdown), install DOMPurify and sanitize before rendering

---

## Secret management

- `.env.local` is in `.gitignore` — never committed
- `.env.example` IS committed — it is the contract for what env vars the app needs
- Never hardcode any key or secret in source code
- In CI: `ANTHROPIC_API_KEY` is set as a GitHub Actions secret, not in the workflow YAML

---

## AI response trust

Treat all content returned by the Anthropic API as untrusted:

- Parse AI responses with `JSON.parse` inside try/catch — malformed JSON is expected occasionally
- Validate the parsed shape before using it (check that `ring1` is an array, has 6 items, etc.)
- Never execute AI-returned strings as code
- The retry-once-then-fallback pattern is the safety net — implement it in `parseExpansionResponse` and `parseDefinitionResponse`

---

## No admin operations

This app has no admin surface, no privileged operations, and no server-side user data.

The only sensitive operation is the Anthropic API call — protected by:
1. Key stored in environment variable (never client-side)
2. Rate limiting on every request
3. Input validation before every API call

---

## Dependency security

Before adding any new npm package:
1. Check the npm page for weekly downloads and last publish date
2. Check the GitHub repo for recent activity and open issues
3. Run `npm audit` after adding any new package — fix high/critical findings before committing

---

## Manual security verification before each phase is complete

Run these checks before marking any phase done:

1. **Key leak check:** `grep -r "sk-ant-" .next/static/` — must find nothing
2. **Rate limit test:** Submit more than 15 requests in 60 seconds to `/api/expand` — the 16th must return 429
3. **Input injection test:** Submit `concept = "<script>alert(1)</script>"` — must render as plain text in nodes, not execute
4. **Long input test:** Submit a concept of 101 characters — must return 400 from the API route
5. **Empty input test:** POST `{}` to `/api/expand` — must return 400 with `MISSING_CONCEPT`
