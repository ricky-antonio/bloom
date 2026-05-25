# Bloom — Progress

## Current phase
Phase 3 — UI & Interaction

## Completed
<!-- Newest entries go at the top. Never delete entries — they are the audit trail. -->
- [x] P2.5 — SearchBar: components/ui/SearchBar.tsx (pill input, atom icon, sparkles submit, shake animation, inline error, focus border, disabled state), tests/components/SearchBar.test.tsx (7 tests all passing), app/page.tsx wired with HomeContent (useGraphState, dispatch CLEAR_GRAPH+EXPAND_CONCEPT on submit, SearchBar disabled during expansion, 50px toolbar placeholder). globals.css updated with CSS variables + shake keyframe. Zero TS errors, 58 tests passing, 93.29% line coverage, build succeeds.
- [x] P2.4 — ConceptGraph: components/graph/ConceptGraph.tsx (D3 simulation owner; dynamic import of D3, three effects: load/structural/expansion, tick handler updates DOM directly via data-node-id/data-edge-id selectors without React state, nodesRef/edgesRef/stateRef for stale-closure safety, AbortController on expansion cleanup). Added pointerEvents: 'all' to GraphNode <g> to override GraphCanvas inner-group pointer-events: none. page.tsx wired with GraphProvider + Toaster. Zero TS errors, 51 tests passing, 93.66% line coverage, build succeeds.
- [x] P2.3 — GraphNode: components/graph/GraphNode.tsx (all four ring variants with correct radii/font sizes, hover CSS scale, selected drop-shadow filter, isExpanding pulse+spinner ring, aria-label/aria-pressed/role="button"/tabIndex/data-expanding), app/globals.css (spin and pulse keyframes), tests/components/GraphNode.test.tsx (7 tests, all passing). Zero TS errors, 51 tests passing.
- [x] P2.2 — GraphCanvas + GraphEdge: components/graph/GraphCanvas.tsx (SVG container with D3 zoom/pan, forwardRef + useImperativeHandle exposing zoomIn/zoomOut/resetZoom, scaleExtent [0.3, 2.5], pointer-events: none on inner group), components/graph/GraphEdge.tsx (SVG line with data-edge-id, ring-based stroke opacity using #BADDFF, D3 sets x1/y1/x2/y2 on tick). Zero TS errors, 44 tests passing.
- [x] P2.1 — GraphContext: lib/context/GraphContext.tsx — GraphStateContext, graphReducer (all 8 action cases calling lib functions), GraphProvider, useGraphState hook. Added nodeId?: string to EXPAND_CONCEPT in lib/types.ts. Zero TS errors, 44 tests passing.
- [x] P1.6 — Phase 1 final checklist: all automated checks pass (type-check, 44 tests, 94.35% line coverage / 100% function / 79.38% branch, build). API key verified (type: message). Key leak check clean. CI workflow confirmed. Model ID updated to claude-sonnet-4-6 (claude-sonnet-4-20250514 deprecated). Phase 1 complete.
- [x] P1.5 — API routes: app/api/expand/route.ts (streaming SSE, rate limited 15/min/IP, input validated) and app/api/define/route.ts (non-streaming JSON, rate limited, both concept + parentConcept validated). Zero TS errors. 44 tests passing. Build succeeds with both routes listed as Dynamic.
- [x] P1.4 — Force config + AI lib: lib/force.ts (getLinkDistance, getChargeStrength, getCollisionRadius, createSimulation), lib/ai/expand.ts (buildExpansionPrompt, parseExpansionResponse with retry + fallback), tests/lib/ai/expand.test.ts (10 tests, all passing), lib/ai/define.ts (buildDefinitionPrompt, parseDefinitionResponse with retry + fallback), tests/lib/ai/define.test.ts (4 tests, all passing). Coverage: 91.15% lines / 100% functions / 79.38% branches. Zero TS errors. 44 tests total.
- [x] P1.3 — Graph lib: lib/graph.ts (createCoreNode, addExpansionNodes, recentreGraph, pruneGraph, exportGraph), tests/lib/graph.test.ts (20 tests, all passing). Coverage: 96.66% lines / 100% functions / 82.25% branches. Zero TS errors.
- [x] P1.2 — Types + colour lib: lib/types.ts (all shared types, two category fields, GraphAction union, EXPANSION_FALLBACK, DEFINITION_FALLBACK), lib/colour.ts (getNodeColour, CATEGORY_COLOURS), tests/lib/colour.test.ts (8 tests, all passing). Zero TS errors.
- [x] P1.1 — Project setup: Next.js 16 scaffolded, all deps installed, tsconfig strict mode verified, vitest.config.ts created, tests/setup.ts and tests/mocks/anthropic.ts created, npm scripts added (type-check/test/test:watch/test:coverage), .github/workflows/ci.yml created, directory structure created. All three checks pass: zero TS errors, "No test files found" (correct), build succeeds.

- [x] P2.6 — Phase 2 final checklist + post-checklist fixes: (1) viewport centering (initial D3 zoom translate(width/2, height/2).scale(1.4)); (2) node deselect (onDeselect callback, SELECT_NODE null); (3) ring2 node stacking fix (seeded positions: ring1 starts at r=60 circle, ring2 starts at r=180 circle, prevents nodes spawning at origin and falling through the core); (4) removed forceCenter (core fixed at fx/fy, centre force was pulling ring2 inward). Final state: ring1 at ~147px, ring2 at ~351px from core, no stacking. 59 tests, 92.89% line coverage. Phase 2 complete.

## In progress
<!-- none -->

## Known issues
None.

## Setup notes
- Planning/design files preserved from pre-scaffold: CLAUDE.md, DECISIONS.md, PHASE1-4ROADMAP.md, PROGRESS.md, CHANGELOG.md, README.md, bloom-preview.png, .env.example, .env.local, .gitignore
- Added `"types": ["vitest/globals"]` to tsconfig.json so beforeAll/afterAll resolve without a separate tsconfig.test.json
