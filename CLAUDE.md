# Bloom

## Required reading
Before writing any code, read these files in order:
1. CLAUDE.md (this file)
2. .claude/rules/testing.md
3. .claude/phases/<current-phase>.md
4. PROGRESS.md

Confirm you have read all four by stating: the current phase, the last completed task,
and the next task. Do not write a single line of code until this confirmation is complete.

---

**Tagline:** Every idea has roots.
**Status:** Phase 1 — Foundation

---

## Brand
- Name: bloom — always lowercase in UI; title-case "Bloom" in prose only
- Wordmark: Inter 700, `#496580` on light — light mode only, no dark variant
- Icon: A minimal four-petal bloom shape with petals in peach (#FFDBBB), sky (#BADDFF), mint (#BAFFF5), and slate (#BACCDA)
- Voice: Curious, warm, inviting — never academic, never cold

## Stack
- Next.js 15 (app router)
- React 19
- TypeScript — strict mode (`noImplicitAny`, `strictNullChecks`, `strict: true` in tsconfig)
- Tailwind CSS
- D3.js — `d3-force`, `d3-zoom`, `d3-drag` + `@types/d3` — dynamically imported, never at module level
- `@anthropic-ai/sdk` — model `claude-sonnet-4-6`
- `@tabler/icons-react` — icon library (atom icon and others)
- `react-hot-toast` — toast notifications for AI errors
- Inter via `next/font/google`
- Vitest + `@vitest/coverage-v8`
- `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
- jsdom
- GitHub Actions CI

## Environment variables
```
ANTHROPIC_API_KEY
```

## Detailed references
| Topic | File |
|-------|------|
| Pre-build setup & API verification | .claude/setup.md |
| In-memory data model & type system | .claude/schema.md |
| Design system | .claude/design.md |
| Architecture & patterns | .claude/architecture.md |
| Code standards | .claude/rules/code.md |
| Testing rules | .claude/rules/testing.md |
| Security rules | .claude/rules/security.md |
| Phase 1 — Foundation | .claude/phases/1-foundation.md |
| Phase 2 — Graph Engine | .claude/phases/2-graph-engine.md |
| Phase 3 — UI & Interaction | .claude/phases/3-ui-interaction.md |
| Phase 4 — Polish & Ship | .claude/phases/4-polish-ship.md |

## Key decisions
| Decision | Rationale |
|----------|-----------|
| React Context + useReducer for GraphState | Single-page app; useReducer gives predictable state transitions for complex mutations (re-centre, prune, expand); no external library needed |
| D3 updates DOM directly on tick | `setState` on every tick causes 60fps React re-renders and kills performance; D3 owns position data, React owns structure |
| Dynamic import for D3 | D3 is ~500kb; imported only in GraphCanvas via `await import('d3')`; never at module level |
| Two category fields on ConceptNode | `semanticDistance` ('direct'/'adjacent'/'tangential'/'distant') for ring assignment and pruning logic; `category` ('awareness'/'identity'/'experiential') for colour coding — orthogonal properties |
| No database — session only | Portfolio app; no auth complexity; all energy goes into the AI interaction and the visual |
| In-memory rate limiting | No Supabase/Upstash; `Map<string, number[]>` with 15 req/min/IP; sufficient for a portfolio app; resets per serverless instance (acceptable) |
| `@tabler/icons-react` + `react-hot-toast` | SearchBar requires atom icon; error toasts need auto-dismiss behaviour; both small and tree-shakable |
| Ring 3 via promotion, not generation | AI only generates ring1 and ring2; ring3 nodes emerge when a re-centre pushes old ring1 nodes outward; saves tokens and keeps prompts simple |
| No dark mode | The peach/sky/mint palette only works on the warm cream background; dark mode would require a complete colour redesign |
| Vercel deployment | Natural fit for Next.js; zero-config; `ANTHROPIC_API_KEY` set in project env vars |

## Non-goals for v1
- No auth, no user accounts, no server-side sessions
- No database of any kind
- No dark mode
- No mobile-specific layout (desktop-first; responsive to 768px is a bonus, not a requirement)
- No history, undo, or redo — graph state is ephemeral
- No collaboration or sharing
- No Ring 3 generation via AI — Ring 3 emerges from node promotion only

## Loading & responsiveness
Every user action must produce immediate visible feedback. Silence after a click is a bug.

- Async actions: set `loading = true` as the **first** statement in the handler, before any `await`
- Expanding a concept: show pulsing animation on the node before the first AI token arrives
- First expansion: show `LoadingBloom` replacing the empty canvas until ring1 nodes appear
- Destructive actions (Clear graph): require a confirmation step before starting any state change
- Input errors: provide immediate inline feedback — never silent no-ops for the user

## Scaffold command
```bash
npx create-next-app@latest bloom --typescript --tailwind --app --no-src-dir
cd bloom
npm install d3 @anthropic-ai/sdk @tabler/icons-react react-hot-toast
npm install -D @types/d3 vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

---

## Session rules (applied every session)

**Start of every session:**
1. Read CLAUDE.md, the current phase file, and PROGRESS.md
2. State out loud: current phase, last completed task, next task
3. Do not write code until this confirmation is done

**During every session:**
- Authoring order: `types → lib → lib test → component → component test` — no exceptions
- Never move to the next module until the current one's tests pass
- Every async action sets `loading = true` as its first statement — before any `await`
- TypeScript errors must be zero before ending the session

**End of every session:**
```bash
npm run type-check     # zero errors
npm test               # all pass
npm run test:coverage  # above phase threshold
npm run build          # production build succeeds
```

Update PROGRESS.md before closing. Commit only when all four pass.

**A broken session (never acceptable):**
- Skipping tests to move faster
- Committing with failing tests or TypeScript errors
- Calling a phase complete without the manual verification checklist
- Writing a component before its lib functions are tested
- "Looks like it works" without running the end-of-session checklist
