import { describe, expect, it } from 'vitest'
import {
  formatBilingual,
  getLoanStatusLabel,
  getLoanTypeLabel,
  loanStatusBadge,
  loanTypeBadge,
} from '../constants/labels'

describe('labels', () => {
  it('formats bilingual text with separator', () => {
    expect(formatBilingual({ en: 'Lent', ur: 'Udhar diya' })).toBe(
      'Lent · Udhar diya'
    )
  })

  it('returns loan type labels', () => {
    expect(getLoanTypeLabel('Lent').en).toBe('Lent')
    expect(getLoanTypeLabel('Borrowed').ur).toBe('Udhar liya')
  })

  it('falls back for unknown loan type', () => {
    expect(getLoanTypeLabel('Unknown').en).toBe('Lent')
  })

  it('returns loan status labels', () => {
    expect(getLoanStatusLabel('Pending').ur).toBe('Abhi baqi')
    expect(getLoanStatusLabel('Returned').en).toBe('Returned')
  })

  it('builds badge strings', () => {
    expect(loanTypeBadge('Lent')).toBe('Lent · Udhar diya')
    expect(loanStatusBadge('Pending')).toBe('Pending · Abhi baqi')
  })
})
