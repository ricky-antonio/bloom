import { render, screen, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import StreamingDefinition from '@/components/ui/StreamingDefinition'
import { DEFINITION_FALLBACK } from '@/lib/types'

const MOCK_DEFINITION = 'Test definition.'
const MOCK_TAGS = ['a', 'b', 'c', 'd']

function flushPromises() {
  return new Promise<void>(resolve => queueMicrotask(resolve))
}

describe('StreamingDefinition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ definition: MOCK_DEFINITION, relatedTags: MOCK_TAGS }),
    } as Response)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows cursor element while streaming is in progress', () => {
    render(<StreamingDefinition concept="x" parentConcept="y" />)
    // On initial render done=false, the cursor span is present
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('removes cursor element when streaming is complete', async () => {
    render(<StreamingDefinition concept="x" parentConcept="y" />)
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('text grows incrementally as fake timer advances', async () => {
    render(<StreamingDefinition concept="x" parentConcept="y" />)

    // Flush the fetch + res.json() promise chain without running the setInterval
    await act(async () => {
      for (let i = 0; i < 5; i++) {
        await flushPromises()
      }
    })

    // setInterval is created but has not fired yet — text is still empty
    const getTextLength = () =>
      (document.querySelector('span')?.textContent ?? '').replace('|', '').length

    expect(getTextLength()).toBe(0)

    // Advance exactly 3 ticks — each tick reveals one character
    await act(async () => {
      vi.advanceTimersByTime(18 * 3)
    })

    expect(getTextLength()).toBe(3)
  })

  it('calls fetch with correct concept and parentConcept in request body', () => {
    render(<StreamingDefinition concept="consciousness" parentConcept="love" />)

    expect(fetch).toHaveBeenCalledWith(
      '/api/define',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: 'consciousness', parentConcept: 'love' }),
      })
    )
  })

  it('aborts fetch on component unmount', () => {
    const abortFn = vi.fn()
    const MockController = class {
      abort = abortFn
      signal = { aborted: false } as AbortSignal
    }
    vi.spyOn(global, 'AbortController').mockImplementation(
      MockController as unknown as typeof AbortController
    )

    const { unmount } = render(<StreamingDefinition concept="x" parentConcept="y" />)
    unmount()

    expect(abortFn).toHaveBeenCalled()
  })

  it('does not call fetch when preloadedText is provided', () => {
    render(<StreamingDefinition concept="x" parentConcept="y" preloadedText="Pre-loaded text here." />)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows cursor initially with preloadedText before animation starts', () => {
    render(<StreamingDefinition concept="x" parentConcept="y" preloadedText="Hello world." />)
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('text is empty before 1.5s delay elapses with preloadedText', async () => {
    render(<StreamingDefinition concept="x" parentConcept="y" preloadedText="Hello world." />)
    await act(async () => { vi.advanceTimersByTime(1000) })
    const text = document.querySelector('span')?.textContent?.replace('|', '').trim() ?? ''
    expect(text).toBe('')
  })

  it('animates character by character after 1.5s delay with preloadedText', async () => {
    render(<StreamingDefinition concept="x" parentConcept="y" preloadedText="Hello world." />)
    // Advance past delay + 3 character ticks
    await act(async () => { vi.advanceTimersByTime(1500 + 18 * 3) })
    const text = document.querySelector('span')?.textContent?.replace('|', '') ?? ''
    expect(text).toBe('Hel')
  })

  it('removes cursor when preloadedText animation completes', async () => {
    render(<StreamingDefinition concept="x" parentConcept="y" preloadedText="Hi." />)
    // 3 chars need 3 ticks to set text + 1 final tick to setDone
    await act(async () => { vi.advanceTimersByTime(1500 + 18 * 4 + 10) })
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('shows fallback text on fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    render(<StreamingDefinition concept="x" parentConcept="y" />)

    await act(async () => {
      // Flush the promise rejection through to the .catch() handler
      for (let i = 0; i < 5; i++) {
        await flushPromises()
      }
    })

    expect(document.querySelector('span')?.textContent).toBe(DEFINITION_FALLBACK.definition)
  })
})
