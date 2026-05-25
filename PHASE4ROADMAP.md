# Phase 4 Roadmap — Polish & Ship

All prompts are self-contained. Paste one prompt per session. Clear context between sessions.
Update PROGRESS.md at the end of every session before closing.

Phase 3 must be complete before starting here.

---

## Status

```
P4.1  Keyboard shortcuts               ← start here
P4.2  Error handling + edge cases
P4.3  Accessibility audit
P4.4  Performance audit + coverage
P4.5  Security checks + deploy
```

---

## PROMPT P4.1 — Keyboard shortcuts

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/4-polish-ship.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
The full keyboard shortcut system. Six shortcuts are spec'd. Each one must work without
interfering with typing in the search bar (most shortcuts are no-ops when the search
input is focused). We implement all six in a single useKeyboard hook rather than
scattering keydown listeners across components.

FILE — lib/hooks/useKeyboard.ts
Mark as 'use client' (it uses useEffect for event listeners).

This hook attaches a single keydown listener to the document. It takes callbacks for
each shortcut action.

Props (passed as an object):
  activeNodeId: string | null
  isSearchFocused: boolean          // true when the search input has focus
  nodes: ConceptNode[]
  edges: ConceptEdge[]
  onEscape: () => void              // close panel or blur search
  onSpace: () => void               // zoom to fit
  onClearGraph: () => void          // Backspace — triggers confirmation, same as Toolbar clear
  onExpandNode: (nodeId: string) => void   // E key
  onNavigate: (nodeId: string) => void     // Arrow keys — move selection

The hook must NEVER fire when:
  - The user is typing in an <input>, <textarea>, or [contenteditable] element
  - Exception: Escape and ArrowKeys CAN fire when the search bar is focused (to blur it)

Implementation:
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
        || target.isContentEditable

      // Escape: always fires — blurs search or closes panel
      if (e.key === 'Escape') {
        onEscape()
        return
      }

      // All other shortcuts: blocked when input is focused
      if (isInput) return

      if (e.key === ' ') {
        e.preventDefault()  // prevent page scroll
        onSpace()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        onClearGraph()
        return
      }

      if (e.key === 'e' || e.key === 'E') {
        if (activeNodeId) {
          e.preventDefault()
          onExpandNode(activeNodeId)
        }
        return
      }

      if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (!activeNodeId) return
        e.preventDefault()
        const nextId = getNextNode(e.key, activeNodeId, nodes, edges)
        if (nextId) onNavigate(nextId)
        return
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeNodeId, nodes, edges, onEscape, onSpace, onClearGraph, onExpandNode, onNavigate])

Arrow key navigation — getNextNode helper (define in same file or in lib/graph.ts):
  function getNextNode(
    key: string,
    activeNodeId: string,
    nodes: ConceptNode[],
    edges: ConceptEdge[]
  ): string | null
  1. Find all nodes connected to activeNodeId via edges
  2. Find the active node's x,y position
  3. Calculate the angle from the active node to each connected node
  4. Sort connected nodes clockwise from top (0° = 12 o'clock, clockwise)
  5. ArrowRight / ArrowDown → next clockwise node
     ArrowLeft / ArrowUp → previous (counter-clockwise) node
  6. Wraps around (last → first)
  7. Returns the next node's id, or null if no connected nodes exist

Wire the hook in page.tsx's PageContent component:
  useKeyboard({
    activeNodeId: state.activeNodeId,
    isSearchFocused: false,  // track this with a ref: searchBarRef onFocus/onBlur
    nodes: state.nodes,
    edges: state.edges,
    onEscape: () => dispatch({ type: 'SELECT_NODE', nodeId: null }),
    onSpace: () => graphRef.current?.resetZoom(),
    onClearGraph: handleClear,     // triggers confirmation, same as Toolbar button
    onExpandNode: handleExpand,
    onNavigate: (nodeId) => dispatch({ type: 'SELECT_NODE', nodeId }),
  })

For Escape when search is focused: pass an onBlur callback from the SearchBar.
SearchBar needs a ref exposed so page.tsx can track focus. Add an onFocusChange prop:
  onFocusChange?: (focused: boolean) => void
and call it from the input's onFocus and onBlur handlers.

VERIFY (manual only, no automated tests for this hook):
  Open the browser with a graph loaded.

  Escape: with panel open → panel closes.
  Escape: with search focused → search blurs.
  Space: press Space → graph zooms to fit all nodes.
  Backspace: press with no input focused → confirmation dialog appears.
  E: select a node, press E → expansion triggers (same as clicking "Expand").
  ArrowRight: select a ring1 node, press ArrowRight → selection moves to next node.
  ArrowLeft: reverses direction.
  E in search bar: typing "E" in the search bar does NOT trigger expansion.
  Backspace in search bar: deleting text does NOT trigger graph clear.

  npm run type-check   — zero errors
  npm test             — all existing tests still pass

Update PROGRESS.md: mark P4.1 complete, next = P4.2.
```

---

## PROMPT P4.2 — Error handling + edge cases

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/4-polish-ship.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
Five specific edge cases and error behaviours that need to be wired up. Most of these
are small additions to existing files rather than new files. Work through them one at
a time, testing each manually as you go.

ITEM 1 — Search bar shake on empty submit
Already partially implemented in P2.5 (the shake animation was defined). Verify it
works: focus the search bar, press Enter without typing anything — the input should
shake with the CSS animation. If it is not working, check that:
  a. globals.css has @keyframes shake defined
  b. SearchBar adds the shake CSS class and removes it after 400ms
  c. The class toggles correctly (removing prevents re-trigger on next submit)

ITEM 2 — Same-concept-as-core guard
In handleSearch in page.tsx, add a guard:
  if (state.nodes.some(n => n.ring === 'core' &&
      n.label.toLowerCase() === concept.toLowerCase())) {
    // Pulse the core node visually — dispatch a temporary signal
    // The simplest approach: briefly set the core node as the selected node,
    // which triggers the glow state in GraphNode, then deselect after 600ms
    const coreNode = state.nodes.find(n => n.ring === 'core')
    if (coreNode) {
      dispatch({ type: 'SELECT_NODE', nodeId: coreNode.id })
      setTimeout(() => dispatch({ type: 'SELECT_NODE', nodeId: null }), 600)
    }
    return
  }

ITEM 3 — AI network failure toast
In ConceptGraph's expansion useEffect (where /api/expand is fetched), add:
  .catch(err => {
    if (err.name === 'AbortError') return  // component unmounted — ignore
    toast.error("Couldn't reach the AI. Try again.")
    dispatch({ type: 'SET_EXPANDING', nodeId: null })
  })
This requires importing toast from 'react-hot-toast' in ConceptGraph.tsx.
Test by temporarily disabling network in Chrome DevTools and attempting an expansion.

ITEM 4 — Re-centre with no ring1 nodes
In ConceptGraph's expansion useEffect, after parsing the AI response:
  if (parsed.ring1.length === 0) {
    toast("Nothing to expand here.", { icon: '🌱' })
    dispatch({ type: 'SET_EXPANDING', nodeId: null })
    return
  }
This handles the case where the AI returns an empty ring1 array (malformed response
that slips past the fallback check).

ITEM 5 — Zoom-to-fit on new seed and on re-centre
In ConceptGraph.tsx, after ADD_EXPANSION_NODES is processed and nodes update:
  - If the expansion is for depth 0 (new seed): call graphRef.current?.resetZoom()
    after a 600ms delay (wait for simulation to settle)
  - If it is a re-centre expansion: also call resetZoom after 600ms

The graphRef is in page.tsx. Either pass resetZoom as a prop to ConceptGraph, or
expose it through the context. Passing as a prop is simpler:
  In page.tsx: <ConceptGraph onExpansionComplete={() => {
    setTimeout(() => graphRef.current?.resetZoom(), 600)
  }} />
  In ConceptGraph: call props.onExpansionComplete() when ADD_EXPANSION_NODES dispatches.

ITEM 6 — NaN guard verification
In ConceptGraph's tick handler, verify the NaN guard from Phase 2 is wired correctly:
  const nodesRef = useRef(state.nodes)
  useEffect(() => { nodesRef.current = state.nodes }, [state.nodes])
  // In tick handler, use nodesRef.current, not closed-over state.nodes
The NaN guard must reference nodesRef.current to avoid stale closures.
If it is not wired this way, fix it now.

VERIFY (all manual):
  1. Empty submit: search bar shakes, no submission
  2. Same concept: type current core concept in search bar, press Enter — core node pulses
  3. Network off: try to expand — "Couldn't reach the AI" toast appears in peach style
  4. Zoom-to-fit: enter a new concept — after expansion settles, canvas auto-fits to ring1
  5. Re-centre zoom: click "Expand this concept" — after settling, canvas auto-fits again

  npm run type-check   — zero errors
  npm test             — all existing tests still pass

Update PROGRESS.md: mark P4.2 complete, next = P4.3.
```

---

## PROMPT P4.3 — Accessibility audit

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/4-polish-ship.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code until you have confirmed all four.

WHAT WE ARE BUILDING:
A systematic accessibility pass over every interactive element in the app.
This prompt is a checklist-driven audit — work through each item, make the fix,
then move to the next. No new files should be created. All changes are edits to
existing components.

AUDIT CHECKLIST — work through each item:

ITEM 1 — Graph nodes
Verify every GraphNode has:
  role="button"
  tabIndex={0}
  aria-label={`${node.label}, ring ${node.ring}, ${node.category}`}
  aria-pressed={isSelected}
If any of these are missing, add them.

ITEM 2 — SearchBar
Verify the <input> has:
  aria-label="Enter a concept to explore"
Verify submitting on Enter works (test: focus input, press Enter).

ITEM 3 — DetailPanel
Verify the panel wrapper has:
  role="complementary"
  aria-label="Concept detail"
Verify the close button (×) has:
  aria-label="Close detail panel"
Verify pressing Escape closes the panel (already in P3.2 — confirm it works).

ITEM 4 — LoadingBloom
Verify the container has:
  aria-live="polite"
  aria-label="Generating concept map"
When expansion starts, screen readers should announce the loading state.

ITEM 5 — Toolbar icon-only buttons
Every button in Toolbar that has only an icon (no visible text label) must have aria-label.
Check: Clear button, Export button, concept pill × button, zoom buttons.
Add aria-label to any that are missing.

ITEM 6 — ZoomControls
Already has aria-labels from P3.3. Verify they are present.

ITEM 7 — Tab order audit
Open the app in Chrome. Press Tab repeatedly from the browser address bar.
Expected tab order: Toolbar buttons → SearchBar → first visible node → ... → DetailPanel.
If the tab order is wrong or stuck, check tabIndex values.
Graph nodes should be reachable by Tab (they have tabIndex={0}).
The detail panel should be focusable when open.

ITEM 8 — Focus trap verification
Press Tab while the detail panel is open. Focus should not escape to elements behind
the panel. If it does, add a focus trap:
  In DetailPanel, add a useEffect that:
    - Finds all focusable elements within the panel
    - On Tab (no shift): if focus is on last element, move to first
    - On Shift+Tab: if focus is on first element, move to last
  This keeps Tab cycling within the panel while it is open.

ITEM 9 — Colour contrast check
Open DevTools → Accessibility panel (or use axe extension).
Check contrast ratios for:
  - Ring1 node labels against white (#496580 on white = passes AA)
  - Ring2 labels against semi-transparent white (#8AABBC on white = verify)
  - Definition text in panel (#8AABBC on white = verify, may be borderline)
  - Muted text (#BACCDA) — this is intentionally low contrast for decorative text
    only. Ensure no functional text uses this colour.

ITEM 10 — No hover-only affordances
Review every interactive element. If clicking/tapping produces a different result
than hovering, fix it. The expand hint on hover must also be accessible by keyboard.
Graph nodes: Enter key triggers the same as click. Verify.

VERIFY:
  After all fixes, run npm run type-check and npm test — zero errors, all pass.

  Manual keyboard flow (no mouse):
    1. Press Tab until a ring1 node is focused (has visible focus ring or glow)
    2. Press Enter — node selects, panel opens
    3. Press E — expansion triggers
    4. Press Escape — panel closes
    5. Press Tab — focus returns to graph nodes
    6. Press Space — zoom fits to view

  npm run type-check   — zero errors
  npm test             — all tests pass

Update PROGRESS.md: mark P4.3 complete, next = P4.4.
```

---

## PROMPT P4.4 — Performance audit + coverage

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/4-polish-ship.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code unless a specific fix is needed to resolve an audit failure.

WHAT WE ARE BUILDING:
The performance verification pass and the coverage top-up. No new features — just
verification that the performance rules from .claude/rules/code.md are being followed,
and adding edge-case tests to reach the Phase 4 coverage thresholds.

PERFORMANCE CHECK 1 — D3 tick does not trigger React re-renders
Open Chrome DevTools → Performance. Click Record. Wait 5 seconds with the graph
animating (enter a concept if needed). Stop recording.
In the flame chart, look for React component update frames during the simulation.
These appear as purple "Recalculate Style" frames preceded by a React component name.
Expected: NO React component updates during tick. Only D3's direct DOM updates.
If you see React updates on every tick: find the setState call in the tick handler
and remove it. This is the single most important performance rule.

PERFORMANCE CHECK 2 — D3 is not in the initial bundle
Run: npm run build
Then check the initial page bundle size:
  ls -la .next/static/chunks/ | grep -v "^d" | sort -k5 -rn | head -20
D3 should appear as a lazy-loaded chunk (name contains a hash), NOT in the
main pages/_app chunk. If D3 is in the initial bundle, the dynamic import in
ConceptGraph.tsx is not working correctly. Fix: ensure import('d3') is inside
a useEffect (not at module scope, not outside an effect).

PERFORMANCE CHECK 3 — 40-node cap
Explore the graph manually: enter a concept, expand several nodes, re-centre multiple
times. Open DevTools → Console and run:
  document.querySelectorAll('[data-node-id]').length
Expected: never more than 40. If it exceeds 40, pruneGraph is not being called
correctly on RECENTRE. Find the reducer and verify pruneGraph is called.

PERFORMANCE CHECK 4 — Smooth at 35-40 nodes
With 35+ nodes visible, interact with the graph (click, zoom, re-centre).
The animation should stay smooth (~60fps). Check with DevTools → Performance.
If it stutters: look for unnecessary React re-renders (setState during tick).

COVERAGE TOP-UP
Run: npm run test:coverage
Target: lines ≥ 85%, functions ≥ 85%, branches ≥ 80%

If below threshold, look at the coverage report output. It shows which lines and
branches are uncovered. Add missing tests to existing test files (do not create
new test files). From .claude/phases/4-polish-ship.md, these edge cases are
specifically required:

Add to tests/lib/graph.test.ts:
  it('pruneGraph with exactly 40 nodes does not prune any node')
  it('pruneGraph with 41 nodes prunes exactly one node')
  it('recentreGraph where target node is ring2 promotes it to core')

Add to tests/lib/ai/expand.test.ts:
  it('parseExpansionResponse with partial ring1 (fewer than 6 items) returns fallback')

Add to tests/components/SearchBar.test.tsx:
  it('calls onSubmit when input is exactly 100 characters')
  it('does not call onSubmit when input is exactly 101 characters')

After adding tests: run npm test to confirm all pass, then npm run test:coverage
to confirm the threshold is met.

VERIFY before finishing:
  npm run type-check   — zero errors
  npm test             — all tests pass
  npm run test:coverage — lines ≥ 85%, functions ≥ 85%, branches ≥ 80%
  npm run build        — production build succeeds

Update PROGRESS.md: mark P4.4 complete, next = P4.5.
```

---

## PROMPT P4.5 — Security checks + deploy

```
Read CLAUDE.md, .claude/rules/testing.md, .claude/phases/4-polish-ship.md, and
PROGRESS.md in that order. Confirm: current phase, last completed task, next task.
Do not write any code unless a specific fix is needed.

This is the final prompt. Work through every checklist item. Ship when all pass.

SECURITY CHECKS (from .claude/rules/security.md):

CHECK 1 — API key not in client bundle:
  npm run build
  grep -r "sk-ant-" .next/static/ 2>/dev/null && echo "LEAK DETECTED" || echo "Clean"
  Expected: "Clean". If "LEAK DETECTED": find the import of process.env.ANTHROPIC_API_KEY
  that is not in a server-side file and remove it immediately.

CHECK 2 — Rate limit works:
  With npm run dev running, send 16 rapid requests to /api/expand:
    for i in $(seq 1 16); do
      curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/expand \
        -H "Content-Type: application/json" \
        -d '{"concept":"test","depth":0}'
    done
  The 16th response should be 429. If not, check the isRateLimited function in the
  route handler.

CHECK 3 — Input injection:
  In the browser, type this in the search bar and press Enter:
    <script>alert(1)</script>
  Expected: renders as the literal text in the core node, no alert fires.
  If an alert fires: find where the concept label is being rendered with
  dangerouslySetInnerHTML and switch to a text node.

CHECK 4 — Empty body:
  curl -X POST http://localhost:3000/api/expand \
    -H "Content-Type: application/json" \
    -d '{}'
  Expected: 400 with {"error":"Missing concept","code":"MISSING_CONCEPT"}

CHECK 5 — Oversized input:
  curl -X POST http://localhost:3000/api/expand \
    -H "Content-Type: application/json" \
    -d '{"concept":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}'
  Expected: 400 with {"error":"Concept too long","code":"CONCEPT_TOO_LONG"}

FULL FLOW MANUAL TEST:
  1. Enter "creativity" → expansion → 6 ring1 nodes appear
  2. Click a ring1 node → panel slides in → definition streams
  3. Click a related tag → new node appears
  4. Click "Expand this concept" → graph re-centres smoothly, new ring1 nodes appear
  5. Old core is now ring2
  6. Export → valid JSON downloaded, contains nodes and edges arrays
  7. Keyboard: Tab to a node, Enter to select, E to expand, Escape to close
  8. Arrow keys navigate between connected nodes
  9. Backspace → confirmation, confirm → graph clears → empty state appears
  10. Click "time" example pill → expansion starts

DEPLOY TO VERCEL:
  1. Ensure .env.local is in .gitignore (verify: grep ".env.local" .gitignore)
  2. Commit and push to GitHub main branch
  3. Go to vercel.com → New Project → Import your repository
  4. Framework: Next.js (auto-detected)
  5. Build command: npm run build (default)
  6. Add environment variable: ANTHROPIC_API_KEY = your production API key
  7. Deploy
  8. After deploy, visit the live URL:
     - Enter "ocean" — expansion works end-to-end on production
     - Open DevTools → Console — zero errors
     - Open DevTools → Network — verify no API key in any response headers or body

FINAL AUTOMATED CHECKS:
  npm run type-check   — zero errors
  npm test             — all tests pass
  npm run test:coverage — lines ≥ 85%, functions ≥ 85%, branches ≥ 80%
  npm run build        — succeeds

Update PROGRESS.md: mark P4.5 complete, Phase 4 complete. Add live URL.
Update CHANGELOG.md: "[DATE] — Phase 4 — Polish & Ship complete. Deployed to Vercel."
Update README.md: add the live Vercel URL under "Live:".

Bloom is shipped.
```
