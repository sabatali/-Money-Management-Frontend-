import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './api'

describe('api service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends auth header when token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ data: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await api.getAccounts('test-token')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/accounts'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    )
  })

  it('throws an error with message when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Invalid credentials.' }),
      })
    )

    await expect(
      api.login({ email: 'a@b.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials.')
  })

  it('posts JSON body for register', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ token: 'abc', user: { id: '1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await api.register({
      name: 'Test',
      email: 'test@example.com',
      password: 'password123',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    )
  })
})
