# Phase 4 — Polish & Ship

**Complete Phase 3 entirely before starting this phase.**

The goal of Phase 4 is a production-ready, accessible, performant app that passes all manual and automated checks and is deployed to Vercel.

---

## What to build

### Keyboard shortcuts
- [ ] `Enter` in search bar — already handled by SearchBar (verify)
- [ ] `Escape` — close detail panel / clear search focus
- [ ] `Space` — re-centre zoom to fit all visible nodes
- [ ] `Backspace` when no input focused — clear graph (with confirmation dialog, same as Toolbar clear)
- [ ] `E` when a node is selected — expand selected node (same as clicking "Expand this concept")
- [ ] Arrow keys — navigate between connected nodes when one is selected

### Error handling completions
- [ ] Search bar shake animation on empty submit (`@keyframes shake` in `globals.css`)
- [ ] Same-concept-as-core guard: pulse existing core node instead of re-expanding
- [ ] Re-centre with no ring1 nodes: show toast "Nothing to expand here", keep old core
- [ ] AI network failure toast: "Couldn't reach the AI. Try again." in peach style

### Graph edge cases
- [ ] D3 NaN position guard in tick handler (already drafted in Phase 2 — verify it's wired)
- [ ] Zoom-to-fit on new seed concept (animate to fit ring1 + core)
- [ ] Zoom-to-fit on re-centre (animate to fit new core + new ring1)
- [ ] Node count badge in Toolbar shows correct count in real time

### Accessibility audit
- [ ] All graph nodes have `role="button"`, `tabIndex={0}`, correct `aria-label`
- [ ] Arrow key navigation cycles through connected nodes when one is selected
- [ ] Detail panel has `role="complementary"`, `aria-label="Concept detail"`
- [ ] Close button has `aria-label="Close detail panel"`
- [ ] Loading state has `aria-live="polite"` with "Generating concept map" announcement
- [ ] All icon-only buttons in Toolbar have `aria-label`
- [ ] Tab order is logical: Toolbar → SearchBar → active node → detail panel
- [ ] No element traps focus unexpectedly

### Performance audit
- [ ] Verify D3 tick does NOT trigger React re-renders (Chrome DevTools → Performance recording during simulation)
- [ ] Verify D3 is not in the initial bundle (`npm run build` → inspect `.next/static/chunks/`)
- [ ] Verify graph stays smooth with 35–40 nodes (test with a deep exploration)
- [ ] Verify `pruneGraph` fires during re-centre and never exceeds 40 nodes

### Pre-deploy checklist
- [ ] `npm run type-check` — zero errors
- [ ] `npm test` — all tests pass
- [ ] `npm run test:coverage` — ≥ 85% lines, ≥ 85% functions, ≥ 80% branches
- [ ] `npm run build` — production build succeeds, no warnings
- [ ] `grep -r "sk-ant-" .next/static/` — no output (key not leaked)
- [ ] Manual security checks from `.claude/rules/security.md`
- [ ] Rate limit test: 16+ requests in 60s → 429 response
- [ ] Input injection test: `<script>alert(1)</script>` as concept → renders as text

### Deploy
- [ ] Push to GitHub `main` branch
- [ ] Import in Vercel — confirm framework auto-detected as Next.js
- [ ] Add `ANTHROPIC_API_KEY` environment variable in Vercel project settings
- [ ] Deploy — verify the live URL works end-to-end
- [ ] Verify no console errors on the live deployment

---

## Key flows to implement

### Keyboard navigation between nodes

When a node is selected, arrow keys move selection to a connected node:
- `ArrowRight` / `ArrowDown`: next connected node (by position, clockwise from 12 o'clock)
- `ArrowLeft` / `ArrowUp`: previous connected node
- Selection wraps around (last → first)

Implementation: attach `keydown` handler at the `document` level when `activeNodeId` is set. Calculate connected nodes from `edges` where `source === activeNodeId` or `target === activeNodeId`. Sort by angle from the active node's position. Move selection to the next/previous in the sorted list.

### Zoom-to-fit implementation

```ts
function zoomToFit(d3: typeof import('d3'), svg: SVGSVGElement, nodes: ConceptNode[]) {
  const padding = 80
  const svgRect = svg.getBoundingClientRect()
  const targetNodes = nodes.filter(n => n.ring === 'core' || n.ring === 'ring1')
  if (targetNodes.length === 0) return

  const xs = targetNodes.map(n => n.x ?? 0)
  const ys = targetNodes.map(n => n.y ?? 0)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)

  const contentW = maxX - minX + padding * 2
  const contentH = maxY - minY + padding * 2
  const scale = Math.min(svgRect.width / contentW, svgRect.height / contentH, 2.5)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const transform = d3.zoomIdentity
    .translate(svgRect.width / 2, svgRect.height / 2)
    .scale(scale)
    .translate(-centerX, -centerY)

  d3.select(svg)
    .transition()
    .duration(600)
    .call(zoomBehaviourRef.current!.transform, transform)
}
```

---

## Tests to write

No new test files in Phase 4 — instead:

- Review all existing tests and ensure coverage is thorough enough to reach the 85% threshold
- Add missing edge-case tests in existing test files where coverage gaps appear in the coverage report
- Specifically verify these are covered:
  - `pruneGraph` with exactly 40 nodes (boundary case — should not prune)
  - `pruneGraph` with 41 nodes (should prune exactly one)
  - `recentreGraph` where the target node is ring2 (not ring1)
  - `parseExpansionResponse` with partial ring1 (fewer than 6 items) — should use fallback
  - SearchBar with exactly 100-character input (boundary — should submit)
  - SearchBar with exactly 101-character input (boundary — should not submit)

---

## Manual verification checklist

Before marking Phase 4 (and the project) complete:

- [ ] **Full flow test:** Enter "creativity", click a ring1 node, read its definition, click a related tag, click "Expand this concept" — the graph re-centres smoothly on the new concept
- [ ] **Keyboard test:** Tab to a node, press Enter to select it, press `E` to expand, press Escape to close the panel — all work without a mouse
- [ ] **Arrow key test:** Select a ring1 node, press ArrowRight — selection moves to a connected ring2 node
- [ ] **Backspace test:** Press Backspace with no input focused — confirmation appears; press Enter to confirm — graph clears
- [ ] **Rate limit test:** Run the rate limit check from `.claude/rules/security.md`
- [ ] **Injection test:** Enter `<script>alert(1)</script>` as a concept — it renders as plain text in the core node
- [ ] **Performance test:** Explore 5 levels deep — graph stays smooth, never exceeds 40 nodes
- [ ] **Export test:** Export button downloads valid JSON; open the file and verify it contains nodes and edges
- [ ] **Live deploy test:** Visit the Vercel URL, enter "ocean" — full expansion works end-to-end on production

---

## Coverage target after this phase
Lines ≥ 85% · Functions ≥ 85% · Branches ≥ 80%
