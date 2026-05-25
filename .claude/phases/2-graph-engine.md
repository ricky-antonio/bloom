# Phase 2 — Graph Engine

**Complete Phase 1 entirely before starting this phase.**

The goal of Phase 2 is a working D3 force graph that responds to the AI API. By the end, entering a concept in the search bar should produce a visible, interactive force-directed graph with nodes expanding and re-centring correctly. The detail panel is not built yet — that is Phase 3.

---

## What to build

- [ ] Create `lib/context/GraphContext.tsx` — `GraphStateContext`, `graphReducer`, `GraphAction` union, `useGraphState` hook
- [ ] Create `components/graph/GraphCanvas.tsx` — SVG container with D3 zoom/pan behaviour
- [ ] Create `components/graph/GraphEdge.tsx` — SVG line elements with ring-based opacity
- [ ] Create `components/graph/GraphNode.tsx` — all four ring variants with correct sizing, colours, hover/selected/expanding states
- [ ] Write `tests/components/GraphNode.test.tsx` — all tests passing
- [ ] Create `components/graph/ConceptGraph.tsx` — D3 simulation owner; wires force physics to React; handles re-centring
- [ ] Create `components/ui/SearchBar.tsx` — pill input that triggers concept expansion
- [ ] Write `tests/components/SearchBar.test.tsx` — all tests passing
- [ ] Wire everything in `app/page.tsx` — GraphContext provider, ConceptGraph, SearchBar, and a minimal Toolbar placeholder

---

## Key flows to implement

### GraphContext (`lib/context/GraphContext.tsx`)

The `graphReducer` handles these actions by calling lib functions (never mutating state inline):

```ts
case 'EXPAND_CONCEPT':
  // Creates core node if graph is empty, sets isExpanding: true, sets expansionNodeId
  return { ...state, isExpanding: true, expansionNodeId: action.nodeId ?? null, seedConcept: action.concept }

case 'ADD_EXPANSION_NODES':
  // Calls addExpansionNodes(state, action.expansion, action.parentId, action.depth)
  // Sets isExpanding: false, expansionNodeId: null
  return { ...state, nodes: newNodes, edges: newEdges, isExpanding: false, expansionNodeId: null }

case 'SELECT_NODE':
  return { ...state, activeNodeId: action.nodeId }

case 'RECENTRE':
  // Calls recentreGraph(state, action.nodeId)
  return recentreGraph(state, action.nodeId)

case 'CLEAR_GRAPH':
  return { ...initialState }

case 'SET_EXPANDING':
  return { ...state, isExpanding: !!action.nodeId, expansionNodeId: action.nodeId }

case 'ADD_TAG_NODE':
  // Adds a single ring1-equivalent node connected to parentNodeId
  return { ...state, nodes: [...state.nodes, newNode], edges: [...state.edges, newEdge] }
```

### ConceptGraph (`components/graph/ConceptGraph.tsx`)

This is the most complex component. Key implementation notes:

1. **D3 lives in refs, never state:**
   ```ts
   const simulationRef = useRef<d3.Simulation<ConceptNode, ConceptEdge> | null>(null)
   const nodeElementsRef = useRef<d3.Selection<...> | null>(null)
   const edgeElementsRef = useRef<d3.Selection<...> | null>(null)
   ```

2. **Dynamic import:**
   ```ts
   useEffect(() => {
     import('d3').then(d3 => {
       // All D3 initialisation here
     })
   }, []) // Only runs once on mount
   ```

3. **Tick handler updates DOM directly:**
   ```ts
   simulation.on('tick', () => {
     nodeElementsRef.current
       ?.attr('transform', (d: ConceptNode) => `translate(${d.x ?? 0},${d.y ?? 0})`)
     edgeElementsRef.current
       ?.attr('x1', (d: any) => d.source.x ?? 0)
       .attr('y1', (d: any) => d.source.y ?? 0)
       .attr('x2', (d: any) => d.target.x ?? 0)
       .attr('y2', (d: any) => d.target.y ?? 0)
   })
   ```

4. **React re-renders only on structural change:**
   A second `useEffect` watches `nodes.length` and `edges.length` (not the full arrays). When structure changes, restart the simulation:
   ```ts
   useEffect(() => {
     if (!simulationRef.current) return
     simulationRef.current.nodes(nodes)
     simulationRef.current.force<d3.ForceLink<...>>('link')?.links(edges)
     simulationRef.current.alpha(0.8).restart()
   }, [nodes.length, edges.length])
   ```

5. **Expansion trigger:**
   A `useEffect` watches `isExpanding` and `expansionNodeId`. When `isExpanding` becomes true, call the API:
   ```ts
   useEffect(() => {
     if (!isExpanding || !expansionNodeId) return
     const node = nodes.find(n => n.id === expansionNodeId)
     if (!node) return
     // fetch /api/expand, stream response, parse, dispatch ADD_EXPANSION_NODES
   }, [isExpanding, expansionNodeId])
   ```

6. **NaN guard in tick handler:**
   ```ts
   simulation.on('tick', () => {
     nodes.forEach(node => {
       if (isNaN(node.x ?? 0)) { node.x = 0; node.vx = 0 }
       if (isNaN(node.y ?? 0)) { node.y = 0; node.vy = 0 }
     })
     // ... update DOM
   })
   ```

### GraphNode (`components/graph/GraphNode.tsx`)

Rendered as a `<g>` SVG group. Each node is positioned by D3 via `transform`. The React component renders:
- A `<circle>` with ring-appropriate size and colour
- A `<text>` for the label (centred)
- A `<text>` for the sub-label (below circle)
- Event handlers: `onClick`, `onMouseEnter`, `onMouseLeave`, `onKeyDown` (Enter → click)

The visual variant (size, colours, border) is determined by calling `getNodeColour(node.ring, node.category)`.

Expanding state: add a `<circle>` with `stroke-dasharray` that animates a rotation around the node.

### Zoom and fit

`GraphCanvas.tsx` attaches D3 zoom to the SVG:
```ts
const zoom = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 2.5])
  .on('zoom', event => {
    innerGroupRef.current?.attr('transform', event.transform)
  })
svgRef.current?.call(zoom)
```

On new seed concept or re-centre, animate zoom to fit ring1 nodes:
```ts
function zoomToFit(nodes: ConceptNode[]) {
  const ring1Nodes = nodes.filter(n => n.ring === 'ring1' || n.ring === 'core')
  // Calculate bounding box, animate to fit with padding
}
```

---

## Tests to write

### `tests/components/GraphNode.test.tsx`

```ts
it('renders core node with correct label text')
it('renders core node with "origin" sub-label')
it('renders ring1 node with aria-label including ring and category')
it('calls onSelect when clicked')
it('calls onSelect when Enter key is pressed')
it('does not call onSelect when node is already selected and clicked')
it('applies expanding class/attribute when isExpanding is true')
```

### `tests/components/SearchBar.test.tsx`

```ts
it('renders with placeholder text "Enter any concept to explore…"')
it('calls onSubmit with trimmed value when Enter is pressed')
it('clears input value after submit')
it('does not call onSubmit when input is empty')
it('does not call onSubmit when input is only whitespace')
it('does not call onSubmit when input exceeds 100 characters')
it('shows inline error message when input exceeds 100 characters')
```

---

## Manual verification checklist

Before marking Phase 2 complete, verify manually in the browser:

- [ ] `npm run dev` starts without errors
- [ ] Enter "consciousness" in the search bar — LoadingBloom animation appears
- [ ] Ring1 and Ring2 nodes appear and animate into position (spring/bounce)
- [ ] Clicking a Ring1 node selects it (highlighted with glow)
- [ ] D3 zoom works: scroll to zoom, drag to pan
- [ ] Clicking a node that is already selected deselects it (panel closes — Phase 3 will add the panel)
- [ ] Entering a new concept clears the old graph and builds a fresh one
- [ ] Open browser DevTools → Performance → verify D3 tick does NOT trigger React re-renders (no yellow React frames during simulation)
- [ ] `npm run type-check` zero errors, `npm test` all pass, `npm run build` succeeds

---

## Coverage target after this phase
Lines ≥ 75% · Functions ≥ 75% · Branches ≥ 70%
