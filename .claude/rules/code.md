# Code Rules

Non-negotiable. Every rule applies in every session.

---

## TypeScript

- `strict: true` in tsconfig — no exceptions
- No `any` except in D3 internals (force simulation callbacks) where the type system cannot be satisfied without it — mark with `// d3 internal` comment
- No type assertions (`as T`) without a comment explaining why inference fails
- No `// @ts-ignore` or `// @ts-expect-error`
- All function parameters and return types are explicit on public lib functions
- Enums are not used — prefer union types (`'ring1' | 'ring2'`)

---

## File and function organisation

- All graph mutations live in `lib/graph.ts` — never inside components or reducers
- All AI prompts and parsers live in `lib/ai/expand.ts` and `lib/ai/define.ts`
- All colour logic lives in `lib/colour.ts`
- D3 simulation config lives in `lib/force.ts`
- GraphState mutations happen in `lib/context/GraphContext.tsx` (the reducer) by calling lib functions
- Components never manipulate the `nodes` or `edges` arrays directly — they dispatch actions
- Components never call `fetch` directly except `StreamingDefinition.tsx` (documented exception)
- No raw `fetch('/api/...')` calls outside of `StreamingDefinition.tsx` — wrap in lib functions

---

## Component rules

- Maximum 200 lines per component file. Split at natural UI boundaries when exceeded.
- Never use `useEffect` for derived data — use `useMemo` or compute inline
- Never call `setState` in a D3 simulation tick handler — this is the single most important performance rule
- `useRef` for all D3 objects (simulation, zoom, node selections) — never React state
- Wrap node and edge arrays in `useMemo` before passing to D3 restarts

---

## Comments

Write no comments except when the **why** is non-obvious: a hidden constraint, a subtle invariant, a workaround for a specific bug, or behaviour that would surprise a future reader.

- Never explain what the code does — well-named identifiers do that
- Never reference the current task, fix, PR number, or caller
- A comment that could be removed without confusing a future reader should be removed

---

## Logging

No `console.log`, `console.warn`, or `console.error` in committed code. Use toast notifications for user-facing errors. Let the browser console stay clean.

---

## Error handling

All errors conform to `AppError`:

```ts
interface AppError {
  code:
    | 'MISSING_CONCEPT'
    | 'CONCEPT_TOO_LONG'
    | 'RATE_LIMITED'
    | 'AI_PARSE_FAILURE'
    | 'AI_NETWORK_FAILURE'
    | 'GRAPH_NO_RING1'
  message: string
  retryable: boolean
}
```

- API routes return `Response.json({ error: string, code: ErrorCode }, { status: N })`
- Client lib functions return `{ data: T } | { error: AppError }` — never throw to callers
- Every AI call is wrapped in try/catch — network failures become `AI_NETWORK_FAILURE` errors
- On parse failure: retry once, then return the typed fallback — never crash the graph
- User-facing errors are shown as toasts via `react-hot-toast` — never as alert() or console

---

## Input validation

Validate at server-side boundaries (route handlers) even when client already validates:

```ts
// Always in route handlers:
if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
  return Response.json({ error: 'Missing concept', code: 'MISSING_CONCEPT' }, { status: 400 })
}
if (concept.length > 100) {
  return Response.json({ error: 'Concept too long', code: 'CONCEPT_TOO_LONG' }, { status: 400 })
}
```

Client-side validation rules:
- Empty concept: no-op, shake the search bar with CSS animation
- Concept > 100 chars: show inline muted text below the input — never submit
- Same concept as current core: no-op, pulse the existing core node

---

## Security

See `.claude/rules/security.md` for full security rules. Key rules for code:

- `ANTHROPIC_API_KEY` is accessed only in server-side route handlers — never in client components
- All AI response text is treated as untrusted content — never rendered as HTML (it renders as text only)
- Never concatenate user input into template strings passed to the AI without trimming and length-checking first

---

## Accessibility minimums

Every interactive element must be keyboard-accessible:

- All graph nodes: `role="button"`, `tabIndex={0}`, `aria-label="[label], ring [N], [category]"`
- Search bar: `aria-label="Enter a concept to explore"`
- Detail panel: `role="complementary"`, `aria-label="Concept detail"`
- Close button (panel): `aria-label="Close detail panel"`
- Icon-only buttons: `aria-label` required — no exceptions
- Loading state: `aria-live="polite"` announcing "Generating concept map"
- Escape key closes the detail panel — no modal or panel can be escape-proof
- No colour-only meaning for state — colour is always accompanied by label or icon

---

## Mobile rules

- Minimum tap target: 44×44px for all interactive elements in the Toolbar
- No hover-only affordances — every interaction that works on hover must also work on click/tap
- D3 drag uses pointer events (not mouse events) to support touch

---

## Performance rules

- D3 simulation tick: update SVG attributes directly via D3 selections — no React state updates
- Dynamic import: `const d3 = await import('d3')` inside `useEffect` in `ConceptGraph.tsx` only
- Node cap: the 40-node limit is enforced by `pruneGraph` — never bypass it
- `useMemo` on node and edge arrays before passing to D3 restart logic
- No `useEffect` that triggers on every render — all dependencies must be intentional and minimal
