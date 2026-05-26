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
  onNewConcept: vi.fn(),
  isConfirmingClear: false,
  onConfirmClear: vi.fn(),
  onCancelClear: vi.fn(),
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
    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument()
    // No pill text when empty
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

  it('calls onNewConcept when + New concept is clicked', async () => {
    const onNewConcept = vi.fn()
    render(<Toolbar {...defaultProps} onNewConcept={onNewConcept} />)
    await userEvent.click(screen.getByRole('button', { name: /new concept/i }))
    expect(onNewConcept).toHaveBeenCalledOnce()
  })

  it('shows Clear button when onClearRequest provided and nodeCount > 0', () => {
    render(
      <Toolbar
        {...defaultProps}
        seedConcept="love"
        nodeCount={5}
        depth={1}
        onClearRequest={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /clear graph/i })).toBeInTheDocument()
  })

  it('hides normal buttons and shows confirmation UI when isConfirmingClear is true', () => {
    render(
      <Toolbar
        {...defaultProps}
        seedConcept="love"
        nodeCount={10}
        depth={1}
        isConfirmingClear={true}
      />
    )
    expect(screen.getByRole('button', { name: /confirm clear/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel clear/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save map/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /export/i })).not.toBeInTheDocument()
  })

  it('calls onConfirmClear when Confirm clear? is clicked', async () => {
    const onConfirmClear = vi.fn()
    render(
      <Toolbar
        {...defaultProps}
        isConfirmingClear={true}
        onConfirmClear={onConfirmClear}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /confirm clear/i }))
    expect(onConfirmClear).toHaveBeenCalledOnce()
  })

  it('calls onCancelClear when Cancel is clicked', async () => {
    const onCancelClear = vi.fn()
    render(
      <Toolbar
        {...defaultProps}
        isConfirmingClear={true}
        onCancelClear={onCancelClear}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /cancel clear/i }))
    expect(onCancelClear).toHaveBeenCalledOnce()
  })
})
