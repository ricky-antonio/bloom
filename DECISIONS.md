# Decisions

Every non-obvious architectural choice with its rationale and rejected alternatives.
Add an entry here whenever a meaningful decision is made — during planning or mid-build.

---

## React Context + useReducer for GraphState
**Decision:** GraphState (nodes, edges, activeNodeId, expansionNodeId, seedConcept, isExpanding) is managed via a single `GraphStateContext` with `useReducer`. The context is provided at the page level and consumed by graph and UI components.
**Why:** The graph has complex, interdependent state mutations (re-centre promotes nodes, prunes others, restarts simulation). `useReducer` makes each mutation a named, testable action. A single context avoids deep prop drilling across ConceptGraph → GraphNode → DetailPanel.
**Alternatives rejected:** `useState` in page.tsx — manageable but mutations like `recentreGraph` would need to be implemented inside the component; harder to test. Zustand — adds a dependency and is overkill for a single-page app.
**Date:** 2026-05-24

---

## D3 updates DOM directly on simulation tick
**Decision:** D3's simulation `tick` handler mutates SVG element attributes directly via D3 selection `.attr()`. React state is never updated on tick.
**Why:** A 60fps simulation calling `setState` would trigger 60 React re-renders per second, causing the graph to become unusable under load. D3 owns position data; React owns structure.
**Alternatives rejected:** `useRef` to store positions and `requestAnimationFrame` to batch React updates — adds complexity with no benefit; D3's direct DOM approach is the established pattern.
**Date:** 2026-05-24

---

## Dynamic import for D3
**Decision:** D3 is imported via `const d3 = await import('d3')` inside `ConceptGraph.tsx`'s `useEffect`. Never imported at module level.
**Why:** D3 is ~500kb. A static import would be included in the initial bundle, delaying first paint for a portfolio visitor on a slow connection.
**Alternatives rejected:** Importing only the sub-packages (d3-force, d3-zoom, d3-drag) statically — reduces bundle but still loads before it's needed; dynamic import of the full d3 package is simpler and gets the same result.
**Date:** 2026-05-24

---

## Two category fields on ConceptNode
**Decision:** `ConceptNode` carries two distinct fields:
- `semanticDistance: 'direct' | 'adjacent' | 'tangential' | 'distant'` — used for ring assignment and graph pruning distance calculations
- `category: 'awareness' | 'identity' | 'experiential'` — used for colour coding node borders, text, and edges

**Why:** The original spec's `SemanticCategory = 'direct' | 'adjacent' | 'tangential' | 'distant'` described structural distance, but the AI prompt and visual design use three semantic relationship types for colour. These are orthogonal properties of a node. Collapsing them would either lose the distance information (breaking pruning) or lose the relationship type (breaking colour).
**Alternatives rejected:** Single field with 7 combined values — unreadable and would require complex mapping logic throughout.
**Date:** 2026-05-24

---

## In-memory rate limiting
**Decision:** A `Map<string, number[]>` in each route handler tracks request timestamps per IP. Limit: 15 requests per minute. No external service.
**Why:** No Supabase, no Upstash, no Redis. For a portfolio app the in-memory approach is sufficient. In a serverless environment each instance has its own Map — effective limit per instance, not global. Acceptable for a personal portfolio with low traffic.
**Alternatives rejected:** Vercel's built-in rate limiting (requires Pro plan), Upstash Redis (adds a dependency and account requirement), no rate limiting (risks running up API costs if the page is scraped).
**Date:** 2026-05-24

---

## Ring 3 via promotion, not AI generation
**Decision:** The AI expansion prompt only generates ring1 (6 nodes) and ring2 (12 nodes). Ring 3 nodes are never generated directly — they appear when a node is expanded and previously-ring1 nodes that remain connected are reclassified as ring3.
**Why:** Generating ring3 would add another 6+ items to the AI prompt, increasing token cost and response latency. Ring3 serves a visual purpose (hinting at unexplored territory) that is equally served by demoted ring1 nodes.
**Alternatives rejected:** Explicit ring3 generation in the prompt — adds ~200 tokens per call and AI-assigned ring3 content often duplicates ring2.
**Date:** 2026-05-24

---

## @tabler/icons-react + react-hot-toast
**Decision:** Install both dependencies. `@tabler/icons-react` provides the atom icon used in the SearchBar. `react-hot-toast` provides auto-dismiss toast notifications for AI errors.
**Why:** The SearchBar spec explicitly references `ti-atom`. Building an SVG icon inline means maintaining the path manually. `react-hot-toast` has auto-dismiss, positioning, and accessibility built in — building equivalent functionality would take more code than the library itself.
**Alternatives rejected:** Inline SVG atom — no external dep but harder to maintain. Custom toast component — more code for one notification type.
**Date:** 2026-05-24

---

## Light mode only
**Decision:** No dark mode. The app is light-only.
**Why:** The peach/sky/mint semantic palette is designed specifically against the warm cream background (#F7F4F0). Elevated white surfaces (#FFFFFF) read as "lifted" against cream — this effect disappears on dark backgrounds. Supporting dark mode would require a complete parallel colour system.
**Alternatives rejected:** Dark mode with a desaturated palette — the palette would lose its distinctive warmth and the app would look generic.
**Date:** 2026-05-24

---

## Vercel deployment
**Decision:** Deploy to Vercel.
**Why:** Zero-config for Next.js 15 app router. `ANTHROPIC_API_KEY` set in project environment variables. Automatic preview deployments on push.
**Alternatives rejected:** Netlify — requires a Next.js adapter with occasional compatibility lag on new Next.js versions. Self-hosted — unnecessary operational overhead for a portfolio app.
**Date:** 2026-05-24

---

## No persistence
**Decision:** The graph is session-only. No database, no localStorage, no server-side state.
**Why:** Portfolio app. No auth complexity, no data modelling complexity, no GDPR considerations. All implementation effort goes into the AI interaction and the visual.
**Alternatives rejected:** localStorage persistence — adds state-hydration logic, versioning concerns, and the graph is meant to be a fresh exploration each time.
**Date:** 2026-05-24
