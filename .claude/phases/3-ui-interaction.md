# Phase 3 — UI & Interaction

**Complete Phase 2 entirely before starting this phase.**

The goal of Phase 3 is the full visual experience: detail panel with streaming definitions, related tags, all overlay UI components, and the complete wired-up `page.tsx`. By the end, every listed feature in the spec should be working end-to-end.

---

## ⚠️ Visual design is already established — do not overwrite it

All UI components below were built to the **premium constellation aesthetic** spec (commit bf05fee). The visual implementation **supersedes** the simpler descriptions in the "Key flows" section of this file. Do not simplify or rewrite any component to match those older descriptions — they are outdated.

The canonical visual spec lives in the commit message and PROGRESS.md (P3.1 entry). When writing tests or adding NodeTooltip, match the existing aesthetic.

Key design facts to preserve:
- Fonts: Playfair Display italic (core/ring1 labels, wordmark, detail card concept word) + Inter (everything else). Variables: `var(--font-display)` / `var(--font-sans)`.
- Page background: `linear-gradient(135deg, #FDF8F2 0%, #F5F0E8 45%, #F0EEF5 100%)` + three ambient wash divs.
- Toolbar: 48px, `rgba(253,248,242,0.75)` glass, `backdrop-filter: blur(10px)`.
- Core node: 76px diameter, `pulse-core` CSS animation, ghost ring, sky glow halo.
- Ring 1 nodes: 60px diameter, per-node float animation (`float-1`…`float-8`), category glow halo.
- Ring 2 nodes: 38px diameter, per-node drift animation (`drift-1`…`drift-3`).
- DetailPanel: fixed right 14px / top 56px / width 216px / border-radius 22px. Hero section with per-category gradient + decorative circles + ring badge + Playfair concept word + depth pips. Body with streaming definition + tag chips + expand button. Slides in from right (`slide-in-right` keyframe). Escape dispatches `SELECT_NODE null`.
- EmptyState: Playfair Display 48px italic wordmark in `#FFDBBB`, `pulse-bg` radial background.
- LoadingBloom: four-petal SVG (`spin 3s` + staggered `pulse` per petal), "Growing your idea…" in `#BACCDA`.
- Component name is `ConceptTag.tsx` (singular), not `ConceptTags.tsx`.

---

## What to build

- [x] Create `components/ui/StreamingDefinition.tsx` — character-by-character definition reveal
- [ ] Write `tests/components/StreamingDefinition.test.tsx` — all tests passing
- [x] Create `components/ui/ConceptTag.tsx` — clickable tag chip (name is singular, not ConceptTags)
- [x] Create `components/ui/DetailPanel.tsx` — premium slide-in card (hero + body, reads from context)
- [ ] Write `tests/components/DetailPanel.test.tsx` — all tests passing
- [ ] Create `components/ui/NodeTooltip.tsx` — hover tooltip showing ring + category (match existing aesthetic)
- [x] Create `components/ui/ZoomControls.tsx` — +/−/reset glass buttons (bottom-right)
- [x] Create `components/ui/Legend.tsx` — category colour legend (bottom-left)
- [x] Create `components/ui/LoadingBloom.tsx` — animated four-petal SVG loading state
- [x] Create `components/ui/EmptyState.tsx` — pre-search state with wordmark + three example pills
- [x] Create `components/layout/Toolbar.tsx` — glass toolbar with logo, concept pill, node count, Clear, Export
- [x] Add `react-hot-toast` `<Toaster>` in `app/layout.tsx`
- [x] Complete `app/page.tsx` — all components wired, all state flows connected

---

## Key flows to implement

> **Note:** The components marked [x] above are already implemented. The descriptions below are the original functional specs. Where the existing implementation differs visually (richer styling, premium design), the existing code is correct — do not revert it. Only consult these specs for understanding the data flow and test cases.

### StreamingDefinition (`components/ui/StreamingDefinition.tsx`)

Fetches from `/api/define` and animates the definition character-by-character. Uses fake timers in tests.

```tsx
useEffect(() => {
  setText('')
  setDone(false)
  const controller = new AbortController()

  fetch('/api/define', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept, parentConcept }),
    signal: controller.signal,
  })
    .then(async res => {
      const data = await res.json()
      const full = data.definition as string
      let i = 0
      const interval = setInterval(() => {
        if (i < full.length) {
          setText(full.slice(0, ++i))
        } else {
          clearInterval(interval)
          setDone(true)
        }
      }, 18)
    })
    .catch(() => {
      // AbortError on unmount is expected — ignore it
    })

  return () => controller.abort()
}, [concept, parentConcept])
```

On fetch failure (non-abort): show the fallback definition text.

### DetailPanel (`components/ui/DetailPanel.tsx`)

```
position: fixed
right: 16px
top: 66px
width: 224px
```

Entry animation: `transform: translateX(240px) → translateX(0)`, `200ms ease`.

Panel contents (top to bottom):
1. Ring badge pill — category colour, "Ring N" label
2. Concept name — 20px/700, `#496580`
3. `StreamingDefinition` — 11px/400, `#8AABBC`
4. "Related concepts" label — muted, 9px
5. `ConceptTags` — four chips, each a different accent colour
6. "Expand this concept" button — calls `onExpand(node.id)`

Clicking a related tag calls `onAddTag(label, node.id)` which dispatches `ADD_TAG_NODE`.

Escape key: call `onClose()` which dispatches `SELECT_NODE` with `null`.

### EmptyState (`components/ui/EmptyState.tsx`)

Shown when `nodes.length === 0` and `!isExpanding`.

Three example concept pills: `consciousness`, `time`, `love`.
Clicking any pill calls `onSubmit(concept)` — same as typing in the SearchBar.

Background: very slow radial gradient pulse. Use CSS `@keyframes` in `globals.css`:
```css
@keyframes pulse-bg {
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.07; }
}
```

### LoadingBloom (`components/ui/LoadingBloom.tsx`)

Shown when `isExpanding` and `nodes.length === 0` (first expansion only).

Four petal shapes arranged around a centre. Each petal is an SVG ellipse or a styled `<div>` with `border-radius`. Rotation: `animation: spin 3s linear infinite`. Tagline: "Growing your idea…" in `#BACCDA`, 12px.

### Toolbar (`components/layout/Toolbar.tsx`)

```
[bloom]  [atom-icon · consciousness ×]  [24 nodes]    [Clear] [Export]
```

- "Clear" button: shows a confirmation step before dispatching `CLEAR_GRAPH`
- "Export" button: calls `exportGraph(state)` and triggers a browser download
- Active concept pill: only shown when `seedConcept` is non-empty; × calls `CLEAR_GRAPH` with confirmation
- Node count: `state.nodes.length === 0` → hidden; else shows `"N nodes"` in `--tx-3`

### ZoomControls (`components/ui/ZoomControls.tsx`)

Three buttons: `+`, `−`, reset (fit-to-view icon).
Buttons call methods exposed from `GraphCanvas` via a `ref` or callback props.

```ts
interface ZoomControlsProps {
  onZoomIn: () => void     // current scale × 1.1
  onZoomOut: () => void    // current scale × 0.9
  onReset: () => void      // zoom-to-fit all visible nodes
}
```

### Complete `app/page.tsx`

```tsx
export default function Page() {
  return (
    <GraphProvider>
      <div className="flex flex-col h-screen bg-[#F7F4F0]">
        <Toolbar />
        <main className="flex-1 relative overflow-hidden">
          <SearchBar />
          <ConceptGraph />     {/* renders EmptyState or LoadingBloom internally */}
          <DetailPanel />
          <ZoomControls />
          <Legend />
        </main>
      </div>
    </GraphProvider>
  )
}
```

`ConceptGraph` renders `EmptyState` when `nodes.length === 0 && !isExpanding`.
`ConceptGraph` renders `LoadingBloom` when `isExpanding && nodes.length === 0`.

---

## Tests to write

### `tests/components/StreamingDefinition.test.tsx`

```ts
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

it('shows cursor element while streaming is in progress')
it('removes cursor element when streaming completes')
it('text grows incrementally as fake timer advances')
it('calls fetch with correct concept and parentConcept in request body')
it('aborts fetch on component unmount')
it('shows fallback text on fetch failure')
```

### `tests/components/DetailPanel.test.tsx`

```ts
it('does not render when node prop is null')
it('renders concept name')
it('renders ring badge with accessible label including ring number')
it('renders four ConceptTag chips')
it('"Expand this concept" button calls onExpand with node id')
it('calls onClose when Escape key is pressed')
it('calls onAddTag when a related tag chip is clicked')
```

---

## Manual verification checklist

Before marking Phase 3 complete, verify manually in the browser:

- [ ] Enter "love" — graph appears with ring1 (6 nodes) and ring2 (~12 nodes) in correct colours
- [ ] Three semantic colours are visible on ring1 nodes
- [ ] Click a ring1 node — detail panel slides in from the right
- [ ] Definition streams character by character in the panel
- [ ] Four related tag chips appear below the definition
- [ ] Click a related tag — a new node appears connected to the selected node
- [ ] Click "Expand this concept" — graph re-centres on that node, new ring1 nodes appear
- [ ] Old core node is now at ring2 distance
- [ ] Zoom controls work: + and − change zoom level by ~10%
- [ ] Reset zoom button fits all nodes in the viewport
- [ ] Empty state shows with correct wordmark, tagline, and three example pills
- [ ] Clicking "consciousness" example pill triggers expansion
- [ ] LoadingBloom animation shows during first expansion
- [ ] Clear button requires confirmation before clearing
- [ ] Export button downloads a valid JSON file
- [ ] Toast notification appears when simulating an AI error (temporarily set the API key wrong)
- [ ] `npm run type-check` zero errors, `npm test` all pass, `npm run build` succeeds

---

## Coverage target after this phase
Lines ≥ 78% · Functions ≥ 78% · Branches ≥ 73%
