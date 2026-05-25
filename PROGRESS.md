# Bloom — Progress

## Current phase
Phase 2 — Graph Engine

## Completed
<!-- Newest entries go at the top. Never delete entries — they are the audit trail. -->
- [x] P1.6 — Phase 1 final checklist: all automated checks pass (type-check, 44 tests, 94.35% line coverage / 100% function / 79.38% branch, build). API key verified (type: message). Key leak check clean. CI workflow confirmed. Model ID updated to claude-sonnet-4-6 (claude-sonnet-4-20250514 deprecated). Phase 1 complete.
- [x] P1.5 — API routes: app/api/expand/route.ts (streaming SSE, rate limited 15/min/IP, input validated) and app/api/define/route.ts (non-streaming JSON, rate limited, both concept + parentConcept validated). Zero TS errors. 44 tests passing. Build succeeds with both routes listed as Dynamic.
- [x] P1.4 — Force config + AI lib: lib/force.ts (getLinkDistance, getChargeStrength, getCollisionRadius, createSimulation), lib/ai/expand.ts (buildExpansionPrompt, parseExpansionResponse with retry + fallback), tests/lib/ai/expand.test.ts (10 tests, all passing), lib/ai/define.ts (buildDefinitionPrompt, parseDefinitionResponse with retry + fallback), tests/lib/ai/define.test.ts (4 tests, all passing). Coverage: 91.15% lines / 100% functions / 79.38% branches. Zero TS errors. 44 tests total.
- [x] P1.3 — Graph lib: lib/graph.ts (createCoreNode, addExpansionNodes, recentreGraph, pruneGraph, exportGraph), tests/lib/graph.test.ts (20 tests, all passing). Coverage: 96.66% lines / 100% functions / 82.25% branches. Zero TS errors.
- [x] P1.2 — Types + colour lib: lib/types.ts (all shared types, two category fields, GraphAction union, EXPANSION_FALLBACK, DEFINITION_FALLBACK), lib/colour.ts (getNodeColour, CATEGORY_COLOURS), tests/lib/colour.test.ts (8 tests, all passing). Zero TS errors.
- [x] P1.1 — Project setup: Next.js 16 scaffolded, all deps installed, tsconfig strict mode verified, vitest.config.ts created, tests/setup.ts and tests/mocks/anthropic.ts created, npm scripts added (type-check/test/test:watch/test:coverage), .github/workflows/ci.yml created, directory structure created. All three checks pass: zero TS errors, "No test files found" (correct), build succeeds.

## In progress
- [ ] P2.1 — GraphContext: lib/context/GraphContext.tsx (React Context + useReducer, all GraphAction cases, dispatch wiring)

## Known issues
None.

## Setup notes
- Planning/design files preserved from pre-scaffold: CLAUDE.md, DECISIONS.md, PHASE1-4ROADMAP.md, PROGRESS.md, CHANGELOG.md, README.md, bloom-preview.png, .env.example, .env.local, .gitignore
- Added `"types": ["vitest/globals"]` to tsconfig.json so beforeAll/afterAll resolve without a separate tsconfig.test.json
