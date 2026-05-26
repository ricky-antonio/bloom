import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Toolbar from '@/components/layout/Toolbar'

const defaultProps = {
  seedConcept: '',
  nodeCount: 0,
  depth: 0,
  onSave: vi.fn(),
  onExport: vi.fn(),
  isConfirmingNewConcept: false,
  onNewConceptRequest: vi.fn(),
  onConfirmNewConcept: vi.fn(),
  onCancelNewConcept: vi.fn(),
}

describe('Toolbar', () => {
  it('renders the bloom logo', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByText('bloom')).toBeInTheDocument()
  })

  it('always shows the "+ New concept" button', () => {
    render(<Toolbar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /new concept/i })).toBeInTheDocument()
  })

  it('does not show concept pill when seedConcept is empty', () => {
    render(<Toolbar {...defaultProps} seedConcept="" />)
    expect(screen.queryByText(/nodes/)).not.toBeInTheDocument()
  })

  it('shows concept pill when seedConcept is non-empty', () => {
    render(<Toolbar {...defaultProps} seedConcept="consciousness" />)
    expect(screen.getByText('consciousness')).toBeInTheDocument()
  })

  it('shows node count and depth in pill when nodeCount > 0', () => {
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={18} depth={2} />)
    expect(screen.getByText('18 nodes · depth 2')).toBeInTheDocument()
  })

  it('does not show node count when nodeCount is 0', () => {
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={0} depth={0} />)
    expect(screen.queryByText(/nodes/)).not.toBeInTheDocument()
  })

  it('shows Save map and Export buttons when nodeCount > 0', () => {
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={10} depth={1} />)
    expect(screen.getByRole('button', { name: /save map/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
  })

  it('hides Save map and Export buttons when nodeCount is 0', () => {
    render(<Toolbar {...defaultProps} nodeCount={0} />)
    expect(screen.queryByRole('button', { name: /save map/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument()
  })

  it('calls onSave when Save map is clicked', async () => {
    const onSave = vi.fn()
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={5} depth={1} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: /save map/i }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('calls onExport when Export is clicked', async () => {
    const onExport = vi.fn()
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={5} depth={1} onExport={onExport} />)
    await userEvent.click(screen.getByRole('button', { name: /export/i }))
    expect(onExport).toHaveBeenCalledOnce()
  })

  it('calls onNewConceptRequest when + New concept is clicked with existing graph', async () => {
    const onNewConceptRequest = vi.fn()
    render(<Toolbar {...defaultProps} seedConcept="love" nodeCount={5} depth={1} onNewConceptRequest={onNewConceptRequest} />)
    await userEvent.click(screen.getByRole('button', { name: /new concept/i }))
    expect(onNewConceptRequest).toHaveBeenCalledOnce()
  })

  it('calls onConfirmNewConcept directly when + New concept is clicked with no graph', async () => {
    const onConfirmNewConcept = vi.fn()
    render(<Toolbar {...defaultProps} nodeCount={0} onConfirmNewConcept={onConfirmNewConcept} />)
    await userEvent.click(screen.getByRole('button', { name: /new concept/i }))
    expect(onConfirmNewConcept).toHaveBeenCalledOnce()
  })

  it('hides normal buttons and shows confirmation UI when isConfirmingNewConcept is true', () => {
    render(
      <Toolbar
        {...defaultProps}
        seedConcept="love"
        nodeCount={10}
        depth={1}
        isConfirmingNewConcept={true}
      />
    )
    expect(screen.getByRole('button', { name: /confirm new concept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel new concept/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save map/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument()
  })

  it('calls onConfirmNewConcept when Clear map? is clicked', async () => {
    const onConfirmNewConcept = vi.fn()
    render(
      <Toolbar
        {...defaultProps}
        isConfirmingNewConcept={true}
        onConfirmNewConcept={onConfirmNewConcept}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /confirm new concept/i }))
    expect(onConfirmNewConcept).toHaveBeenCalledOnce()
  })

  it('calls onCancelNewConcept when Cancel is clicked', async () => {
    const onCancelNewConcept = vi.fn()
    render(
      <Toolbar
        {...defaultProps}
        isConfirmingNewConcept={true}
        onCancelNewConcept={onCancelNewConcept}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel new concept/i }))
    expect(onCancelNewConcept).toHaveBeenCalledOnce()
  })
})
