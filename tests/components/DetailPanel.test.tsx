import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import type { Dispatch } from 'react'
import DetailPanel from '@/components/ui/DetailPanel'
import { useGraphState } from '@/lib/context/GraphContext'
import type { ConceptNode, GraphState, GraphAction } from '@/lib/types'

vi.mock('@/lib/context/GraphContext', () => ({
  useGraphState: vi.fn(),
}))

vi.mock('@/components/ui/StreamingDefinition', () => ({
  default: ({ preloadedText }: { preloadedText?: string }) => (
    <div data-testid="streaming-definition">{preloadedText ?? 'mock definition'}</div>
  ),
}))

const mockNode: ConceptNode = {
  id: 'node-1',
  label: 'consciousness',
  ring: 'ring1',
  semanticDistance: 'direct',
  category: 'awareness',
  depth: 1,
  relatedTags: ['perception', 'attention', 'self', 'mind'],
  expanded: false,
}

const mockState: GraphState = {
  nodes: [mockNode],
  edges: [],
  activeNodeId: 'node-1',
  seedConcept: '',
  isExpanding: false,
  expansionNodeId: null,
}

describe('DetailPanel', () => {
  // vi.fn() is overly typed as Mock<Procedure|Constructable>; cast via unknown to match typed signatures
  let mockDispatch: Dispatch<GraphAction>
  let mockOnExpand: (nodeId: string) => void
  let mockOnAddTag: (label: string, parentNodeId: string) => void

  beforeEach(() => {
    mockDispatch = vi.fn() as unknown as Dispatch<GraphAction>
    mockOnExpand = vi.fn() as unknown as (nodeId: string) => void
    mockOnAddTag = vi.fn() as unknown as (label: string, parentNodeId: string) => void
    vi.mocked(useGraphState).mockReturnValue({ state: mockState, dispatch: mockDispatch })
  })

  it('does not render when node prop is null', () => {
    vi.mocked(useGraphState).mockReturnValue({
      state: { ...mockState, activeNodeId: null },
      dispatch: mockDispatch,
    })
    const { container } = render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders concept name', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(screen.getByText('consciousness')).toBeInTheDocument()
  })

  it('renders ring badge with accessible label including ring number', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(screen.getByText('Awareness · Ring 1')).toBeInTheDocument()
  })

  it('renders four ConceptTag chips', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    const chips = screen.getAllByRole('button', { name: /Explore concept:/ })
    expect(chips).toHaveLength(4)
  })

  it('"Expand this concept" button calls onExpand with node id', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    fireEvent.click(screen.getByRole('button', { name: /Expand concept:/ }))
    expect(mockOnExpand).toHaveBeenCalledWith('node-1')
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_NODE', nodeId: null })
  })

  it('calls onAddTag when a related tag chip is clicked', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    fireEvent.click(screen.getByRole('button', { name: 'Explore concept: perception' }))
    expect(mockOnAddTag).toHaveBeenCalledWith('perception', 'node-1')
  })

  it('renders close button with aria-label "Close detail panel"', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(screen.getByRole('button', { name: 'Close detail panel' })).toBeInTheDocument()
  })

  it('clicking close button dispatches SELECT_NODE null', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close detail panel' }))
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SELECT_NODE', nodeId: null })
  })

  it('traps focus: Tab from last focusable element wraps to close button', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    const closeBtn = screen.getByRole('button', { name: 'Close detail panel' })
    const expandBtn = screen.getByRole('button', { name: /Expand concept:/ })
    expandBtn.focus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(document.activeElement).toBe(closeBtn)
  })

  it('traps focus: Shift+Tab from close button wraps to expand button', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    const closeBtn = screen.getByRole('button', { name: 'Close detail panel' })
    const expandBtn = screen.getByRole('button', { name: /Expand concept:/ })
    closeBtn.focus()
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(expandBtn)
  })

  it('passes pre-loaded definition to StreamingDefinition when node.definitionPreloaded is set', () => {
    const nodeWithDef: ConceptNode = { ...mockNode, definition: 'A pre-loaded definition text.', definitionPreloaded: true }
    vi.mocked(useGraphState).mockReturnValue({
      state: { ...mockState, nodes: [nodeWithDef] },
      dispatch: mockDispatch,
    })
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(screen.getByTestId('streaming-definition')).toBeInTheDocument()
    expect(screen.getByText('A pre-loaded definition text.')).toBeInTheDocument()
  })

  it('does not pass preloadedText to StreamingDefinition when definitionPreloaded is not set', () => {
    const nodeWithFetchedDef: ConceptNode = { ...mockNode, definition: 'A fetched definition.' }
    vi.mocked(useGraphState).mockReturnValue({
      state: { ...mockState, nodes: [nodeWithFetchedDef] },
      dispatch: mockDispatch,
    })
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    // StreamingDefinition renders with no preloadedText — shows fallback mock text
    expect(screen.getByText('mock definition')).toBeInTheDocument()
  })

  it('renders StreamingDefinition when node has no pre-loaded definition', () => {
    render(<DetailPanel onExpand={mockOnExpand} onAddTag={mockOnAddTag} />)
    expect(screen.getByTestId('streaming-definition')).toBeInTheDocument()
  })
})
