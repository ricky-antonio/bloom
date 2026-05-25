# Phase 1 — Foundation

**Complete this phase entirely before starting Phase 2.**

The goal of Phase 1 is a fully tested core that compiles cleanly and can be verified in isolation.
No UI. No D3 rendering. No browser. Just pure TypeScript with tests.

---

## What to build

- [ ] Run `npx create-next-app@latest` and install all dependencies (see `.claude/setup.md`)
- [ ] Configure `tsconfig.json` with `strict: true`
- [ ] Configure `vitest.config.ts` (see `.claude/rules/testing.md` for full config)
- [ ] Create `tests/setup.ts` and `tests/mocks/anthropic.ts`
- [ ] Add npm scripts: `type-check`, `test`, `test:watch`, `test:coverage`
- [ ] Create `lib/types.ts` — all shared types with two category fields
- [ ] Create `lib/colour.ts` — `getNodeColour`, `getCategoryColours`
- [ ] Write `tests/lib/colour.test.ts` — all tests passing
- [ ] Create `lib/graph.ts` — `createCoreNode`, `addExpansionNodes`, `recentreGraph`, `pruneGraph`, `exportGraph`
- [ ] Write `tests/lib/graph.test.ts` — all tests passing
- [ ] Create `lib/force.ts` — `createSimulation`, `getLinkDistance`, `getChargeStrength`, `getCollisionRadius`
- [ ] Create `lib/ai/expand.ts` — `buildExpansionPrompt`, `parseExpansionResponse`
- [ ] Write `tests/lib/ai/expand.test.ts` — all tests passing
- [ ] Create `lib/ai/define.ts` — `buildDefinitionPrompt`, `parseDefinitionResponse`
- [ ] Write `tests/lib/ai/define.test.ts` — all tests passing
- [ ] Create `app/api/expand/route.ts` — streaming, rate limited, input validated
- [ ] Create `app/api/define/route.ts` — non-streaming, rate limited, input validated
- [ ] Configure `.github/workflows/ci.yml`

---

## Key flows to implement

### lib/types.ts
Define all interfaces exactly as specified in `.claude/schema.md`. The two category fields:
- `semanticDistance: SemanticDistance` (`'direct' | 'adjacent' | 'tangential' | 'distant'`)
- `category: Category` (`'awareness' | 'identity' | 'experiential'`)

The core node has `category: 'awareness'` as a default (it has no semantic relationship type — it *is* the concept). All ring1/ring2 nodes get their category from the AI expansion response.

### lib/graph.ts

**`createCoreNode(concept: string, depth: number): ConceptNode`**
Returns a node with `ring: 'core'`, `fx: 0`, `fy: 0`, `depth`, `semanticDistance: 'direct'`, `category: 'awareness'`.

**`addExpansionNodes(state: GraphState, expansion: ExpansionResponse, parentId: string, depth: number): { nodes: ConceptNode[], edges: ConceptEdge[] }`**
Converts the AI response into typed nodes and edges. Ring1 nodes get `semanticDistance: 'direct'`. Ring2 nodes get `semanticDistance: 'adjacent'`. Deduplicates against existing `state.nodes` (same label → skip).

**`recentreGraph(state: GraphState, nodeId: string): GraphState`**
Promotes the target node to core. Demotes old core to ring2. Reclassifies old ring1 nodes that remain connected to the new core as ring2. Reclassifies disconnected old ring1 nodes as ring3. Calls `pruneGraph` before returning.

**`pruneGraph(nodes: ConceptNode[], edges: ConceptEdge[]): { nodes: ConceptNode[], edges: ConceptEdge[] }`**
Enforces the 40-node cap. Pruning order: ring3 without definition first, then ring3 with definition, then ring2 furthest from core. Never prunes core or ring1. Also removes orphaned edges.

**`exportGraph(state: GraphState): string`**
Returns JSON string. Handles D3-resolved edge source/target (may be objects, not strings — extract `.id` safely).

### app/api/expand/route.ts

```
POST body:  { concept: string, depth?: number }
Response:   text/event-stream (Anthropic SSE)
Rate limit: 15/min/IP
Validation: concept required, string, non-empty, max 100 chars
```

On success: stream the Anthropic response directly via `stream.toReadableStream()`.

### app/api/define/route.ts

```
POST body:  { concept: string, parentConcept: string }
Response:   application/json — { definition: string, relatedTags: string[] }
Rate limit: 15/min/IP
Validation: both concept and parentConcept required, string, non-empty
```

On success: call `client.messages.create(...)` (non-streaming), parse the response, return the `DefinitionResponse`.

---

## Tests to write

### `tests/lib/colour.test.ts`

```ts
it('returns sky border and text for awareness category at ring1')
it('returns peach border and text for identity category at ring1')
it('returns mint border and text for experiential category at ring1')
it('returns muted colours for ring2 regardless of category')
it('returns barely-visible colours for ring3 regardless of category')
it('returns sky-200 border for core node')
it('returns the correct ring2 border at 40% opacity for each category')
```

### `tests/lib/graph.test.ts`

```ts
it('createCoreNode returns node with ring core and fx=0 fy=0')
it('createCoreNode sets depth correctly')
it('addExpansionNodes adds 6 ring1 and 12 ring2 nodes')
it('addExpansionNodes assigns correct semanticDistance to ring1 nodes')
it('addExpansionNodes assigns correct semanticDistance to ring2 nodes')
it('addExpansionNodes deduplicates nodes with same label as existing nodes')
it('addExpansionNodes creates edges connecting ring1 to core and ring2 to ring1')
it('recentreGraph promotes target node to core with fx=0 fy=0')
it('recentreGraph demotes old core to ring2 and releases its fixed position')
it('recentreGraph reclassifies connected old ring1 nodes as ring2')
it('recentreGraph reclassifies disconnected old ring1 nodes as ring3')
it('pruneGraph never returns more than 40 nodes')
it('pruneGraph never prunes core nodes')
it('pruneGraph never prunes ring1 nodes')
it('pruneGraph prunes ring3 nodes without definition before those with definition')
it('pruneGraph removes orphaned edges after node pruning')
it('exportGraph returns valid JSON')
it('exportGraph includes seed and exportedAt fields')
it('exportGraph safely extracts edge source and target as strings')
```

### `tests/lib/ai/expand.test.ts`

```ts
it('buildExpansionPrompt includes the concept name in the prompt string')
it('buildExpansionPrompt includes depth hint for seed (depth 0)')
it('buildExpansionPrompt includes depth hint for non-seed depth')
it('parseExpansionResponse returns correctly shaped ring1 array with 6 items')
it('parseExpansionResponse returns correctly shaped ring2 array with 12 items')
it('parseExpansionResponse handles JSON wrapped in markdown code fences')
it('parseExpansionResponse returns typed fallback after two parse failures')
it('parseExpansionResponse retries once before returning fallback')
it('parseExpansionResponse maps category strings to Category type correctly')
```

### `tests/lib/ai/define.test.ts`

```ts
it('buildDefinitionPrompt includes concept name')
it('buildDefinitionPrompt includes parentConcept name')
it('parseDefinitionResponse returns definition string')
it('parseDefinitionResponse returns exactly 4 relatedTags')
it('parseDefinitionResponse handles JSON wrapped in markdown code fences')
it('parseDefinitionResponse returns fallback on malformed JSON')
```

---

## Manual verification checklist

Before marking Phase 1 complete, verify manually:

- [ ] `npm run type-check` outputs zero errors
- [ ] `npm test` passes all tests with zero failures
- [ ] `npm run test:coverage` reports ≥ 75% lines, ≥ 75% functions, ≥ 70% branches
- [ ] `npm run build` succeeds
- [ ] Anthropic API key verification: run the curl command from `.claude/setup.md` section 10
- [ ] `grep -r "sk-ant-" .next/static/` outputs nothing
- [ ] CI workflow file is committed and GitHub Actions runs green on push

---

## Coverage target after this phase
Lines ≥ 75% · Functions ≥ 75% · Branches ≥ 70%
