import { vi } from 'vitest'

export const mockStreamToReadableStream = vi.fn()
export const mockMessagesStream = vi.fn()
export const mockMessagesCreate = vi.fn()

export const mockAnthropicInstance = {
  messages: {
    stream: mockMessagesStream,
    create: mockMessagesCreate,
  },
}

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn(() => mockAnthropicInstance),
}))
