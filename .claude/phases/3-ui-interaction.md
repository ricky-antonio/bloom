# Phase 3 — UI & Interaction

**Complete Phase 2 entirely before starting this phase.**

The goal of Phase 3 is the full visual experience: detail panel with streaming definitions, related tags, all overlay UI components, and the complete wired-up `page.tsx`. By the end, every listed feature in the spec should be working end-to-end.

---

## What to build

- [ ] Create `components/ui/StreamingDefinition.tsx` — character-by-character definition reveal
- [ ] Write `tests/components/StreamingDefinition.test.tsx` — all tests passing
- [ ] Create `components/ui/ConceptTags.tsx` — four clickable tag chips
- [ ] Create `components/ui/DetailPanel.tsx` — slide-in panel with definition, tags, expand button
- [ ] Write `tests/components/DetailPanel.test.tsx` — all tests passing
- [ ] Create `components/ui/NodeTooltip.tsx` — hover tooltip showing ring + category
- [ ] Create `components/ui/ZoomControls.tsx` — +10%, −10%, reset-to-fit buttons
- [ ] Create `components/ui/Legend.tsx` — ring colour legend bottom-left
- [ ] Create `components/ui/LoadingBloom.tsx` — animated four-petal loading state
- [ ] Create `components/ui/EmptyState.tsx` — pre-search state with three example concept pills
- [ ] Create `components/layout/Toolbar.tsx` — logo, active concept pill, node count, Clear, Export
- [ ] Add `react-hot-toast` `<Toaster>` in `app/layout.tsx`
- [ ] Complete `app/page.tsx` — all components wired, all state flows connected

---

## Key flows to implement

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
