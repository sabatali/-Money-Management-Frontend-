import { describe, expect, it } from 'vitest'
import {
  buildPairwiseNetSettlements,
  buildSettlementSuggestions,
} from './groupSettlements'

describe('groupSettlements', () => {
  it('nets opposite debts between two members into one payment', () => {
    const balances = [
      { userId: 'a', user: 'A', balance: 100 },
      { userId: 'b', user: 'B', balance: -100 },
    ]
    const expenses = [
      {
        paidBy: 'a',
        splits: [
          { user: 'a', shareAmountPKR: 500 },
          { user: 'b', shareAmountPKR: 500 },
        ],
        totalAmountPKR: 1000,
      },
      {
        paidBy: 'b',
        splits: [
          { user: 'a', shareAmountPKR: 400 },
          { user: 'b', shareAmountPKR: 400 },
        ],
        totalAmountPKR: 800,
      },
    ]

    const pairwise = buildPairwiseNetSettlements(expenses, [], balances)
    expect(pairwise).toHaveLength(1)
    expect(pairwise[0]).toMatchObject({
      fromUserId: 'b',
      toUserId: 'a',
      amount: 100,
    })

    const suggestions = buildSettlementSuggestions(balances)
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].amount).toBe(100)
  })
})
