import { describe, it, expect } from 'vitest'
import { getNodeColour, CATEGORY_COLOURS } from '../../lib/colour'

describe('getNodeColour', () => {
  it('returns sky border and text for awareness category at ring1', () => {
    const colours = getNodeColour('ring1', 'awareness')
    expect(colours.border).toBe('#BADDFF')
    expect(colours.text).toBe('#5A8AAA')
  })

  it('returns peach border and text for identity category at ring1', () => {
    const colours = getNodeColour('ring1', 'identity')
    expect(colours.border).toBe('#FFDBBB')
    expect(colours.text).toBe('#C07040')
  })

  it('returns mint border and text for experiential category at ring1', () => {
    const colours = getNodeColour('ring1', 'experiential')
    expect(colours.border).toBe('#BAFFF5')
    expect(colours.text).toBe('#40A090')
  })

  it('returns muted colours for ring2 regardless of category', () => {
    const awareness = getNodeColour('ring2', 'awareness')
    const identity = getNodeColour('ring2', 'identity')
    const experiential = getNodeColour('ring2', 'experiential')

    expect(awareness.text).toBe('#AACCDC')
    expect(identity.text).toBe('#E0A880')
    expect(experiential.text).toBe('#80C8B8')

    expect(awareness.background).toBe('rgba(255, 255, 255, 0.6)')
    expect(identity.background).toBe('rgba(255, 255, 255, 0.6)')
    expect(experiential.background).toBe('rgba(255, 255, 255, 0.6)')
  })

  it('returns barely-visible colours for ring3 regardless of category', () => {
    const awareness = getNodeColour('ring3', 'awareness')
    const identity = getNodeColour('ring3', 'identity')
    const experiential = getNodeColour('ring3', 'experiential')

    expect(awareness.border).toBe('rgba(73, 101, 128, 0.1)')
    expect(identity.border).toBe('rgba(73, 101, 128, 0.1)')
    expect(experiential.border).toBe('rgba(73, 101, 128, 0.1)')

    expect(awareness.text).toBe('#C8D8E4')
    expect(identity.text).toBe('#C8D8E4')
    expect(experiential.text).toBe('#C8D8E4')

    expect(awareness.background).toBe('rgba(255, 255, 255, 0.3)')
  })

  it('returns sky-200 border for core node', () => {
    const colours = getNodeColour('core', 'awareness')
    expect(colours.border).toBe('#BADDFF')
    expect(colours.text).toBe('#496580')
    expect(colours.background).toBe('#FFFFFF')
  })

  it('returns the correct ring2 border at 40% opacity for each category', () => {
    expect(getNodeColour('ring2', 'awareness').border).toBe('rgba(186, 221, 255, 0.4)')
    expect(getNodeColour('ring2', 'identity').border).toBe('rgba(255, 219, 187, 0.4)')
    expect(getNodeColour('ring2', 'experiential').border).toBe('rgba(186, 255, 245, 0.4)')
  })

  it('CATEGORY_COLOURS maps each category to its full-opacity border and text', () => {
    expect(CATEGORY_COLOURS.awareness.border).toBe('#BADDFF')
    expect(CATEGORY_COLOURS.awareness.text).toBe('#5A8AAA')
    expect(CATEGORY_COLOURS.identity.border).toBe('#FFDBBB')
    expect(CATEGORY_COLOURS.identity.text).toBe('#C07040')
    expect(CATEGORY_COLOURS.experiential.border).toBe('#BAFFF5')
    expect(CATEGORY_COLOURS.experiential.text).toBe('#40A090')
  })
})
