import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect } from 'vitest'
import GraphNode from '@/components/graph/GraphNode'
import type { ConceptNode } from '@/lib/types'

const coreNode: ConceptNode = {
  id: 'core-1',
  label: 'consciousness',
  ring: 'core',
  semanticDistance: 'direct',
  category: 'awareness',
  depth: 0,
  fx: 0,
  fy: 0,
}

const ring1Node: ConceptNode = {
  id: 'ring1-1',
  label: 'perception',
  ring: 'ring1',
  semanticDistance: 'direct',
  category: 'experiential',
  depth: 1,
}

function renderNode(props: Parameters<typeof GraphNode>[0]) {
  return render(
    <svg>
      <GraphNode {...props} />
    </svg>
  )
}

describe('GraphNode', () => {
  it('renders core node with correct label text', () => {
    renderNode({ node: coreNode, isSelected: false, isExpanding: false, onSelect: vi.fn() })
    expect(screen.getByText('consciousness')).toBeInTheDocument()
  })

  it('renders core node with "origin" sub-label', () => {
    renderNode({ node: coreNode, isSelected: false, isExpanding: false, onSelect: vi.fn() })
    expect(screen.getByText('origin')).toBeInTheDocument()
  })

  it('renders ring1 node with aria-label including ring and category', () => {
    renderNode({ node: ring1Node, isSelected: false, isExpanding: false, onSelect: vi.fn() })
    expect(
      screen.getByRole('button', { name: 'perception, ring ring1, experiential' })
    ).toBeInTheDocument()
  })

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn()
    renderNode({ node: coreNode, isSelected: false, isExpanding: false, onSelect })
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('core-1')
  })

  it('calls onSelect when Enter key is pressed', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    renderNode({ node: coreNode, isSelected: false, isExpanding: false, onSelect })
    const button = screen.getByRole('button')
    button.focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledOnce()
    expect(onSelect).toHaveBeenCalledWith('core-1')
  })

  it('does not call onSelect when node is already selected and clicked', () => {
    const onSelect = vi.fn()
    renderNode({ node: coreNode, isSelected: true, isExpanding: false, onSelect })
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('calls onDeselect when selected node is clicked', () => {
    const onSelect = vi.fn()
    const onDeselect = vi.fn()
    renderNode({ node: coreNode, isSelected: true, isExpanding: false, onSelect, onDeselect })
    fireEvent.click(screen.getByRole('button'))
    expect(onDeselect).toHaveBeenCalledOnce()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('applies expanding class/attribute when isExpanding is true', () => {
    renderNode({ node: coreNode, isSelected: false, isExpanding: true, onSelect: vi.fn() })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-expanding', 'true')
  })
})
