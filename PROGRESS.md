# Bloom — Progress

## Current phase
Phase 1 — Foundation (in progress)

## Completed
<!-- Newest entries go at the top. Never delete entries — they are the audit trail. -->
- [x] P1.3 — Graph lib: lib/graph.ts (createCoreNode, addExpansionNodes, recentreGraph, pruneGraph, exportGraph), tests/lib/graph.test.ts (20 tests, all passing). Coverage: 96.66% lines / 100% functions / 82.25% branches. Zero TS errors.
- [x] P1.2 — Types + colour lib: lib/types.ts (all shared types, two category fields, GraphAction union, EXPANSION_FALLBACK, DEFINITION_FALLBACK), lib/colour.ts (getNodeColour, CATEGORY_COLOURS), tests/lib/colour.test.ts (8 tests, all passing). Zero TS errors.
- [x] P1.1 — Project setup: Next.js 16 scaffolded, all deps installed, tsconfig strict mode verified, vitest.config.ts created, tests/setup.ts and tests/mocks/anthropic.ts created, npm scripts added (type-check/test/test:watch/test:coverage), .github/workflows/ci.yml created, directory structure created. All three checks pass: zero TS errors, "No test files found" (correct), build succeeds.

## In progress
- [ ] P1.4 — lib/force.ts

## Known issues
None.

## Setup notes
- Planning/design files preserved from pre-scaffold: CLAUDE.md, DECISIONS.md, PHASE1-4ROADMAP.md, PROGRESS.md, CHANGELOG.md, README.md, bloom-preview.png, .env.example, .env.local, .gitignore
- Added `"types": ["vitest/globals"]` to tsconfig.json so beforeAll/afterAll resolve without a separate tsconfig.test.json
