const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100

const normalizeId = (value) => String(value?._id || value || '')

export const buildSettlementSuggestions = (balances) => {
  const creditors = balances
    .filter((item) => item.balance > 0)
    .map((item) => ({ ...item }))
    .sort((a, b) => b.balance - a.balance)
  const debtors = balances
    .filter((item) => item.balance < 0)
    .map((item) => ({ ...item, balance: Math.abs(item.balance) }))
    .sort((a, b) => b.balance - a.balance)

  const suggestions = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.balance, creditor.balance)
    if (amount > 0) {
      suggestions.push({
        from: debtor.user,
        fromUserId: debtor.userId,
        to: creditor.user,
        toUserId: creditor.userId,
        amount: roundMoney(amount),
      })
      debtor.balance -= amount
      creditor.balance -= amount
    }
    if (debtor.balance <= 0) i += 1
    if (creditor.balance <= 0) j += 1
  }
  return suggestions
}

const addDirectedDebt = (directed, fromId, toId, amount) => {
  const from = normalizeId(fromId)
  const to = normalizeId(toId)
  const value = roundMoney(amount)
  if (!from || !to || from === to || value <= 0) return

  const forward = `${from}->${to}`
  const reverse = `${to}->${from}`

  if (directed[reverse]) {
    const offset = Math.min(directed[reverse], value)
    directed[reverse] = roundMoney(directed[reverse] - offset)
    const remaining = roundMoney(value - offset)
    if (directed[reverse] <= 0) delete directed[reverse]
    if (remaining > 0) {
      directed[forward] = roundMoney((directed[forward] || 0) + remaining)
    }
    return
  }

  directed[forward] = roundMoney((directed[forward] || 0) + value)
}

const applyDirectedPayment = (directed, fromId, toId, amount) => {
  const from = normalizeId(fromId)
  const to = normalizeId(toId)
  const value = roundMoney(amount)
  if (!from || !to || from === to || value <= 0) return

  const forward = `${from}->${to}`
  let remaining = value

  if (directed[forward]) {
    const cut = Math.min(directed[forward], remaining)
    directed[forward] = roundMoney(directed[forward] - cut)
    remaining = roundMoney(remaining - cut)
    if (directed[forward] <= 0) delete directed[forward]
  }

  if (remaining > 0) {
    addDirectedDebt(directed, to, from, remaining)
  }
}

/** Net owed between each pair after all group expenses and confirmed payments. */
export const buildPairwiseNetSettlements = (expenses, transfers, balances) => {
  const nameById = {}
  balances.forEach((item) => {
    // `_id` on populated expense/transfer refs is the real userId for
    // registered members, and the memberId for guests — key by whichever
    // applies so both resolve to a display name.
    nameById[String(item.userId ?? item.memberId)] = item.user
  })

  const directed = {}

  ;(expenses || []).forEach((expense) => {
    const payerId = normalizeId(expense.paidBy)
    ;(expense.splits || []).forEach((split) => {
      const userId = normalizeId(split.user)
      const share = Number(split.shareAmountPKR || 0)
      if (userId && payerId && userId !== payerId && share > 0) {
        addDirectedDebt(directed, userId, payerId, share)
      }
    })
  })

  ;(transfers || [])
    .filter((transfer) => (transfer.status || 'Pending') === 'Confirmed')
    .forEach((transfer) => {
      applyDirectedPayment(
        directed,
        transfer.fromUser,
        transfer.toUser,
        transfer.amountPKR,
      )
    })

  return Object.entries(directed)
    .filter(([, amount]) => amount > 0)
    .map(([key, amount]) => {
      const [fromUserId, toUserId] = key.split('->')
      return {
        fromUserId,
        toUserId,
        from: nameById[fromUserId] || 'Member',
        to: nameById[toUserId] || 'Member',
        amount: roundMoney(amount),
      }
    })
    .sort((a, b) => b.amount - a.amount)
}

export const getMyPaymentSuggestions = (suggestions, currentUserId) =>
  suggestions.filter(
    (item) => String(item.fromUserId) === String(currentUserId),
  )

export const getMyPairwiseDebts = (pairwise, currentUserId) =>
  pairwise.filter((item) => String(item.fromUserId) === String(currentUserId))
