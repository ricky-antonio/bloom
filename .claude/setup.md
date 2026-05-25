# Setup Guide

Step-by-step for a developer who has never seen this project.

---

## 1. Prerequisites

- **Node.js:** 20.x LTS or higher (`node --version` to check)
- **npm:** 10.x or higher (`npm --version` to check)
- **Anthropic account:** You need an API key from console.anthropic.com

No other global tools required. No Docker, no database setup, no external services beyond Anthropic.

---

## 2. Create the project

```bash
npx create-next-app@latest bloom --typescript --tailwind --app --no-src-dir
cd bloom
```

When prompted, select:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No**
- App Router: **Yes**
- Turbopack: **Yes** (default for Next.js 15)
- Import alias: **Yes** (`@/*`)

---

## 3. Install dependencies

```bash
# Runtime dependencies
npm install d3 @anthropic-ai/sdk @tabler/icons-react react-hot-toast

# Type definitions and dev dependencies
npm install -D @types/d3 vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

---

## 4. Environment variables

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=your_key_here
```

**Where to find `ANTHROPIC_API_KEY`:**
1. Go to console.anthropic.com
2. Click your account → API Keys
3. Create a new key named "bloom-dev"
4. Copy the value — it starts with `sk-ant-`

**What breaks if it's wrong:**
- Empty/missing: `/api/expand` and `/api/define` throw 401 immediately
- Expired: same behaviour — the Anthropic SDK will throw an `AuthenticationError`
- The key is used only in server-side route handlers — never exposed to the browser

---

## 5. Configure TypeScript

Edit `tsconfig.json` — ensure these are set:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

`create-next-app` usually sets `strict: true` by default. Verify before proceeding.

---

## 6. Configure Vitest

Create `vitest.config.ts` in the project root:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
      },
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        '*.config.*',
        'app/layout.tsx',
        'app/page.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

Install the React Vitest plugin:
```bash
npm install -D @vitejs/plugin-react
```

---

## 7. Create test setup file

Create `tests/setup.ts`:

```ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally
global.fetch = vi.fn()

// Reset all mocks between tests
afterEach(() => {
  vi.clearAllMocks()
})
```

Create `tests/mocks/anthropic.ts` (empty stub — populated in Phase 1):

```ts
import { vi } from 'vitest'

export const mockStream = vi.fn()
export const mockCreate = vi.fn()

export const mockAnthropicClient = {
  messages: {
    stream: mockStream,
    create: mockCreate,
  },
}

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => mockAnthropicClient),
}))
```

---

## 8. Add npm scripts

Edit `package.json` — add these scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 9. Configure GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm test
      - run: npm run build
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Add `ANTHROPIC_API_KEY` to GitHub repository secrets (Settings → Secrets → Actions).

---

## 10. Verification checklist

Run these before writing any feature code:

```bash
# 1. TypeScript compiles with zero errors
npm run type-check

# 2. Dev server starts
npm run dev
# Open http://localhost:3000 — you should see the Next.js default page

# 3. Test runner finds setup file
npm test
# Should output "No test files found" — that's correct at this point

# 4. Build succeeds
npm run build
```

### Verify Anthropic API key manually

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

Expected: a JSON response with `"type": "message"`.
If you get `{"type":"error","error":{"type":"authentication_error"}}` — your API key is wrong.

---

## 11. No RLS verification needed

This app has no database, no auth, and no server-side user data. There are no RLS policies to verify. The only "access control" is:
- Rate limiting on API routes (15 req/min/IP)
- ANTHROPIC_API_KEY is server-only (never in client bundles)

Verify the API key is not in the client bundle after build:
```bash
npm run build
grep -r "sk-ant-" .next/static/ 2>/dev/null && echo "LEAK DETECTED" || echo "No key leak"
```

This must output "No key leak". If it outputs "LEAK DETECTED", the API key is in a client component — fix immediately.

---

## Vercel deployment

When ready to deploy:

1. Push the repo to GitHub
2. Import the project in vercel.com → New Project
3. Framework preset: Next.js (auto-detected)
4. Add environment variable: `ANTHROPIC_API_KEY` = your production key
5. Deploy

No other configuration needed. Vercel handles the Next.js app router correctly out of the box.
