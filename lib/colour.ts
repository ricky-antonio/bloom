import type { NodeRing, Category } from './types'

export const CATEGORY_COLOURS: Record<Category, { border: string; text: string }> = {
  awareness:    { border: '#BADDFF', text: '#3D6E8C' },
  identity:     { border: '#FFDBBB', text: '#9E5830' },
  experiential: { border: '#BAFFF5', text: '#2A8070' },
}

const RING2_BORDERS: Record<Category, string> = {
  awareness:    '#BADDFF',
  identity:     '#FFDBBB',
  experiential: '#BAFFF5',
}

const RING2_TEXT: Record<Category, string> = {
  awareness:    '#3D6E8C',
  identity:     '#9E5830',
  experiential: '#2A8070',
}

export function getNodeColour(
  ring: NodeRing,
  category: Category,
): { border: string; text: string; background: string } {
  if (ring === 'core') {
    return { border: '#BADDFF', text: '#496580', background: '#FFFFFF' }
  }
  if (ring === 'ring1') {
    return {
      border: CATEGORY_COLOURS[category].border,
      text: CATEGORY_COLOURS[category].text,
      background: '#FFFFFF',
    }
  }
  if (ring === 'ring2') {
    return {
      border: RING2_BORDERS[category],
      text: RING2_TEXT[category],
      background: '#FFFFFF',
    }
  }
  // ring3 — category tint, dashed border, clearly visible but less prominent than ring2
  const ring3Tints: Record<Category, { border: string; text: string; background: string }> = {
    awareness:    { border: 'rgba(186, 221, 255, 0.9)', text: '#3D6E8C', background: 'rgba(186, 221, 255, 0.28)' },
    identity:     { border: 'rgba(255, 219, 187, 0.9)', text: '#9E5830', background: 'rgba(255, 219, 187, 0.28)' },
    experiential: { border: 'rgba(186, 255, 245, 0.9)', text: '#2A8070', background: 'rgba(186, 255, 245, 0.28)' },
  }
  return ring3Tints[category]
}
