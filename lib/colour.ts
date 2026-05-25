import type { NodeRing, Category } from './types'

export const CATEGORY_COLOURS: Record<Category, { border: string; text: string }> = {
  awareness: { border: '#BADDFF', text: '#5A8AAA' },
  identity: { border: '#FFDBBB', text: '#C07040' },
  experiential: { border: '#BAFFF5', text: '#40A090' },
}

const RING2_BORDERS: Record<Category, string> = {
  awareness: 'rgba(186, 221, 255, 0.4)',
  identity: 'rgba(255, 219, 187, 0.4)',
  experiential: 'rgba(186, 255, 245, 0.4)',
}

const RING2_TEXT: Record<Category, string> = {
  awareness: '#AACCDC',
  identity: '#E0A880',
  experiential: '#80C8B8',
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
      background: 'rgba(255, 255, 255, 0.6)',
    }
  }
  return {
    border: 'rgba(73, 101, 128, 0.1)',
    text: '#C8D8E4',
    background: 'rgba(255, 255, 255, 0.3)',
  }
}
