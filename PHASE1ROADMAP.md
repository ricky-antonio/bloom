# Phase 1 Roadmap — Foundation

All prompts are self-contained. Paste one prompt per session. Clear context between sessions.
Update PROGRESS.md at the end of every session before closing.

---

## Status

```
P1.1  Project setup                    ← start here
P1.2  Types + colour lib
P1.3  Graph lib
P1.4  AI lib + force config
P1.5  API routes
P1.6  Phase 1 final checklist
```

---

## PROMPT P1.1 — Project setup

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

We are setting up the Bloom project from scratch. Nothing has been installed yet.
This prompt covers the scaffolding only — no application code.

WHAT WE ARE BUILDING:
The initial project skeleton: the Next.js app created, all dependencies installed,
TypeScript configured strictly, Vitest configured with coverage, the test setup and mock
files created, npm scripts added, and the CI workflow in place. By the end of this
session the project should compile, the test runner should find zero test files
(that is correct at this point), and the build should succeed.

STEP 1 — Create the Next.js app
Run exactly:
  npx create-next-app@latest bloom --typescript --tailwind --app --no-src-dir
When prompted: TypeScript yes, ESLint yes, Tailwind yes, src/ no, App Router yes,
Turbopack yes, import alias yes (@/*).

STEP 2 — Install dependencies
  npm install d3 @anthropic-ai/sdk @tabler/icons-react react-hot-toast
  npm install -D @types/d3 vitest @vitest/coverage-v8 @vitejs/plugin-react \
    @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom

STEP 3 — Verify tsconfig.json has strict: true
Open tsconfig.json and confirm "strict": true is present under compilerOptions.

STEP 4 — Create vitest.config.ts in the project root
Use the full config from .claude/rules/testing.md (the "Full Vitest config" section).
It must include: jsdom environment, setupFiles pointing to tests/setup.ts, globals true,
coverage with v8 provider, thresholds at 75/75/70, and the @/* alias.

STEP 5 — Create tests/setup.ts
Use the full setup file from .claude/rules/testing.md (the "Full test setup file" section).
It must: import @testing-library/jest-dom, mock global.fetch, call vi.clearAllMocks()
in afterEach, and silence React act() warnings.

STEP 6 — Create tests/mocks/anthropic.ts
Use the shared mock file from .claude/rules/testing.md (the "Shared mock files" section).
It must export mockMessagesStream, mockMessagesCreate, and mockAnthropicInstance, and
call vi.mock('@anthropic-ai/sdk', ...) at module level.

STEP 7 — Add npm scripts to package.json
Add: type-check ("tsc --noEmit"), test ("vitest run"), test:watch ("vitest"),
test:coverage ("vitest run --coverage").

STEP 8 — Create .github/workflows/ci.yml
Steps: checkout, setup-node 20 with npm cache, npm ci, npm run type-check, npm test,
npm run build. The build step needs ANTHROPIC_API_KEY from GitHub secrets.

STEP 9 — Create the directory structure (empty files are fine for now)
Create these directories (not files): lib/ai/, tests/lib/ai/, tests/components/,
tests/mocks/, components/graph/, components/ui/, components/layout/

VERIFY before finishing:
  npm run type-check   — must be zero errors
  npm test             — must output "No test files found" (correct — no tests yet)
  npm run build        — must succeed

Update PROGRESS.md: mark P1.1 complete, next = P1.2.
```

---

## PROMPT P1.2 — Types + colour lib

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

WHAT WE ARE BUILDING:
The two foundational lib files: the shared TypeScript type definitions (every interface
the rest of the codebase will depend on), and the colour system (every node colour
determined by ring and category). Both are pure TypeScript with no dependencies on React
or D3. We write the colour tests first so the types are locked before anything else builds
on them.

IMPORTANT — Two category fields:
ConceptNode has TWO separate fields for categorisation:
  semanticDistance: 'direct' | 'adjacent' | 'tangential' | 'distant'
    → Used for ring assignment and pruning logic (how far from core)
  category: 'awareness' | 'identity' | 'experiential'
    → Used for colour coding (what type of relationship)
See .claude/schema.md for the full ConceptNode interface.

FILE 1 — lib/types.ts
Define all types from .claude/schema.md exactly:
  - NodeRing = 'core' | 'ring1' | 'ring2' | 'ring3'
  - SemanticDistance = 'direct' | 'adjacent' | 'tangential' | 'distant'
  - Category = 'awareness' | 'identity' | 'experiential'
  - ConceptNode interface (with both semanticDistance AND category fields)
  - ConceptEdge interface
  - GraphState interface
  - GraphAction union type (all 8 action types from .claude/architecture.md)
  - ExpansionResponse interface
  - DefinitionResponse interface
  - AppError interface (with the 6 error codes from .claude/architecture.md)
  - EXPANSION_FALLBACK and DEFINITION_FALLBACK constants

FILE 2 — lib/colour.ts
Export these functions:

  getNodeColour(ring: NodeRing, category: Category): {
    border: string       // CSS colour string
    text: string         // CSS colour string
    background: string   // CSS colour string
  }

  Rules per ring:
  - core: border #BADDFF (sky-200), text #496580 (slate-500), bg #FFFFFF
  - ring1 awareness: border #BADDFF, text #5A8AAA, bg #FFFFFF
  - ring1 identity: border #FFDBBB, text #C07040, bg #FFFFFF
  - ring1 experiential: border #BAFFF5, text #40A090, bg #FFFFFF
  - ring2: borders at 40% opacity of parent category colour, text muted
    (#AACCDC for awareness, #E0A880 for identity, #80C8B8 for experiential)
    bg rgba(255,255,255,0.6)
  - ring3: border rgba(73,101,128,0.1), text #C8D8E4, bg rgba(255,255,255,0.3)

Export also: CATEGORY_COLOURS constant mapping each category to its border/text hex values.

FILE 3 — tests/lib/colour.test.ts
Write all 7 tests from .claude/phases/1-foundation.md "Tests to write" section:
  it('returns sky border and text for awareness category at ring1')
  it('returns peach border and text for identity category at ring1')
  it('returns mint border and text for experiential category at ring1')
  it('returns muted colours for ring2 regardless of category')
  it('returns barely-visible colours for ring3 regardless of category')
  it('returns sky-200 border for core node')
  it('returns the correct ring2 border at 40% opacity for each category')

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all colour tests pass

Update PROGRESS.md: mark P1.2 complete, next = P1.3.
```

---

## PROMPT P1.3 — Graph lib

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

WHAT WE ARE BUILDING:
The graph manipulation library — the five pure functions that handle everything the
graph needs to do: create nodes, add expansion results, re-centre on a new node, prune
to the 40-node cap, and export to JSON. These functions are called by the reducer in
Phase 2. All are pure (no side effects, no async). We write the tests alongside each
function.

FILE 1 — lib/graph.ts
Implement these five exported functions:

createCoreNode(concept: string, depth: number): ConceptNode
  - ring: 'core', semanticDistance: 'direct', category: 'awareness'
  - id: concept.toLowerCase().trim()
  - label: concept.trim()
  - fx: 0, fy: 0 (pinned to canvas centre)
  - depth: as passed
  - expanded: false

addExpansionNodes(
  state: GraphState,
  expansion: ExpansionResponse,
  parentId: string,
  depth: number
): { nodes: ConceptNode[], edges: ConceptEdge[] }
  - Converts ring1 items to ConceptNodes with ring: 'ring1', semanticDistance: 'direct'
  - Converts ring2 items to ConceptNodes with ring: 'ring2', semanticDistance: 'adjacent'
  - Deduplicates: skip any node whose id already exists in state.nodes
  - Creates edges: ring1 → core, ring2 → their ring1 parent
  - Edge ids: "${source.id}--${target.id}"
  - Returns the FULL updated arrays (state.nodes + new + state.edges + new)

recentreGraph(state: GraphState, nodeId: string): GraphState
  - Finds the target node, promotes it: ring → 'core', fx → 0, fy → 0
  - Old core: ring → 'ring2', fx → null, fy → null
  - Old ring1 nodes connected to new core (via edges): ring → 'ring2'
  - Old ring1 nodes NOT connected to new core: ring → 'ring3'
  - Old ring2 nodes become ring3
  - Calls pruneGraph before returning
  - Sets activeNodeId: null

pruneGraph(nodes: ConceptNode[], edges: ConceptEdge[]): { nodes: ConceptNode[], edges: ConceptEdge[] }
  - If nodes.length <= 40, return unchanged
  - Pruning order (most expendable first):
    1. ring3 nodes where expanded !== true and definition === undefined
    2. ring3 nodes with definition
    3. ring2 nodes (prefer those with higher depth — furthest from new core)
  - Never prune ring1 or core nodes
  - After pruning nodes, remove edges where source or target no longer exists

exportGraph(state: GraphState): string
  - Returns JSON.stringify(..., null, 2)
  - Shape: { seed, exportedAt (ISO string), nodes (mapped), edges (mapped) }
  - For edges: source and target may be D3-resolved objects — safely extract:
    const src = typeof e.source === 'string' ? e.source : (e.source as any).id
  - Include semanticDistance in the exported node shape

FILE 2 — tests/lib/graph.test.ts
Write all 18 tests from .claude/phases/1-foundation.md "Tests to write" section.
Key implementation notes for the tests:
  - Build test fixtures using createCoreNode and small ExpansionResponse objects
  - For pruneGraph tests: build a state with >40 nodes manually
  - For recentreGraph: set up a state with a core, 6 ring1, and edges between them
  - For exportGraph D3 test: set edge.source to an object { id: 'foo' } to simulate D3 resolution

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass (colour + graph)

Update PROGRESS.md: mark P1.3 complete, next = P1.4.
```

---

## PROMPT P1.4 — AI lib + force config

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

WHAT WE ARE BUILDING:
Four files. The D3 force simulation configuration (pure config, no rendering). The two AI
helper modules: the expansion prompt builder and response parser, and the definition
prompt builder and response parser. All four are pure TypeScript. The AI parsers include
retry logic and typed fallbacks — they must never crash even on malformed AI responses.

FILE 1 — lib/force.ts
Export these four functions (no D3 import at module level — callers will inject d3):

  getLinkDistance(ring: NodeRing): number
    Returns: { core: 0, ring1: 110, ring2: 190, ring3: 270 }[ring]

  getChargeStrength(ring: NodeRing): number
    Returns: { core: -400, ring1: -200, ring2: -120, ring3: -80 }[ring]

  getCollisionRadius(ring: NodeRing): number
    Returns: { core: 52, ring1: 40, ring2: 30, ring3: 24 }[ring]

  createSimulation(d3: any, nodes: ConceptNode[], edges: ConceptEdge[]): any
    Builds and returns a d3.forceSimulation with:
      - forceLink: id by d.id, distance via getLinkDistance(d.ring), strength 0.4
      - forceManyBody: strength via getChargeStrength(d.ring)
      - forceCenter: (0, 0)
      - forceCollide: radius via getCollisionRadius(d.ring)
      - alphaDecay: 0.02, velocityDecay: 0.4
    Note: d3 is injected as a parameter (any type) because it will be dynamically imported
    by the caller. Mark the parameter with // d3 internal.

FILE 2 — lib/ai/expand.ts
Export:

  buildExpansionPrompt(concept: string, depth: number): string
    Returns the full prompt string from .claude/schema.md "Expansion response" section.
    Include the depth hint conditional: depth 0 → "this is the seed — choose broadly",
    depth > 0 → "the user has explored N levels — go deeper and more specific".

  parseExpansionResponse(text: string): ExpansionResponse
    1. Strip markdown fences: text.replace(/```json|```/g, '').trim()
    2. Try JSON.parse — if it fails, retry once (call self recursively with cleaned text)
    3. Validate the parsed result has ring1 (array, 6 items) and ring2 (array, 12 items)
    4. If validation fails on second attempt, return EXPANSION_FALLBACK from lib/types.ts
    5. Map category strings to Category type — invalid strings default to 'awareness'

FILE 3 — tests/lib/ai/expand.test.ts
Write all 9 tests from .claude/phases/1-foundation.md "Tests to write" section.
Do not import from tests/mocks/anthropic.ts here — these tests are pure functions,
no Anthropic SDK is needed.

FILE 4 — lib/ai/define.ts
Export:

  buildDefinitionPrompt(concept: string, parentConcept: string): string
    Returns the full prompt string from .claude/schema.md "Definition response" section.

  parseDefinitionResponse(text: string): DefinitionResponse
    Same strip + parse + retry pattern as parseExpansionResponse.
    Validates: definition is a string, relatedTags is an array of exactly 4 items.
    On failure: return DEFINITION_FALLBACK from lib/types.ts.

FILE 5 — tests/lib/ai/define.test.ts
Write all 6 tests from .claude/phases/1-foundation.md "Tests to write" section.

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass (colour + graph + expand + define)

Update PROGRESS.md: mark P1.4 complete, next = P1.5.
```

---

## PROMPT P1.5 — API routes

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

WHAT WE ARE BUILDING:
The two Next.js API route handlers. These are the only server-side files that touch the
Anthropic API key. Both routes are rate-limited, input-validated, and handle errors
gracefully. The expand route streams its response; the define route returns JSON.
No tests required for these routes in Phase 1 (they require the Anthropic SDK mock and
will be integration-tested in Phase 2 if desired). Manual verification is sufficient here.

IMPORTANT — Rate limiting:
Both routes use the same in-memory pattern. The requestLog Map is module-level (one per
serverless instance). In Vercel's serverless environment this resets per cold start — that
is acceptable for a portfolio app. Pattern is in .claude/rules/security.md.

FILE 1 — app/api/expand/route.ts
'use server' is implicit (it is a route handler, not a component).

The route must:
1. Read the IP from x-forwarded-for or x-real-ip headers (fall back to 'unknown')
2. Call isRateLimited(ip) — return 429 with code RATE_LIMITED if limited
3. Parse the body: { concept: string, depth?: number }
4. Validate: concept required, non-empty string, max 100 chars — return 400 on failure
5. Create a new Anthropic() client
6. Call client.messages.stream({ model: 'claude-sonnet-4-20250514', max_tokens: 800,
   messages: [{ role: 'user', content: buildExpansionPrompt(concept, depth ?? 0) }] })
7. Return: new Response(stream.toReadableStream(), { headers: { 'Content-Type': 'text/event-stream' } })
8. Wrap the entire Anthropic call in try/catch — return 500 with code AI_NETWORK_FAILURE on error

The isRateLimited function is defined in the same file (module-level Map + the function
from .claude/rules/security.md).

FILE 2 — app/api/define/route.ts
Same rate limiting and validation as expand, with these differences:
- Body: { concept: string, parentConcept: string }
- Both concept AND parentConcept must be validated (non-empty strings)
- Uses client.messages.create (non-streaming, not client.messages.stream)
- max_tokens: 300
- After receiving the response, extract the text content:
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
- Call parseDefinitionResponse(text) to get the typed result
- Return Response.json(result) — if parse returns the fallback that is fine, still 200
- Wrap in try/catch — return 500 on Anthropic error

MANUAL VERIFICATION (no automated tests for routes in this phase):
With the dev server running (npm run dev):

Test 1 — Valid expand request:
  curl -X POST http://localhost:3000/api/expand \
    -H "Content-Type: application/json" \
    -d '{"concept":"ocean","depth":0}'
  Expected: streaming SSE output (JSON chunks appearing)

Test 2 — Empty concept:
  curl -X POST http://localhost:3000/api/expand \
    -H "Content-Type: application/json" \
    -d '{"concept":""}'
  Expected: {"error":"Missing concept","code":"MISSING_CONCEPT"} with status 400

Test 3 — Concept too long:
  curl -X POST http://localhost:3000/api/expand \
    -H "Content-Type: application/json" \
    -d '{"concept":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'
  Expected: {"error":"Concept too long","code":"CONCEPT_TOO_LONG"} with status 400

Test 4 — Valid define request:
  curl -X POST http://localhost:3000/api/define \
    -H "Content-Type: application/json" \
    -d '{"concept":"tide","parentConcept":"ocean"}'
  Expected: {"definition":"...","relatedTags":["...","...","...","..."]}

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests still pass (no regressions)
  npm run build        — build succeeds

Update PROGRESS.md: mark P1.5 complete, next = P1.6.
```

---

## PROMPT P1.6 — Phase 1 final checklist

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/1-foundation.md, and PROGRESS.md
in that order. Confirm: current phase, last completed task, next task. Do not write any
code until you have confirmed all four.

This is the final checklist for Phase 1. No new code is written in this session.
Work through each item below. Fix any failures before marking the phase complete.

AUTOMATED CHECKS — run these in order, fix failures before proceeding:
  npm run type-check
    Expected: zero errors. If there are errors, fix them now.

  npm test
    Expected: all tests pass. If any fail, fix them now — do NOT skip or delete failing tests.

  npm run test:coverage
    Expected: lines ≥ 75%, functions ≥ 75%, branches ≥ 70%.
    If below threshold: look at the coverage report, identify which lib functions
    are under-tested, add missing tests to the appropriate test file.

  npm run build
    Expected: production build succeeds. If it fails, fix TypeScript errors or
    missing imports before proceeding.

MANUAL VERIFICATION:
  1. Anthropic API key check:
       curl https://api.anthropic.com/v1/messages \
         -H "x-api-key: $ANTHROPIC_API_KEY" \
         -H "anthropic-version: 2023-06-01" \
         -H "content-type: application/json" \
         -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
       Expected: JSON response with "type":"message" — not an authentication error.

  2. Key leak check:
       grep -r "sk-ant-" .next/static/ 2>/dev/null && echo "LEAK DETECTED" || echo "Clean"
       Expected: "Clean". If "LEAK DETECTED", stop — the API key has leaked into the
       client bundle. Find and fix the import that caused it before continuing.

  3. CI check:
       Confirm .github/workflows/ci.yml exists and is committed.
       If the repo is on GitHub, confirm the Actions tab shows a green run.

FILE AUDIT — confirm all these files exist and are non-empty:
  lib/types.ts
  lib/colour.ts
  lib/graph.ts
  lib/force.ts
  lib/ai/expand.ts
  lib/ai/define.ts
  app/api/expand/route.ts
  app/api/define/route.ts
  tests/setup.ts
  tests/mocks/anthropic.ts
  tests/lib/colour.test.ts
  tests/lib/graph.test.ts
  tests/lib/ai/expand.test.ts
  tests/lib/ai/define.test.ts
  vitest.config.ts
  .github/workflows/ci.yml

If any file is missing, create it before marking this phase complete.

Update PROGRESS.md: mark P1.6 complete, Phase 1 complete.
Update CHANGELOG.md: add entry "[DATE] — Phase 1 — Foundation complete: all lib functions
tested, API routes built and manually verified."
Phase 1 is done. Next: PHASE2ROADMAP.md → P2.1.
```
