# Architecture

## Directory structure

```
bloom/
├── app/
│   ├── page.tsx              # Single page — full-viewport graph + context provider
│   ├── layout.tsx            # Root layout: Inter font, metadata, Toaster
│   ├── globals.css           # CSS variables, @keyframes, Tailwind base
│   └── api/
│       ├── expand/
│       │   └── route.ts      # POST — streaming concept expansion (ring1 + ring2)
│       └── define/
│           └── route.ts      # POST — non-streaming definition + 4 related tags
├── components/
│   ├── graph/
│   │   ├── ConceptGraph.tsx  # D3 simulation owner — wires force physics to React
│   │   ├── GraphCanvas.tsx   # SVG container with D3 zoom/pan behaviour
│   │   ├── GraphNode.tsx     # Individual node: core/ring1/ring2/ring3 visual variants
│   │   └── GraphEdge.tsx     # SVG line between nodes, ring-based opacity
│   ├── ui/
│   │   ├── SearchBar.tsx     # Pill input at top-centre, submits seed concept
│   │   ├── DetailPanel.tsx   # Slide-in panel: definition, tags, expand button
│   │   ├── StreamingDefinition.tsx  # Character-by-character text reveal
│   │   ├── ConceptTags.tsx   # Four clickable related-concept chips
│   │   ├── NodeTooltip.tsx   # Hover tooltip showing ring + category
│   │   ├── ZoomControls.tsx  # +/− and reset zoom buttons (fixed bottom-right)
│   │   ├── Legend.tsx        # Ring colour legend (fixed bottom-left)
│   │   ├── LoadingBloom.tsx  # Animated bloom shown during first expansion
│   │   └── EmptyState.tsx    # Pre-search state with example concept pills
│   └── layout/
│       └── Toolbar.tsx       # Top bar: logo, active concept, node count, actions
├── lib/
│   ├── types.ts              # All shared TypeScript types — source of truth
│   ├── colour.ts             # Node colour by ring and category
│   ├── graph.ts              # Graph mutations: create, add, recentre, prune, export
│   ├── force.ts              # D3 force simulation config
│   ├── context/
│   │   └── GraphContext.tsx  # GraphStateContext, useGraphState, graphReducer
│   └── ai/
│       ├── expand.ts         # buildExpansionPrompt, parseExpansionResponse
│       ├── define.ts         # buildDefinitionPrompt, parseDefinitionResponse
│       └── stream.ts         # streamToClient helper for Anthropic streaming
└── tests/
    ├── setup.ts              # Global test setup: jest-dom, fetch mock
    ├── mocks/
    │   └── anthropic.ts      # Shared Anthropic SDK mock — import in all AI tests
    ├── lib/
    │   ├── graph.test.ts
    │   ├── colour.test.ts
    │   └── ai/
    │       ├── expand.test.ts
    │       └── define.test.ts
    └── components/
        ├── GraphNode.test.tsx
        ├── DetailPanel.test.tsx
        ├── StreamingDefinition.test.tsx
        └── SearchBar.test.tsx
```

---

## Server vs client component rules

This is a Next.js 15 app router project.

**Server components (default — no directive needed):**
- `app/layout.tsx` — font setup and metadata only; no interactivity
- `app/api/*` — route handlers are always server-side

**Client components (require `'use client'` directive):**
- Everything under `components/` — they use D3, React state, event handlers, and browser APIs
- `lib/context/GraphContext.tsx` — uses `createContext` and `useReducer`

**Rule:** Never import a client component into a server component without dynamic import. Never use `useState`, `useEffect`, or `useRef` in a server component.

---

## State management

### GraphStateContext

**Owns:**
- `nodes: ConceptNode[]` — all nodes currently in the graph
- `edges: ConceptEdge[]` — all edges currently in the graph
- `activeNodeId: string | null` — the selected node (drives DetailPanel)
- `seedConcept: string` — the original search term (drives Toolbar pill)
- `isExpanding: boolean` — true while an AI expansion is in flight
- `expansionNodeId: string | null` — which node is being expanded right now

**Does NOT own:**
- D3 simulation instance — lives in a `useRef` inside `ConceptGraph.tsx`
- Node x/y/vx/vy positions — D3 mutates these directly on the node objects
- UI-only state (search input value, panel scroll position) — stays local

### GraphAction union
```ts
type GraphAction =
  | { type: 'EXPAND_CONCEPT'; concept: string; depth: number }
  | { type: 'ADD_EXPANSION_NODES'; nodes: ConceptNode[]; edges: ConceptEdge[] }
  | { type: 'SELECT_NODE'; nodeId: string | null }
  | { type: 'SET_DEFINITION'; nodeId: string; definition: string; relatedTags: string[] }
  | { type: 'RECENTRE'; nodeId: string }
  | { type: 'CLEAR_GRAPH' }
  | { type: 'SET_EXPANDING'; nodeId: string | null }
  | { type: 'ADD_TAG_NODE'; label: string; parentNodeId: string }
```

### Reducer rules
- The reducer is a pure function — no side effects, no async
- All graph mutations (addExpansionNodes, recentreGraph, pruneGraph) are called from the reducer, not from components
- Components dispatch actions; they never manipulate node arrays directly

---

## Data fetching rules

- All AI calls go through Next.js route handlers (`/api/expand`, `/api/define`) — never client-side
- Components never call `fetch` directly; they call lib functions that call `fetch`
- Exception: `StreamingDefinition.tsx` calls `/api/define` directly because it owns the streaming animation lifecycle — documented as an intentional pattern
- There is no database; no ORM queries exist

---

## Key data flows

### Flow 1 — User enters a new concept

1. `SearchBar` captures input, calls `onSubmit(concept)`
2. `page.tsx` dispatches `{ type: 'EXPAND_CONCEPT', concept, depth: 0 }`
3. Reducer creates the core node, sets `isExpanding: true`
4. `ConceptGraph` `useEffect` detects `isExpanding` and fetches `/api/expand`
5. Route handler streams Anthropic response as SSE
6. Client reads stream, accumulates JSON, calls `parseExpansionResponse(text)`
7. Dispatches `{ type: 'ADD_EXPANSION_NODES', nodes, edges }`
8. Reducer calls `addExpansionNodes` → returns updated `nodes` and `edges`
9. `ConceptGraph` `useEffect` detects node array change → restarts D3 simulation
10. D3 tick handler updates SVG element positions directly — no React re-render
11. `LoadingBloom` unmounts once `isExpanding` is false and nodes exist

### Flow 2 — User clicks a node

1. `GraphNode` `onClick` dispatches `{ type: 'SELECT_NODE', nodeId }`
2. `activeNodeId` updates → `DetailPanel` slides in
3. `DetailPanel` renders `StreamingDefinition` with the node's concept and parent
4. `StreamingDefinition` `useEffect` calls `/api/define` with concept + parentConcept
5. Response arrives as a single JSON object; component animates character-by-character
6. On completion, `DetailPanel` shows related tag chips via `ConceptTags`
7. Tag chips dispatch `{ type: 'ADD_TAG_NODE', label, parentNodeId }` when clicked

### Flow 3 — User clicks "Expand this concept"

1. `DetailPanel` calls `onExpand(nodeId)`
2. `page.tsx` dispatches `{ type: 'RECENTRE', nodeId }`
3. Reducer calls `recentreGraph(state, nodeId)` → promotes node to core, demotes old core, prunes >40 nodes
4. Dispatches `{ type: 'EXPAND_CONCEPT', concept: node.label, depth: node.depth + 1 }`
5. D3 simulation restarts with `alpha(0.8)` — graph reshuffles smoothly
6. Zoom animates to fit new core + ring1 in viewport

---

## API route inventory

| Path | Method | Description | Rate limited |
|------|--------|-------------|--------------|
| `/api/expand` | POST | Streams Anthropic response: ring1 (6 nodes) + ring2 (12 nodes) as JSON | Yes — 15/min/IP |
| `/api/define` | POST | Returns definition (≤60 words) + 4 related tags as JSON | Yes — 15/min/IP |

---

## Caching strategy

No caching. This is a session-only app with no database and no repeated queries.

The in-memory rate limiter (`Map<string, number[]>`) is the only persistent per-instance state. In Vercel's serverless environment it resets per cold start and per instance — acceptable for a portfolio app.

---

## Error shape

All errors from API routes and lib functions conform to:

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

API routes return `Response.json({ error: string, code: ErrorCode }, { status: N })`.
Client lib functions return `{ data: T } | { error: AppError }` — never throw.

---

## Performance rules

- **D3 tick rule:** Never call `setState` or `dispatch` in the D3 simulation tick handler. Update SVG attributes directly via D3 selections.
- **Dynamic import:** D3 is always dynamically imported. Verify with `npm run build` — D3 must not appear in the initial bundle.
- **Node cap:** Hard cap of 40 nodes. `pruneGraph` is called in the `RECENTRE` reducer action before adding new nodes. This is non-negotiable.
- **Component splitting:** Any component file over 200 lines must be split. The split point is always at a natural UI boundary, not a random line count.
- **Re-render guard:** `ConceptGraph` wraps node and edge arrays in `useMemo` before passing to D3. D3 simulation restarts only when the node/edge arrays structurally change (node added or removed), not on every render.

---

## Collaboration unlock path

Not applicable — this app is explicitly session-only with no multi-tenancy. If a future version needed persistence:
1. Add a `userId` or `sessionId` field to `GraphState`
2. Add a Supabase (or equivalent) database with a `graphs` table
3. Add auth — the current architecture supports this with minimal changes since all state lives in one context

No migration or schema work has been done towards this; it is explicitly deferred.
