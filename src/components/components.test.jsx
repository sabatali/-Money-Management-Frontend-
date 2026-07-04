import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders children and handles click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    await user.click(button)

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies disabled state', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })

  it('supports secondary variant classes', () => {
    render(<Button variant="secondary">Secondary</Button>)

    expect(screen.getByRole('button', { name: 'Secondary' }).className).toMatch(
      /border-app-border-strong/
    )
  })
})

describe('Input', () => {
  it('renders label and updates value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    const { default: Input } = await import('./Input')

    render(
      <Input
        label="Email"
        name="email"
        value=""
        onChange={onChange}
        placeholder="you@email.com"
      />
    )

    await user.type(screen.getByLabelText(/email/i), 'a')

    expect(onChange).toHaveBeenCalled()
  })
})
