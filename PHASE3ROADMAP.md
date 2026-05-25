# Phase 3 Roadmap — UI & Interaction

All prompts are self-contained. Paste one prompt per session. Clear context between sessions.
Update PROGRESS.md at the end of every session before closing.

Phase 2 must be complete before starting here.

---

## Status

```
P3.1  StreamingDefinition + ConceptTags + tests   ← start here
P3.2  DetailPanel + tests
P3.3  Overlay UI (ZoomControls, Legend, NodeTooltip, LoadingBloom)
P3.4  EmptyState + Toolbar
P3.5  Complete page.tsx + toast wiring
P3.6  Phase 3 final checklist
```

---

## PROMPT P3.1 — StreamingDefinition + ConceptTags + tests

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
Two components that live inside the detail panel. StreamingDefinition fetches from
/api/define and animates the definition text character-by-character — the effect that
makes the panel feel alive. ConceptTags renders the four related concept chips that
let users jump to new ideas. Both are self-contained with no external state dependencies
beyond the props they receive.

FILE 1 — components/ui/StreamingDefinition.tsx
Mark as 'use client'.

Props:
  concept: string
  parentConcept: string
  onComplete?: (definition: string, relatedTags: string[]) => void

State: text (string), done (boolean), relatedTags (string[])

Implementation (exactly as specified in .claude/phases/3-ui-interaction.md):
  - On mount and when concept/parentConcept change: reset text='', done=false
  - Create AbortController
  - fetch POST /api/define with { concept, parentConcept } and the abort signal
  - On response: parse JSON, get data.definition and data.relatedTags
  - Animate text character by character using setInterval at 18ms per character
  - When complete: setDone(true), setRelatedTags(data.relatedTags), call onComplete if provided
  - Cleanup: abort the fetch AND clear the interval on unmount
  - On non-abort fetch failure: setText(DEFINITION_FALLBACK.definition), setDone(true)

Render:
  <p style={{ fontSize: 11, color: '#8AABBC', lineHeight: 1.65 }}>
    {text}
    {!done && <span aria-hidden="true" style={{ opacity: 0.4 }}>|</span>}
  </p>
  The blinking cursor is the | character. Add to globals.css:
  @keyframes blink { 0%, 100% { opacity: 0.4; } 50% { opacity: 0; } }
  Apply it as: style={{ animation: 'blink 1s step-end infinite' }}

FILE 2 — components/ui/ConceptTags.tsx
Mark as 'use client'.

Props:
  tags: string[]
  onTagClick: (tag: string) => void

Renders up to 4 tag chips. Each chip:
  - Small pill: border-radius 99px, padding 3px 10px, font 9px/600
  - Cycle through the three accent colours for visual variety:
    index 0: sky (#F0F7FF bg, #BADDFF border, #5A8AAA text)
    index 1: peach (#FFF8F0 bg, #FFDBBB border, #C07040 text)
    index 2: mint (#F0FFFC bg, #BAFFF5 border, #40A090 text)
    index 3: sky again (wraps)
  - On click: call onTagClick(tag)
  - Hover: slight background darkening (10% opacity overlay)
  - aria-label={`Explore ${tag}`}

FILE 3 — tests/components/StreamingDefinition.test.tsx
Write all 6 tests from .claude/phases/3-ui-interaction.md "Tests to write" section.
CRITICAL: Use vi.useFakeTimers() in beforeEach and vi.useRealTimers() in afterEach.
The setInterval for character animation must be controlled by fake timers.

Test setup pattern:
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ definition: 'Test definition.', relatedTags: ['a','b','c','d'] })
    } as Response)
  })

For the "aborts fetch on unmount" test:
  const controller = { abort: vi.fn() }
  vi.spyOn(global, 'AbortController').mockImplementation(() => controller as any)
  const { unmount } = render(<StreamingDefinition concept="x" parentConcept="y" />)
  unmount()
  expect(controller.abort).toHaveBeenCalled()

For the "text grows incrementally" test:
  render(<StreamingDefinition concept="x" parentConcept="y" />)
  await vi.runAllTimersAsync()  // resolves the fetch promise
  // advance timer in steps and check that text length grows
  const textAfterN = screen.getByText(/./i).textContent
  vi.advanceTimersByTime(18 * 3)
  const textAfterN3 = screen.getByText(/./i).textContent
  expect(textAfterN3!.length).toBeGreaterThan(textAfterN!.length)

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass including StreamingDefinition tests

Update PROGRESS.md: mark P3.1 complete, next = P3.2.
```

---

## PROMPT P3.2 — DetailPanel + tests

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The detail panel — a fixed overlay that slides in from the right when a node is selected.
It contains the node's ring badge, concept name, streaming definition, related tags, and
the expand button. It is the primary way users interact with individual concepts.

FILE 1 — components/ui/DetailPanel.tsx
Mark as 'use client'.

Props:
  node: ConceptNode | null
  onClose: () => void
  onExpand: (nodeId: string) => void
  onAddTag: (label: string, parentNodeId: string) => void

If node is null, render nothing (return null).

Position and animation:
  - position: fixed, right: 16px, top: 66px
  - width: 224px
  - background: #FFFFFF, border: 1px solid rgba(73,101,128,0.1), border-radius: 14px
  - padding: 16px
  - box-shadow: 0 2px 12px rgba(73,101,128,0.08)
  - Entry animation: use CSS transition on transform and opacity
    - When node becomes non-null: translateX(0) and opacity 1
    - Initial: translateX(240px) and opacity 0
    - Transition: 200ms ease
    - Use a useEffect to set an "entered" state to true after mount, triggering
      the animation class change. Or use Tailwind transition classes.

Keyboard: attach a keydown listener to the document when the panel is open.
  On Escape: call onClose(). Remove the listener on cleanup.
  aria-label="Concept detail", role="complementary"

Panel structure (top to bottom):

1. Close button (top-right): icon-only, X icon, aria-label="Close detail panel",
   onClick: onClose()

2. "NEWLY SELECTED" header label:
   - 9px/600, color #8AABBC, all-caps, letter-spacing 0.10em
   - This is what bloom-preview.png shows — do NOT use a ring badge pill here.
   - No border, no background — plain muted text only.

3. Concept name:
   - 20px/700, color #496580
   - The node.label text, capitalised first letter

4. StreamingDefinition component:
   - Pass concept={node.label} and parentConcept={node.parentId ?? 'general knowledge'}
   - On onComplete: dispatch SET_DEFINITION action with the definition and relatedTags
     (This needs the dispatch — either get it from useGraphState or pass it as a prop.
     Pass onDefinitionLoaded: (def: string, tags: string[]) => void as a prop to keep
     DetailPanel decoupled from the context)

5. "Related concepts" label: 9px/500, color #BACCDA, margin-top 12px

6. ConceptTags component:
   - Pass tags={node.relatedTags ?? []}
   - onTagClick: calls onAddTag(tag, node.id)
   - If relatedTags is empty or undefined, show nothing (tags load after definition completes)

7. "Expand this concept" button:
   - Primary button style from .claude/design.md
   - Full width, margin-top 16px
   - Label: "Expand" when idle, "Expanding…" when the node is being expanded
   - disabled when node.ring === 'core' (core is already expanded)
   - onClick: onExpand(node.id)

FILE 2 — tests/components/DetailPanel.test.tsx
Write all 7 tests from .claude/phases/3-ui-interaction.md "Tests to write" section:
  it('does not render when node prop is null')
  it('renders concept name')
  it('renders "NEWLY SELECTED" header label above concept name')
  it('renders ConceptTag chips for each related tag')
  it('"Expand this concept" button calls onExpand with node id')
  it('calls onClose when Escape key is pressed')
  it('calls onAddTag when a related tag chip is clicked')

For the ConceptTag chips test: the tags are populated after StreamingDefinition calls
onComplete. Either (a) pass relatedTags directly as a prop to DetailPanel for the test,
or (b) pass a node with relatedTags already populated. Option (b) is cleaner — set
node.relatedTags = ['a','b','c','d'] in the test fixture.

For the Escape key test: use fireEvent.keyDown(document, { key: 'Escape' })

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass including DetailPanel tests

Update PROGRESS.md: mark P3.2 complete, next = P3.3.
```

---

## PROMPT P3.3 — Overlay UI (ZoomControls, Legend, NodeTooltip, LoadingBloom)

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
Four overlay UI components. None of these require tests in this phase (they are
presentational or have trivial callbacks). ZoomControls lives bottom-right.
Legend lives bottom-left. NodeTooltip appears on node hover. LoadingBloom replaces
the canvas during the first expansion.

FILE 1 — components/ui/ZoomControls.tsx
Mark as 'use client'.

Props:
  onZoomIn: () => void    // scale × 1.1
  onZoomOut: () => void   // scale × 0.9
  onReset: () => void     // zoom to fit

Position: fixed, bottom: 24px, right: 16px, z-index: 80

Render three small circular icon buttons, stacked vertically with 4px gap:
  + button: IconPlus from @tabler/icons-react, aria-label="Zoom in"
  − button: IconMinus, aria-label="Zoom out"
  ⊡ button: IconMaximize (or similar), aria-label="Fit to view"

Style: bg #FFFFFF, border 1px solid rgba(73,101,128,0.12), border-radius 8px,
width 32px, height 32px each. Hover: bg rgba(73,101,128,0.06).
Icon colour: #8AABBC, hover: #496580.

FILE 2 — components/ui/Legend.tsx
Position: fixed, bottom: 24px, left: 16px, z-index: 80.

Renders a small panel showing the three category colours:
  bg rgba(255,255,255,0.92), border 1px solid rgba(73,101,128,0.08),
  border-radius 10px, padding 8px 12px.

Three rows:
  ● awareness — #BADDFF dot, #5A8AAA text, "awareness" label, 9px
  ● identity — #FFDBBB dot, #C07040 text
  ● experiential — #BAFFF5 dot, #40A090 text

A small circle (8px) filled with the category colour, then the category name.

FILE 3 — components/ui/NodeTooltip.tsx
Mark as 'use client'.

Props:
  node: ConceptNode | null
  x: number
  y: number

If node is null, render nothing.

A small tooltip that appears near the cursor (offset +12px, +12px from x/y):
  position: fixed, left: x + 12, top: y + 12
  bg #FFFFFF, border 1px solid rgba(73,101,128,0.1), border-radius 8px
  padding 4px 10px, pointer-events: none (never intercepts mouse events)
  box-shadow: 0 2px 8px rgba(73,101,128,0.1)
  z-index: 150

Content: node.label in 10px/600 #496580, and below it the category name in 9px
#8AABBC. Max width 120px, text wraps.

FILE 4 — components/ui/LoadingBloom.tsx
Mark as 'use client'.

This component is shown when isExpanding and nodes.length === 0 (first expansion only).
It replaces the canvas with a centred animated loading indicator.

Position: absolute, inset 0, flex centre (both axes)
Background: transparent (the cream bg shows through from the page)

Bloom animation:
  Four <div> elements arranged around a centre point. Each is an ellipse shape
  (border-radius 50% 50% 50% 50% / 60% 60% 40% 40% or similar) giving a petal look.
  Dimensions: 40px × 24px each.
  Colours: petal 0 #FFDBBB (peach), petal 1 #BADDFF (sky), petal 2 #BAFFF5 (mint),
  petal 3 #BACCDA (slate)
  Each petal is absolutely positioned around a 0,0 centre:
    petal 0: top:-20px, left:-12px (top)
    petal 1: right:-20px, top:-12px (right)
    petal 2: bottom:-20px, left:-12px (bottom)
    petal 3: left:-20px, top:-12px (left)
  The container rotates: animation: spin 3s linear infinite
  Each petal has a scale pulse: animation: pulse 1.2s ease-in-out infinite alternate
  with 0.3s stagger between petals (animation-delay: 0, 0.3s, 0.6s, 0.9s)

Below the bloom: "Growing your idea…" in #BACCDA, 12px, margin-top 48px.
Add aria-live="polite" with "Generating concept map" on the container.

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all existing tests still pass

Update PROGRESS.md: mark P3.3 complete, next = P3.4.
```

---

## PROMPT P3.4 — EmptyState + Toolbar

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The empty state (shown before any concept is entered) and the Toolbar (the top bar
with the logo, active concept pill, node count, Clear, and Export buttons). Both
components are purely presentational with clear callbacks — no direct state access.

FILE 1 — components/ui/EmptyState.tsx
Mark as 'use client'.

Props:
  onSubmit: (concept: string) => void

Shown when nodes.length === 0 and !isExpanding.

Layout: absolute inset-0, flex column, align centre, justify centre.

Elements:
1. Animated background: a <div> absolutely positioned filling the space, with a
   radial gradient from peach/sky at the centre, opacity animating with pulse-bg
   (already defined in .claude/phases/3-ui-interaction.md):
   background: radial-gradient(ellipse at center, #FFDBBB 0%, #BADDFF 50%, transparent 70%)
   @keyframes pulse-bg: { 0%,100% { opacity: 0.04 } 50% { opacity: 0.07 } }

2. Wordmark "bloom": 48px/700, color: #FFDBBB (peach), letter-spacing: -0.02em

3. Tagline "Every idea has roots.": 16px/400, color: #8AABBC, margin-top: 8px

4. Sub-text "Type any concept above to begin exploring": 13px/400, color: #BACCDA,
   margin-top: 4px

5. Three example concept pills (margin-top: 24px, flex row, gap: 8px):
   "consciousness" · "time" · "love"
   Style: border-radius 99px, padding 6px 16px, bg #FFFFFF,
   border 1px solid rgba(73,101,128,0.12), color #8AABBC, font 12px/500
   Hover: bg rgba(73,101,128,0.04), border rgba(73,101,128,0.20), cursor pointer
   onClick: calls onSubmit(concept)

FILE 2 — components/layout/Toolbar.tsx
Mark as 'use client'.

REFERENCE: bloom-preview.png shows the exact toolbar layout. Match it.
Layout: [bloom]  [concept-pill with node count + depth]  →  [Save map] [Export] [+ New concept]

Props:
  seedConcept: string
  nodeCount: number
  depth: number              // current max depth in the graph (max of node.depth values)
  onSave: () => void         // downloads JSON (same as export)
  onExport: () => void       // downloads JSON
  onNewConcept: () => void   // focuses the SearchBar
  isConfirmingClear: boolean
  onConfirmClear: () => void
  onCancelClear: () => void

Manage the "confirm clear" state in page.tsx and pass it down, keeping Toolbar
stateless.

Visual spec (matches bloom-preview.png exactly):
  height: 50px, full width
  background: rgba(247,244,240,0.97), backdrop-filter: blur(8px)
  border-bottom: 1px solid rgba(73,101,128,0.08)
  padding: 0 16px, flex, align-centre, gap: 12px
  z-index: 100

Left section:
  - Logo: "bloom" text, 13px/700, color #496580

Centre section (flex-1, flex, justify-centre):
  - If seedConcept is non-empty: show active concept pill
    Pill: bg #F0F7FF, border 1px solid rgba(186,221,255,0.6), border-radius 99px
    padding 4px 12px, flex, align-centre, gap 6px
    Left: IconAtom size 14, color #BADDFF
    Concept: seedConcept, 11px/600, color #5A8AAA
    Separator: "·" in #BACCDA
    Count+depth: "N nodes · depth D", 10px/400, color #8AABBC
    (Hide the × clear button from the pill — use the confirmation pattern in right section)

Right section (flex, gap: 8px, align-centre):
  - "Save map" — secondary button style, onClick: onSave()
  - "Export" — secondary button style, onClick: onExport()
  - "+ New concept" — accent button style (mint/teal, from .claude/design.md Accent spec)
    onClick: onNewConcept() which focuses the search input
  - Confirmation for clear: when isConfirmingClear is true, replace the three buttons
    with "Confirm clear?" (danger style) + "Cancel" (ghost). Auto-cancels after 4s.

Both onSave and onExport trigger the same browser download:
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bloom-${seedConcept}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all existing tests still pass

Update PROGRESS.md: mark P3.4 complete, next = P3.5.
```

---

## PROMPT P3.5 — Complete page.tsx + toast wiring

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The final wiring. We replace the minimal page.tsx from Phase 2 with the complete version
that connects every component to the state. We add react-hot-toast to the layout. We wire
up the zoom controls to GraphCanvas. By the end, the full intended user experience works
end-to-end.

FILE 1 — app/layout.tsx
Import Toaster from 'react-hot-toast' and add it to the layout body.
Configure the Toaster:
  position="bottom-center"
  toastOptions={{
    style: {
      background: '#FFF8F0',
      border: '1px solid #FFDBBB',
      color: '#C07040',
      fontSize: '12px',
      borderRadius: '12px',
    },
    duration: 4000,
  }}

FILE 2 — app/page.tsx (complete rewrite)
This file must be 'use client'. Import all components and useGraphState.

State managed in page.tsx (not in context — purely UI state):
  isConfirmingClear: boolean (starts false)
  tooltipNode: ConceptNode | null (which node is being hovered)
  tooltipPos: { x: number, y: number }

From useGraphState: get state and dispatch.

Handlers:
  handleSearch(concept: string):
    if concept.toLowerCase().trim() === state.seedConcept.toLowerCase().trim() and
    state.nodes.length > 0:
      // same concept as current core — do nothing (pulse is handled visually)
      return
    dispatch({ type: 'CLEAR_GRAPH' })
    // Schedule expansion after clear
    setTimeout(() => {
      dispatch({ type: 'EXPAND_CONCEPT', concept,
        nodeId: concept.toLowerCase().trim(), depth: 0 })
    }, 0)

  handleExpand(nodeId: string):
    dispatch({ type: 'RECENTRE', nodeId })

  handleSelectNode(nodeId: string):
    if state.activeNodeId === nodeId:
      dispatch({ type: 'SELECT_NODE', nodeId: null })
    else:
      dispatch({ type: 'SELECT_NODE', nodeId })

  handleAddTag(label: string, parentNodeId: string):
    dispatch({ type: 'ADD_TAG_NODE', label, parentNodeId })

  handleDefinitionLoaded(nodeId: string, definition: string, relatedTags: string[]):
    dispatch({ type: 'SET_DEFINITION', nodeId, definition, relatedTags })

  handleClear():
    setIsConfirmingClear(true)
    setTimeout(() => setIsConfirmingClear(false), 4000)

  handleConfirmClear():
    setIsConfirmingClear(false)
    dispatch({ type: 'CLEAR_GRAPH' })

  handleExport():
    const json = exportGraph(state)
    // browser download pattern from P3.4

ZoomControls: pass callbacks that call methods on a GraphCanvas ref.
Wrap GraphCanvas in React.forwardRef and expose { zoomIn, zoomOut, resetZoom }
via useImperativeHandle. In page.tsx, create graphRef = useRef<GraphCanvasHandle>(null)
and pass it to GraphCanvas. ZoomControls callbacks call graphRef.current?.zoomIn() etc.

Final JSX structure:
  <GraphProvider>  {/* if useGraphState is only inside GraphProvider, page needs to be
                       a child component. Either lift GraphProvider to layout.tsx or
                       create a child component PageContent that uses useGraphState */}
    <div className="flex flex-col h-screen" style={{ background: '#F7F4F0' }}>
      <Toolbar
        seedConcept={state.seedConcept}
        nodeCount={state.nodes.length}
        onClear={handleClear}
        onExport={handleExport}
        isConfirmingClear={isConfirmingClear}
        onConfirmClear={handleConfirmClear}
        onCancelClear={() => setIsConfirmingClear(false)}
      />
      <main className="flex-1 relative overflow-hidden">
        <SearchBar onSubmit={handleSearch} disabled={state.isExpanding} />
        <GraphCanvas ref={graphRef}>
          {state.nodes.length === 0 && !state.isExpanding && (
            <EmptyState onSubmit={handleSearch} />
          )}
          {state.isExpanding && state.nodes.length === 0 && (
            <LoadingBloom />
          )}
          {state.edges.map(edge => (
            <GraphEdge key={edge.id} edge={edge} isHighlighted={false} />
          ))}
          {state.nodes.map(node => (
            <GraphNode
              key={node.id}
              node={node}
              isSelected={state.activeNodeId === node.id}
              isExpanding={state.expansionNodeId === node.id}
              onSelect={handleSelectNode}
            />
          ))}
        </GraphCanvas>
        <DetailPanel
          node={state.nodes.find(n => n.id === state.activeNodeId) ?? null}
          onClose={() => dispatch({ type: 'SELECT_NODE', nodeId: null })}
          onExpand={handleExpand}
          onAddTag={handleAddTag}
          onDefinitionLoaded={handleDefinitionLoaded}
        />
        <ZoomControls
          onZoomIn={() => graphRef.current?.zoomIn()}
          onZoomOut={() => graphRef.current?.zoomOut()}
          onReset={() => graphRef.current?.resetZoom()}
        />
        <Legend />
        {tooltipNode && <NodeTooltip node={tooltipNode} x={tooltipPos.x} y={tooltipPos.y} />}
      </main>
    </div>
  </GraphProvider>

Note on GraphProvider + useGraphState: GraphProvider must wrap the component that
calls useGraphState. The cleanest pattern is to put GraphProvider in layout.tsx, or
to make page.tsx export a wrapper component:
  export default function Page() {
    return <GraphProvider><PageContent /></GraphProvider>
  }
  function PageContent() {
    const { state, dispatch } = useGraphState()
    // ... all the handlers and JSX
  }

VERIFY before finishing:
  npm run dev
  Full end-to-end test: enter "love" → expansion → click node → panel appears →
  definition streams → click tag → new node added → click expand → re-centre

  npm run type-check   — zero errors
  npm test             — all tests pass
  npm run build        — production build succeeds

Update PROGRESS.md: mark P3.5 complete, next = P3.6.
```

---

## PROMPT P3.6 — Phase 3 final checklist

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/3-ui-interaction.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code unless a specific fix is needed to resolve a checklist failure.

This is the final checklist for Phase 3. Work through each item. Fix any failures.

AUTOMATED CHECKS:
  npm run type-check   — zero errors
  npm test             — all tests pass
  npm run test:coverage — lines ≥ 78%, functions ≥ 78%, branches ≥ 73%
  npm run build        — production build succeeds

FULL BROWSER VERIFICATION (from .claude/phases/3-ui-interaction.md):
  1. Enter "love" — graph with ring1 (6 nodes) and ring2 (~12 nodes) appears
  2. Three distinct colours visible on ring1 nodes (sky/peach/mint)
  3. Click a ring1 node — detail panel slides in from the right with animation
  4. Definition streams character by character (not all at once)
  5. Four related tag chips appear below the definition after streaming completes
  6. Click a tag chip — new node appears connected to the selected node
  7. Click "Expand this concept" — graph re-centres on that concept, new nodes appear
  8. Old core node is now at ring2 distance from the new core
  9. Zoom + works (canvas zooms in)
  10. Zoom − works
  11. Reset zoom fits all nodes in view
  12. Empty state visible on fresh load: wordmark, tagline, three example pills
  13. Click "consciousness" example pill — expansion triggers
  14. LoadingBloom animation plays during first expansion
  15. Clear button shows confirmation step; confirming clears the graph
  16. Export button downloads a .json file; open it and verify valid JSON with nodes array
  17. Disconnect network in DevTools, then try to expand — toast "Couldn't reach the AI"
      appears (reconnect before continuing)

COVERAGE CHECK — if below threshold:
  Run npm run test:coverage and look at the report
  Add missing test cases to the relevant test file (do not create new test files)
  Common gaps: ConceptTags click callbacks, DetailPanel close button, edge cases in
  StreamingDefinition error handling

FILE AUDIT — confirm all these files exist:
  components/ui/StreamingDefinition.tsx
  components/ui/ConceptTags.tsx
  components/ui/DetailPanel.tsx
  components/ui/NodeTooltip.tsx
  components/ui/ZoomControls.tsx
  components/ui/Legend.tsx
  components/ui/LoadingBloom.tsx
  components/ui/EmptyState.tsx
  components/layout/Toolbar.tsx
  tests/components/StreamingDefinition.test.tsx
  tests/components/DetailPanel.test.tsx

Update PROGRESS.md: mark P3.6 complete, Phase 3 complete.
Update CHANGELOG.md: "[DATE] — Phase 3 — UI & Interaction complete: full end-to-end
user flow working, all components built and tested."
Phase 3 is done. Next: PHASE4ROADMAP.md → P4.1.
```
