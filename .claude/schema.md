# Data Model

This app has no database. This file documents the in-memory type system, state shape,
and data contracts between components, API routes, and lib functions.

---

## Core types (`lib/types.ts`)

### NodeRing
```ts
type NodeRing = 'core' | 'ring1' | 'ring2' | 'ring3'
```
Describes structural position in the graph. Determines D3 force distances, node size, and edge opacity.

### SemanticDistance
```ts
type SemanticDistance = 'direct' | 'adjacent' | 'tangential' | 'distant'
```
Describes how far the concept is semantically from the current core. Used for pruning logic when re-centring: nodes at `'distant'` distance are pruned first.

### Category
```ts
type Category = 'awareness' | 'identity' | 'experiential'
```
Describes the *type* of relationship to the parent concept. Drives node border colour, text colour, and edge colour.
- `awareness` — how we think about / perceive / know the concept → sky blue
- `identity` — how the concept relates to self and being → peach
- `experiential` — how the concept feels or manifests in lived experience → mint

**Why two separate fields:** `semanticDistance` tells you *how far*; `category` tells you *what kind of relationship*. They are orthogonal. A node can be `direct` (close) but `experiential` (felt, not cognitive).

### ConceptNode
```ts
interface ConceptNode {
  id: string                        // unique — the concept word/phrase (lowercase, trimmed)
  label: string                     // display label (1–3 words)
  ring: NodeRing
  semanticDistance: SemanticDistance
  category: Category
  x?: number                        // D3-managed — do not set manually
  y?: number                        // D3-managed — do not set manually
  vx?: number                       // D3-managed velocity
  vy?: number                       // D3-managed velocity
  fx?: number | null                // fixed x (core node only, set to 0)
  fy?: number | null                // fixed y (core node only, set to 0)
  definition?: string               // AI-generated; populated on node selection
  relatedTags?: string[]            // AI-generated; exactly 4 items when populated
  expanded?: boolean                // true once this node has been expanded via AI
  parentId?: string                 // node id of the node that spawned this one
  depth: number                     // 0 = original seed, increments on each re-centre
}
```

**Gotchas:**
- `id` is the concept label lowercased and trimmed — ensures deduplication across re-centres
- `fx`/`fy` are set only on the core node (pinned to 0,0); all other nodes must have `fx: null`
- `definition` and `relatedTags` are populated lazily (only when the node is selected)
- Never set `x`, `y`, `vx`, `vy` directly — D3 mutates these; only D3 should write them

### ConceptEdge
```ts
interface ConceptEdge {
  id: string                        // `${source.id}--${target.id}`
  source: string                    // node id (D3 resolves this to the node object)
  target: string                    // node id
  ring: NodeRing                    // ring of the target node — drives edge opacity
}
```

**Gotcha:** After D3 processes the edges array, `source` and `target` become node object references (not strings). Always use `d.source.id` (not `d.source`) when referencing in non-D3 code.

### GraphState
```ts
interface GraphState {
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  activeNodeId: string | null       // which node is selected (DetailPanel open)
  seedConcept: string               // original search term (drives Toolbar pill)
  isExpanding: boolean              // true while AI expansion is in flight
  expansionNodeId: string | null    // which node is currently being expanded
}
```

### Initial state
```ts
const initialState: GraphState = {
  nodes: [],
  edges: [],
  activeNodeId: null,
  seedConcept: '',
  isExpanding: false,
  expansionNodeId: null,
}
```

---

## AI response shapes

### Expansion response (`/api/expand`)
```ts
interface ExpansionResponse {
  ring1: Array<{
    label: string                   // 1–3 words, lowercase
    category: Category              // 'awareness' | 'identity' | 'experiential'
    reason: string                  // one sentence — why this concept is related
  }>                                // exactly 6 items
  ring2: Array<{
    label: string                   // 1–3 words, lowercase
    parentLabel: string             // must match a ring1 label exactly
    category: Category
  }>                                // exactly 12 items (2 per ring1 concept)
}
```

### Definition response (`/api/define`)
```ts
interface DefinitionResponse {
  definition: string                // 2–3 sentences, max 60 words
  relatedTags: [string, string, string, string]  // exactly 4 items, 1–3 words each
}
```

### Typed fallback (on AI parse failure)
```ts
const EXPANSION_FALLBACK: ExpansionResponse = {
  ring1: [
    { label: 'meaning', category: 'awareness', reason: 'Fundamental to the concept.' },
    { label: 'context', category: 'awareness', reason: 'Shapes how it is understood.' },
    { label: 'feeling', category: 'experiential', reason: 'The lived experience of it.' },
    { label: 'identity', category: 'identity', reason: 'How it relates to self.' },
    { label: 'change', category: 'experiential', reason: 'How it evolves over time.' },
    { label: 'connection', category: 'identity', reason: 'How it relates to others.' },
  ],
  ring2: [
    // 2 per ring1 concept — populated with generic terms
  ],
}

const DEFINITION_FALLBACK: DefinitionResponse = {
  definition: 'An idea worth exploring. Click any connected concept to go deeper.',
  relatedTags: ['meaning', 'context', 'feeling', 'connection'],
}
```

---

## Rate limiter shape

```ts
// Module-level in each route handler — resets per serverless instance
const requestLog = new Map<string, number[]>()
// key: IP address string
// value: array of request timestamps (Unix ms) within the current window
```

Config: 15 requests per 60-second window per IP.

---

## Export shape

The JSON downloaded by the Export button (`bloom-[concept]-[timestamp].json`):

```ts
interface GraphExport {
  seed: string                      // seedConcept
  exportedAt: string                // ISO 8601
  nodes: Array<{
    id: string
    label: string
    ring: NodeRing
    category: Category
    semanticDistance: SemanticDistance
    depth: number
    definition: string | null
  }>
  edges: Array<{
    source: string                  // node id (string, not D3 object reference)
    target: string
    ring: NodeRing
  }>
}
```

**Gotcha:** When exporting, extract `edge.source` as `(edge.source as any).id ?? edge.source` — D3 may have resolved it to an object by the time export is called.

---

## State transition rules

### Core node invariant
- There is always exactly one node with `ring === 'core'` when `nodes.length > 0`
- The core node always has `fx: 0, fy: 0`
- All other nodes have `fx: null`

### Ring assignment on re-centre
When node X is expanded and becomes the new core:
1. X → `ring: 'core'`, `fx: 0`, `fy: 0`
2. Old core → `ring: 'ring2'`, `fx: null`, `fy: null`
3. Old ring1 nodes still connected to X → `ring: 'ring2'`
4. Old ring1 nodes not connected to X → `ring: 'ring3'` (candidates for pruning)
5. New ring1 nodes added from AI expansion
6. New ring2 nodes added from AI expansion
7. Any node with no path to the new core within 3 hops → pruned

### Node cap
After any re-centre + expansion, `pruneGraph` is called to enforce the 40-node cap.
Pruning order (most expendable first):
1. Ring3 nodes with no definition (never selected)
2. Ring3 nodes with a definition
3. Ring2 nodes furthest from the new core
4. Never prune ring1 or core nodes

### SemanticDistance assignment
- Core node: `'direct'`
- Ring1 nodes: `'direct'`
- Ring2 nodes: `'adjacent'`
- Ring3 nodes: `'tangential'` or `'distant'` depending on hop count from core
