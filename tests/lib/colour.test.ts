import { describe, it, expect } from 'vitest'
import { getNodeColour, CATEGORY_COLOURS } from '../../lib/colour'

describe('getNodeColour', () => {
  it('returns sky border and text for awareness category at ring1', () => {
    const colours = getNodeColour('ring1', 'awareness')
    expect(colours.border).toBe('#BADDFF')
    expect(colours.text).toBe('#3D6E8C')
  })

  it('returns peach border and text for identity category at ring1', () => {
    const colours = getNodeColour('ring1', 'identity')
    expect(colours.border).toBe('#FFDBBB')
    expect(colours.text).toBe('#9E5830')
  })

  it('returns mint border and text for experiential category at ring1', () => {
    const colours = getNodeColour('ring1', 'experiential')
    expect(colours.border).toBe('#BAFFF5')
    expect(colours.text).toBe('#2A8070')
  })

  it('returns category-coloured text for ring2', () => {
    const awareness = getNodeColour('ring2', 'awareness')
    const identity = getNodeColour('ring2', 'identity')
    const experiential = getNodeColour('ring2', 'experiential')

    expect(awareness.text).toBe('#3D6E8C')
    expect(identity.text).toBe('#9E5830')
    expect(experiential.text).toBe('#2A8070')

    expect(awareness.background).toBe('#FFFFFF')
    expect(identity.background).toBe('#FFFFFF')
    expect(experiential.background).toBe('#FFFFFF')
  })

  it('returns category-tinted colours for ring3', () => {
    const awareness = getNodeColour('ring3', 'awareness')
    const identity = getNodeColour('ring3', 'identity')
    const experiential = getNodeColour('ring3', 'experiential')

    expect(awareness.border).toBe('rgba(186, 221, 255, 0.9)')
    expect(identity.border).toBe('rgba(255, 219, 187, 0.9)')
    expect(experiential.border).toBe('rgba(186, 255, 245, 0.9)')

    expect(awareness.text).toBe('#3D6E8C')
    expect(identity.text).toBe('#9E5830')
    expect(experiential.text).toBe('#2A8070')

    expect(awareness.background).toBe('rgba(186, 221, 255, 0.28)')
    expect(identity.background).toBe('rgba(255, 219, 187, 0.28)')
    expect(experiential.background).toBe('rgba(186, 255, 245, 0.28)')
  })

  it('returns sky-200 border for core node', () => {
    const colours = getNodeColour('core', 'awareness')
    expect(colours.border).toBe('#BADDFF')
    expect(colours.text).toBe('#496580')
    expect(colours.background).toBe('#FFFFFF')
  })

  it('returns full-opacity category border for ring2', () => {
    expect(getNodeColour('ring2', 'awareness').border).toBe('#BADDFF')
    expect(getNodeColour('ring2', 'identity').border).toBe('#FFDBBB')
    expect(getNodeColour('ring2', 'experiential').border).toBe('#BAFFF5')
  })

  it('CATEGORY_COLOURS maps each category to its full-opacity border and text', () => {
    expect(CATEGORY_COLOURS.awareness.border).toBe('#BADDFF')
    expect(CATEGORY_COLOURS.awareness.text).toBe('#3D6E8C')
    expect(CATEGORY_COLOURS.identity.border).toBe('#FFDBBB')
    expect(CATEGORY_COLOURS.identity.text).toBe('#9E5830')
    expect(CATEGORY_COLOURS.experiential.border).toBe('#BAFFF5')
    expect(CATEGORY_COLOURS.experiential.text).toBe('#2A8070')
  })
})
