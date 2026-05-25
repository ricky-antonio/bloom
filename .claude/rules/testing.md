# Testing Rules

Non-negotiable. Every rule applies in every session.

---

## Philosophy

Three layers:

1. **Unit** — pure lib functions (`lib/graph.ts`, `lib/colour.ts`, `lib/ai/*.ts`). No React. No DOM. Fast.
2. **Component** — what the user sees and interacts with. React Testing Library. Test behaviour, not markup.
3. **Integration** — full API route with mocked external services (Anthropic SDK). Never call the real API.

---

## Non-negotiable rules

1. Write tests for a module **before moving to the next** — same session, not "I'll add tests later"
2. Never mock the module under test — only mock its dependencies
3. Test **behaviour**, not implementation — renaming a function must not break tests
4. A failing test is **never** fixed by deleting it or marking it `.skip`
5. Use fake timers (`vi.useFakeTimers()`) for anything time-dependent — never real `setTimeout` in tests
6. Run the test suite **after writing each test file** — fix all failures before creating the next file
7. Never create inline `vi.mock('@anthropic-ai/sdk', ...)` inside test files — always import from `tests/mocks/anthropic.ts`
8. Tests are part of the definition of done — never skipped for speed or "I'll do it later"

---

## Authoring order

Every time, without exception:

```
types → lib function → lib test → component → component test
```

Do not start `lib/ai/expand.ts` until `lib/types.ts` is written and correct.
Do not start `GraphNode.tsx` until `lib/colour.ts` and `lib/graph.ts` tests pass.
Do not start `DetailPanel.tsx` until `StreamingDefinition.tsx` tests pass.

---

## Full Vitest config

`vitest.config.ts` in the project root:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
      },
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        '*.config.*',
        'app/layout.tsx',    // boilerplate
        'app/page.tsx',      // wiring only, tested via components
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

---

## Full test setup file

`tests/setup.ts`:

```ts
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
```

---

## Shared mock files

### `tests/mocks/anthropic.ts`

```ts
import { vi } from 'vitest'

export const mockStreamToReadableStream = vi.fn()
export const mockMessagesStream = vi.fn()
export const mockMessagesCreate = vi.fn()

export const mockAnthropicInstance = {
  messages: {
    stream: mockMessagesStream,
    create: mockMessagesCreate,
  },
}

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => mockAnthropicInstance),
}))
```

Import in API route tests with:
```ts
import '../../tests/mocks/anthropic'
import { mockMessagesStream, mockMessagesCreate } from '../../tests/mocks/anthropic'
```

---

## Per-category requirements

### AI / LLM route tests (`/api/expand`, `/api/define`)
- Mock via `tests/mocks/anthropic.ts` — never call the real Anthropic API
- Cover these cases for each route:
  - ✓ 200: valid concept, returns correct shape
  - ✓ 400: missing concept (`MISSING_CONCEPT`)
  - ✓ 400: concept > 100 chars (`CONCEPT_TOO_LONG`)
  - ✓ 429: rate limit exceeded (`RATE_LIMITED`)
  - ✓ 500: Anthropic SDK throws — graceful error response
- For `/api/expand`: verify the streamed response contains a parseable `ExpansionResponse`
- For `/api/define`: verify the response body matches `DefinitionResponse`

### AI parser tests (`lib/ai/expand.ts`, `lib/ai/define.ts`)
- `buildExpansionPrompt` includes the concept name literally
- `parseExpansionResponse` returns correctly typed ring1 and ring2 arrays
- Handles JSON wrapped in markdown fences (` ```json ... ``` `)
- Returns the typed fallback on first parse failure after one retry
- `buildDefinitionPrompt` includes both concept and parentConcept
- `parseDefinitionResponse` returns definition string and exactly 4 relatedTags

### Graph lib tests (`lib/graph.ts`)
- `createCoreNode` returns the correct shape (ring: 'core', depth: 0, fx: 0, fy: 0)
- `addExpansionNodes` assigns correct ring and semanticDistance values
- `recentreGraph` promotes clicked node to core, demotes old core to ring2
- `recentreGraph` fixes new core at (0, 0) and releases old core's fixed position
- `pruneGraph` never returns more than 40 nodes
- `pruneGraph` never prunes the core or ring1 nodes
- `exportGraph` returns valid JSON with correct shape
- `exportGraph` handles D3-resolved edge source/target (object references, not strings)

### Colour lib tests (`lib/colour.ts`)
- `getNodeColour` returns correct border and text colour for each ring × category combination
- `getNodeColour` returns correct values for core node (no category)
- Ring3 nodes always return the muted `#C8D8E4` text colour regardless of category

### Component tests — behaviours only
- Never test CSS class names or inline styles — test visible text, aria attributes, and callbacks
- Never test D3 simulation internals — test that the graph renders the correct number of nodes

### `GraphNode.test.tsx`
- Renders core node label and "origin" sub-label
- Renders ring1 node with correct aria-label including ring and category
- Calls `onSelect` callback when clicked
- Calls `onSelect` when Enter is pressed (keyboard accessibility)
- Does not call `onSelect` when node is already selected

### `SearchBar.test.tsx`
- Submits on Enter key
- Calls `onSubmit` with trimmed concept value
- Clears input after submit
- Does not submit empty string (shows shake — verify via aria or text, not CSS)
- Does not submit concept longer than 100 characters

### `DetailPanel.test.tsx`
- Renders concept name
- Renders "NEWLY SELECTED" label above concept name (see bloom-preview.png — no ring badge pill)
- Renders ConceptTag chips for each item in node.relatedTags
- "Expand this concept" button calls `onExpand` callback
- Closes when Escape key is pressed (dispatches `onClose`)
- Does not render when `node` prop is null

### `StreamingDefinition.test.tsx`
- Shows cursor element (`|`) while streaming
- Removes cursor element when streaming is complete
- Calls fetch with correct concept and parentConcept in request body
- Cancels the fetch request when component unmounts (AbortController)
- Uses fake timers — `vi.useFakeTimers()` in beforeEach

---

## Coverage thresholds per phase

| Phase | Lines | Functions | Branches |
|-------|-------|-----------|----------|
| Phase 1 — Foundation | ≥ 75% | ≥ 75% | ≥ 70% |
| Phase 2 — Graph Engine | ≥ 75% | ≥ 75% | ≥ 70% |
| Phase 3 — UI & Interaction | ≥ 78% | ≥ 78% | ≥ 73% |
| Phase 4 — Polish & Ship | ≥ 85% | ≥ 85% | ≥ 80% |

---

## npm scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit"
  }
}
```

---

## End-of-session checklist

Run before ending any session. All four must pass:

```bash
npm run type-check     # zero TypeScript errors
npm test               # all tests pass
npm run test:coverage  # above current phase threshold
npm run build          # production build succeeds
```

Do not commit unless all four pass. Do not mark a phase complete unless the manual verification checklist in the phase file is also done.
