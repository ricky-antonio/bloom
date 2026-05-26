import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import EmptyState from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders the wordmark "bloom"', () => {
    render(<EmptyState onSubmit={vi.fn()} />)
    expect(screen.getByText('bloom')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<EmptyState onSubmit={vi.fn()} />)
    expect(screen.getByText('Every idea has roots.')).toBeInTheDocument()
  })

  it('renders all three example concept pills', () => {
    render(<EmptyState onSubmit={vi.fn()} />)
    expect(screen.getByText('consciousness')).toBeInTheDocument()
    expect(screen.getByText('time')).toBeInTheDocument()
    expect(screen.getByText('love')).toBeInTheDocument()
  })

  it('calls onSubmit with "consciousness" when that pill is clicked', async () => {
    const onSubmit = vi.fn()
    render(<EmptyState onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('consciousness'))
    expect(onSubmit).toHaveBeenCalledWith('consciousness')
  })

  it('calls onSubmit with "time" when that pill is clicked', async () => {
    const onSubmit = vi.fn()
    render(<EmptyState onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('time'))
    expect(onSubmit).toHaveBeenCalledWith('time')
  })

  it('calls onSubmit with "love" when that pill is clicked', async () => {
    const onSubmit = vi.fn()
    render(<EmptyState onSubmit={onSubmit} />)
    await userEvent.click(screen.getByText('love'))
    expect(onSubmit).toHaveBeenCalledWith('love')
  })

  it('each pill has an accessible aria-label', () => {
    render(<EmptyState onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Explore concept: consciousness')).toBeInTheDocument()
    expect(screen.getByLabelText('Explore concept: time')).toBeInTheDocument()
    expect(screen.getByLabelText('Explore concept: love')).toBeInTheDocument()
  })
})
