import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({ isAuthenticated: false }),
}))

describe('AppRoutes', () => {
  it('redirects unauthenticated users away from protected routes', async () => {
    render(
      <MemoryRouter initialEntries={['/transactions']}>
        <AppRoutes />
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })
})
