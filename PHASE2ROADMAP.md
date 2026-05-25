# Phase 2 Roadmap — Graph Engine

All prompts are self-contained. Paste one prompt per session. Clear context between sessions.
Update PROGRESS.md at the end of every session before closing.

Phase 1 must be complete before starting here.

---

## Status

```
P2.1  GraphContext (state + reducer)   ← start here
P2.2  GraphCanvas + GraphEdge
P2.3  GraphNode + tests
P2.4  ConceptGraph (D3 simulation)
P2.5  SearchBar + page wiring + tests
P2.6  Phase 2 final checklist
```

---

## PROMPT P2.1 — GraphContext

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The state management layer. A single React context that owns all of GraphState and
exposes a dispatch function. The reducer handles every action by calling the lib
functions from Phase 1 — it never manipulates node arrays inline. No UI is built in
this session. By the end, GraphContext.tsx compiles cleanly and the types are all
correct.

FILE — lib/context/GraphContext.tsx
Mark as 'use client' at the top.

Define the GraphAction union type (if not already in lib/types.ts, add it there and
import it here). The full action union from .claude/architecture.md:
  EXPAND_CONCEPT: { concept: string; nodeId?: string; depth: number }
  ADD_EXPANSION_NODES: { nodes: ConceptNode[]; edges: ConceptEdge[] }
  SELECT_NODE: { nodeId: string | null }
  SET_DEFINITION: { nodeId: string; definition: string; relatedTags: string[] }
  RECENTRE: { nodeId: string }
  CLEAR_GRAPH: (no payload)
  SET_EXPANDING: { nodeId: string | null }
  ADD_TAG_NODE: { label: string; parentNodeId: string }

Implement graphReducer(state: GraphState, action: GraphAction): GraphState
Each case calls the appropriate lib function:
  EXPAND_CONCEPT:
    If nodes is empty, create the core node using createCoreNode(action.concept, action.depth)
    and add it to nodes. Set isExpanding: true, expansionNodeId: action.nodeId ?? coreNode.id,
    seedConcept: action.concept.
  ADD_EXPANSION_NODES:
    Replace state.nodes and state.edges with action.nodes and action.edges.
    Set isExpanding: false, expansionNodeId: null.
  SELECT_NODE:
    Set activeNodeId: action.nodeId.
  SET_DEFINITION:
    Find the node by nodeId, set its definition and relatedTags.
    Return new nodes array with the updated node.
  RECENTRE:
    Call recentreGraph(state, action.nodeId) and return the result.
    The recentreGraph function already calls pruneGraph internally.
  CLEAR_GRAPH:
    Return initialState.
  SET_EXPANDING:
    Set isExpanding: !!action.nodeId, expansionNodeId: action.nodeId.
  ADD_TAG_NODE:
    Create a new ConceptNode: ring 'ring1', semanticDistance 'direct', category 'awareness',
    depth = parent's depth + 1, parentId = action.parentNodeId.
    id = action.label.toLowerCase().trim()
    Create an edge connecting it to parentNodeId.
    Append both to state.nodes and state.edges.

Export:
  GraphStateContext (React.createContext with initialState and a no-op dispatch)
  GraphProvider component that wraps children with the context using useReducer
  useGraphState() hook: returns { state, dispatch } from useContext(GraphStateContext)

The GraphProvider should also export a named export so page.tsx can import it cleanly.

VERIFY before finishing:
  npm run type-check   — zero errors (this file must compile without any 'any' types
                         except the D3-related ones marked with // d3 internal)
  npm test             — all existing tests still pass (no regressions)

Update PROGRESS.md: mark P2.1 complete, next = P2.2.
```

---

## PROMPT P2.2 — GraphCanvas + GraphEdge

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The SVG container and the edge renderer. GraphCanvas is the full-viewport SVG element
with D3 zoom and pan attached. GraphEdge renders SVG lines between nodes. Neither
component knows about the simulation yet — that comes in P2.4. By the end, we have
a zoomable/pannable SVG canvas and typed edge components ready to receive D3-managed
positions.

FILE 1 — components/graph/GraphCanvas.tsx
Mark as 'use client'.

Props:
  children: React.ReactNode
  onZoomIn?: () => void      // called by ZoomControls in Phase 3
  onZoomOut?: () => void
  onResetZoom?: () => void

Implementation:
  - svgRef: useRef<SVGSVGElement>(null)
  - innerGroupRef: useRef (stored as a D3 selection, not a DOM ref)
  - zoomBehaviourRef: useRef (stores the D3 zoom behaviour for external calls)
  - On mount, dynamically import d3: import('d3').then(d3 => { ... })
  - Inside the then: attach d3.zoom to svgRef.current, scaleExtent [0.3, 2.5]
  - On zoom event: update the transform of the inner <g> element directly via D3 selection
  - Expose zoomIn/zoomOut/resetZoom via useImperativeHandle so ZoomControls can call them
    (wrap the component in React.forwardRef)
  - The inner <g> element is where nodes and edges are rendered (via children)

Render:
  <svg ref={svgRef} width="100%" height="100%" style={{ background: 'transparent' }}>
    <g ref={innerGroupRef}>
      {children}
    </g>
  </svg>

IMPORTANT: The D3 zoom attaches event listeners to the SVG element. This prevents
React's synthetic events on SVG children from firing correctly. Use pointer-events: none
on the inner group and set pointer-events: all on individual interactive children
(GraphNode components).

FILE 2 — components/graph/GraphEdge.tsx
Mark as 'use client'.

This is a simple SVG line. D3 will update its attributes directly on tick, so
the React component just needs to render the <line> element with the right initial
attributes and a data-edge-id for D3 to select.

Props:
  edge: ConceptEdge
  isHighlighted: boolean   // true when connected to the hovered or selected node

Render a <line> element:
  - data-edge-id={edge.id} (so D3 can select it by attribute)
  - stroke: determined by edge.ring and isHighlighted
    - ring1 + highlighted: full category colour (use CATEGORY_COLOURS from lib/colour.ts
      with the edge's category — note: edge doesn't carry category, so use ring to
      determine opacity only; the colour comes from the target node's category)
    - ring1 + not highlighted: category colour at 30% opacity
    - ring2 + highlighted: category colour at 60% opacity
    - ring2 + not highlighted: category colour at 15% opacity
    - ring3: rgba(73,101,128,0.08) always
  - strokeWidth: ring1 → 1.5px, ring2 → 1px, ring3 → 0.5px
  - Initial x1/y1/x2/y2 are 0 — D3 will set these on tick

Note: GraphEdge does not need to know the category colour — pass isHighlighted only.
The colour system will be simplified in a later phase. For now render with the
ring-based opacity only and use #BADDFF (sky) as the default stroke colour for all edges.
This will be refined when ConceptGraph wires everything together.

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all existing tests still pass

Update PROGRESS.md: mark P2.2 complete, next = P2.3.
```

---

## PROMPT P2.3 — GraphNode + tests

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The individual node component — the visual heart of the app. GraphNode renders as an
SVG <g> group and supports all four ring variants with their correct sizes and colours,
plus three interactive states: hover, selected, and expanding. D3 positions the node
by setting its transform attribute directly. We also write the full test suite for it.

FILE 1 — components/graph/GraphNode.tsx
Mark as 'use client'.

Props:
  node: ConceptNode
  isSelected: boolean
  isExpanding: boolean
  onSelect: (nodeId: string) => void

The component renders an SVG <g> group with:
  - data-node-id={node.id}
  - role="button", tabIndex={0}
  - aria-label={`${node.label}, ring ${node.ring}, ${node.category}`}
  - aria-pressed={isSelected}
  - onClick: calls onSelect(node.id)
  - onKeyDown: if event.key === 'Enter' call onSelect(node.id)
  - onMouseEnter / onMouseLeave for hover state (local useState)

Visual elements (all SVG):

For ALL nodes:
  1. Main <circle>: size, fill, stroke from getNodeColour(node.ring, node.category)
     Sizes by ring: core=42r, ring1=32r, ring2=23r, ring3=16r (radii, so diameter is 2×)
  2. Label <text>: centred at (0, 0), dy="0.35em", fontSize from ring
     core: 13px/700, ring1: 10px/600, ring2: 8.5px/500, ring3: 8px/400
  3. Sub-label <text> (core node only): "origin" text, 8px/600, #BADDFF, uppercase,
     letterSpacing "0.12em", dy positioned below the circle (y = radius + 14)
  4. For ring1 nodes: a sub-label below the circle showing the category name,
     9px/500, lighter category colour (text colour at 70% opacity), y = radius + 12

States:
  - Hover (local state, mouseenter/mouseleave):
    Apply CSS transform scale(1.08) on the <g> element
    Use CSS transition: transform 150ms ease
  - Selected (isSelected prop):
    Apply SVG filter: drop-shadow(0 0 8px [category colour])
    Use the category border colour for the glow colour
  - Expanding (isExpanding prop):
    Render an additional <circle> with strokeDasharray that animates:
    The spinner ring: radius = nodeRadius + 8, stroke category colour, strokeWidth 1.5,
    fill none. Animate rotation via CSS: animation spin 1s linear infinite.
    The spin keyframe must be in globals.css (@keyframes spin { to { transform: rotate(360deg) } })
    The node circle itself pulses: use a CSS animation "pulse" 800ms ease-in-out infinite alternate
    (scale 1.0 → 1.05). Add this keyframe to globals.css too.

Important: D3 will set the transform attribute on the <g> element to position it.
The hover scale must be applied as a CSS transform (not SVG transform) to avoid
conflicting with D3's positioning. Use style={{ transform: hover ? 'scale(1.08)' : 'scale(1)' }}

FILE 2 — tests/components/GraphNode.test.tsx
Write all 7 tests from .claude/phases/2-graph-engine.md "Tests to write" section:
  it('renders core node with correct label text')
  it('renders core node with "origin" sub-label')
  it('renders ring1 node with aria-label including ring and category')
  it('calls onSelect when clicked')
  it('calls onSelect when Enter key is pressed')
  it('does not call onSelect when node is already selected and clicked')
  it('applies expanding class/attribute when isExpanding is true')

For the test fixtures, build a minimal ConceptNode object with the required fields.
The nodes do not need x/y positions for rendering tests.

Add @testing-library/user-event to interactions. Import userEvent from
@testing-library/user-event and use userEvent.setup() for keyboard events.

Note: SVG rendering in jsdom is limited. Test for the presence of aria attributes and
text content rather than visual dimensions. For the "origin" sub-label test, query by
text content.

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass including new GraphNode tests

Update PROGRESS.md: mark P2.3 complete, next = P2.4.
```

---

## PROMPT P2.4 — ConceptGraph (D3 simulation)

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The most complex component in the project. ConceptGraph owns the D3 force simulation,
handles dynamic import of D3, wires the tick handler to update SVG elements directly
(never via React state), triggers AI expansion when the context signals isExpanding,
and handles re-centring. By the end, entering a concept in a temporary test input
should produce a visible working force graph.

FILE — components/graph/ConceptGraph.tsx
Mark as 'use client'. Import useGraphState from lib/context/GraphContext.

This component owns three refs (never React state):
  simulationRef: useRef<any>(null)
  nodeGroupRef: useRef<any>(null)     // D3 selection of all node <g> elements
  edgeGroupRef: useRef<any>(null)     // D3 selection of all edge <line> elements

The component renders:
  <GraphCanvas>
    <g className="edges" />           // edge container (D3 manages children)
    <g className="nodes" />           // node container (D3 manages children)
  </GraphCanvas>
Plus conditionally: <EmptyState> or <LoadingBloom> (import as placeholders for now —
we will build those in Phase 3; use empty divs with text as stand-ins).

EFFECT 1 — D3 initialisation (runs once on mount):
  import('d3').then(d3Module => {
    d3Ref.current = d3Module
    // Set up references to the SVG groups
    // Do NOT start simulation yet — wait for nodes
  })

EFFECT 2 — Structural change (runs when nodes.length or edges.length changes):
  Depends: [state.nodes.length, state.edges.length]
  If no d3 loaded yet or no nodes, return early.
  Use D3 data join pattern:
    - Select the edges group, join state.edges, enter → append <line> with data-edge-id
    - Select the nodes group, join state.nodes, enter → render ReactDOM.createPortal
      OR use renderToStaticMarkup for SVG content... 

  ACTUALLY: Because GraphNode is a React component and D3 manages positions, use
  a hybrid approach:
    - Render GraphNode components from React state (they appear in the <g className="nodes">
      via React's reconciler)
    - D3 selects them by data-node-id attribute in the tick handler
    - Similarly for edges: render GraphEdge components from React state

  This means: re-render React when nodes/edges array changes (to add/remove components),
  and D3 reads the resulting DOM elements via selection in the tick handler.

  The key performance rule: React re-renders only on structural changes (node added/removed).
  D3 updates positions every tick without React involvement.

  Implementation: use useMemo to memoize the rendered node and edge arrays.
  The simulation is restarted (not recreated) when nodes/edges change:
    if simulationRef.current:
      simulationRef.current.nodes(state.nodes)
      simulationRef.current.force('link').links(state.edges)
      simulationRef.current.alpha(0.8).restart()
    else:
      simulationRef.current = createSimulation(d3, state.nodes, state.edges)
      simulationRef.current.on('tick', tickHandler)

TICK HANDLER:
  const tickHandler = () => {
    // NaN guard first
    state.nodes.forEach(node => {
      if (isNaN(node.x ?? 0)) { node.x = 0; node.vx = 0 }
      if (isNaN(node.y ?? 0)) { node.y = 0; node.vy = 0 }
    })
    // Update node positions by selecting each <g data-node-id> element
    state.nodes.forEach(node => {
      const el = document.querySelector(`[data-node-id="${node.id}"]`)
      if (el) el.setAttribute('transform', `translate(${node.x ?? 0},${node.y ?? 0})`)
    })
    // Update edge positions by selecting each <line data-edge-id> element
    state.edges.forEach(edge => {
      const el = document.querySelector(`[data-edge-id="${edge.id}"]`) as SVGLineElement | null
      if (!el) return
      const src = edge.source as any
      const tgt = edge.target as any
      el.setAttribute('x1', String(src.x ?? 0))
      el.setAttribute('y1', String(src.y ?? 0))
      el.setAttribute('x2', String(tgt.x ?? 0))
      el.setAttribute('y2', String(tgt.y ?? 0))
    })
  }
Note: state.nodes and state.edges inside the tick handler must be read from a ref
(not closed-over state), otherwise they will be stale. Use a nodesRef and edgesRef
that are updated in a useEffect when state changes:
  useEffect(() => { nodesRef.current = state.nodes }, [state.nodes])
  useEffect(() => { edgesRef.current = state.edges }, [state.edges])

EFFECT 3 — Expansion trigger (runs when isExpanding or expansionNodeId changes):
  Depends: [state.isExpanding, state.expansionNodeId]
  If not isExpanding or no expansionNodeId, return.
  Find the node: state.nodes.find(n => n.id === state.expansionNodeId)
  Fetch /api/expand with { concept: node.label, depth: node.depth }
  Accumulate the streamed response (SSE text chunks) into a string
  When the stream closes, call parseExpansionResponse(accumulated)
  Get the result from addExpansionNodes(state, parsedResult, node.id, node.depth + 1)
  Dispatch ADD_EXPANSION_NODES with the new nodes and edges
  On fetch error: dispatch SET_EXPANDING with null, show toast "Couldn't reach the AI. Try again."

Stream reading pattern:
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let accumulated = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    accumulated += decoder.decode(value, { stream: true })
  }

VERIFY:
  npm run dev
  Open http://localhost:3000
  You will see a blank page (no UI yet — Toolbar/SearchBar come in P2.5)
  Add a temporary button to page.tsx that dispatches EXPAND_CONCEPT with concept "ocean"
  Clicking it should: create a core node, trigger expansion, add ring1 and ring2 nodes
  Open DevTools → Elements → verify <g data-node-id="ocean"> exists and has a transform
  Open DevTools → Performance → record 5 seconds during simulation → verify no React
  re-renders during tick (no yellow "Recalculate Style" from React component updates)

  npm run type-check   — zero errors
  npm test             — all existing tests pass

Remove the temporary test button from page.tsx before finishing.
Update PROGRESS.md: mark P2.4 complete, next = P2.5.
```

---

## PROMPT P2.5 — SearchBar + page wiring + tests

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The SearchBar component (the user's entry point into the graph) and the minimal
wired-up page.tsx that makes the whole Phase 2 system usable for manual testing.
By the end, opening the app and typing a concept produces a working force graph.

FILE 1 — components/ui/SearchBar.tsx
Mark as 'use client'.

Props:
  onSubmit: (concept: string) => void
  disabled?: boolean

Visual spec from .claude/design.md:
  - Pill shape: border-radius 22px, height 42px, width 320px
  - bg #FFFFFF, border 1px solid rgba(73,101,128,0.15)
  - Placeholder: "Enter any concept to explore…"
  - Left icon: IconAtom from @tabler/icons-react, size 18, color #BADDFF
  - Submit button on the right: IconSparkles from @tabler/icons-react (or similar)
    colour #BADDFF on idle, #496580 on hover
  - Focus: border becomes rgba(73,101,128,0.30), no outline ring

Behaviour:
  - Local state: value (string), error (string | null)
  - On Enter key: call handleSubmit()
  - On submit button click: call handleSubmit()
  - handleSubmit:
    const trimmed = value.trim()
    if (!trimmed) { trigger shake animation; return }
    if (trimmed.length > 100) { setError('Keep it short — one concept at a time'); return }
    onSubmit(trimmed)
    setValue('')
    setError(null)
  - Error: shown as muted inline text below the input (--tx-3 colour, 11px)
  - Shake: add a CSS class that plays the @keyframes shake animation (add to globals.css):
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-6px); }
      40%, 80% { transform: translateX(6px); }
    }
    Remove the class after 400ms so it can be re-triggered.
  - aria-label: "Enter a concept to explore" on the input element

Position in page.tsx: fixed, top 58px (below the 50px toolbar + 8px gap), left 50%,
transform: translateX(-50%). This centres it at the top of the canvas.

FILE 2 — tests/components/SearchBar.test.tsx
Write all 7 tests from .claude/phases/2-graph-engine.md "Tests to write" section:
  it('renders with placeholder text "Enter any concept to explore…"')
  it('calls onSubmit with trimmed value when Enter is pressed')
  it('clears input value after submit')
  it('does not call onSubmit when input is empty')
  it('does not call onSubmit when input is only whitespace')
  it('does not call onSubmit when input exceeds 100 characters')
  it('shows inline error message when input exceeds 100 characters')

FILE 3 — app/page.tsx (minimal wiring)
'use client' at the top.

Import GraphProvider from lib/context/GraphContext.
Import ConceptGraph from components/graph/ConceptGraph.
Import SearchBar from components/ui/SearchBar.

In the page component:
  - Wrap everything in <GraphProvider>
  - Use useGraphState() to get { state, dispatch }
  - SearchBar onSubmit: dispatch({ type: 'EXPAND_CONCEPT', concept, depth: 0,
    nodeId: concept.toLowerCase().trim() })
  - Render a minimal 50px toolbar placeholder div at the top (just "bloom" text)
  - Render SearchBar below the toolbar
  - Render ConceptGraph filling the remaining space

Note: useGraphState is a client hook, so page.tsx must be 'use client'. The full
Toolbar, DetailPanel, ZoomControls etc. come in Phase 3 — keep this minimal.

VERIFY before finishing:
  npm run dev
  Open http://localhost:3000
  Type "time" in the search bar and press Enter
  Expected:
    - LoadingBloom placeholder (or empty) shows briefly
    - Ring1 nodes (6) and Ring2 nodes (~12) animate into position
    - Clicking a node selects it (check that activeNodeId changes — no panel yet)
    - Scrolling zooms, dragging pans
    - Typing a new concept clears the graph and builds a fresh one

  npm run type-check   — zero errors
  npm test             — all tests pass including SearchBar tests

Update PROGRESS.md: mark P2.5 complete, next = P2.6.
```

---

## PROMPT P2.6 — Phase 2 final checklist

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/2-graph-engine.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code unless a specific fix is needed to resolve a checklist failure.

This is the final checklist for Phase 2. Work through each item. Fix any failures.

AUTOMATED CHECKS:
  npm run type-check   — zero errors
  npm test             — all tests pass
  npm run test:coverage — lines ≥ 75%, functions ≥ 75%, branches ≥ 70%
  npm run build        — production build succeeds

MANUAL BROWSER VERIFICATION:
  1. Enter "consciousness" in the search bar — graph appears
  2. Ring1 nodes have three different colours (sky/peach/mint) — verify at least 2 visible
  3. Ring2 nodes are smaller and more muted
  4. Scroll wheel zooms smoothly
  5. Click and drag pans the canvas
  6. Click a Ring1 node — it gets a glow/selected visual
  7. Click the same node again — it deselects
  8. Type a new concept — old graph clears, new one builds
  9. Open DevTools → Performance → record 5 seconds during simulation
     Confirm: no React component re-renders during D3 tick
     (look for absence of component update frames in the flame chart)
  10. Open DevTools → Network → expand tab shows /api/expand was called once per search
  11. Verify bundle: npm run build, then check .next/static/chunks/ — d3 should NOT
      appear in pages/_app chunk (it should be in a lazy-loaded chunk only)
      Run: ls .next/static/chunks/ | grep -v "pages" to see the lazy chunks

PERFORMANCE CHECK:
  With the graph visible, open DevTools → Console and run:
    window.performance.mark('start')
    // manually trigger expansion of 3 more nodes (by clicking in the UI)
    window.performance.mark('end')
    window.performance.measure('graph', 'start', 'end')
    performance.getEntriesByName('graph')
  The graph should remain interactive throughout. If it stutters, check that
  the tick handler is not calling setState.

FILE AUDIT — confirm all these files exist:
  lib/context/GraphContext.tsx
  components/graph/GraphCanvas.tsx
  components/graph/GraphEdge.tsx
  components/graph/GraphNode.tsx
  components/graph/ConceptGraph.tsx
  components/ui/SearchBar.tsx
  tests/components/GraphNode.test.tsx
  tests/components/SearchBar.test.tsx
  app/page.tsx

Update PROGRESS.md: mark P2.6 complete, Phase 2 complete.
Update CHANGELOG.md: "[DATE] — Phase 2 — Graph Engine complete: D3 force graph rendering,
expansion working end-to-end, performance verified."
Phase 2 is done. Next: PHASE3ROADMAP.md → P3.1.
```
