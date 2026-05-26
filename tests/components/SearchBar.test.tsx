import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import SearchBar from '@/components/ui/SearchBar'

describe('SearchBar', () => {
  it('renders with placeholder text "Enter any concept to explore…"', () => {
    render(<SearchBar onSubmit={vi.fn()} />)
    expect(screen.getByPlaceholderText('Enter any concept to explore…')).toBeInTheDocument()
  })

  it('calls onSubmit with trimmed value when Enter is pressed', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  consciousness  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('consciousness')
  })

  it('clears input value after submit', () => {
    render(<SearchBar onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'time' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('')
  })

  it('does not call onSubmit when input is empty', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit when input is only whitespace', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit when input exceeds 100 characters', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a'.repeat(101) } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows inline error message when input exceeds 100 characters', () => {
    render(<SearchBar onSubmit={vi.fn()} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a'.repeat(101) } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Keep it short — one concept at a time')).toBeInTheDocument()
  })

  it('calls onSubmit when input is exactly 100 characters', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a'.repeat(100) } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalledWith('a'.repeat(100))
  })

  it('does not call onSubmit when input is exactly 101 characters', () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'a'.repeat(101) } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onFocusChange with true when input is focused', () => {
    const onFocusChange = vi.fn()
    render(<SearchBar onSubmit={vi.fn()} onFocusChange={onFocusChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(onFocusChange).toHaveBeenCalledWith(true)
  })

  it('calls onFocusChange with false when input is blurred', () => {
    const onFocusChange = vi.fn()
    render(<SearchBar onSubmit={vi.fn()} onFocusChange={onFocusChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(onFocusChange).toHaveBeenCalledWith(false)
  })
})
