export const countsInIncomeHistory = (transaction) => {
  if (transaction.type !== 'income') return true
  return transaction.countInIncomeHistory !== false
}

export const countsInExpenseHistory = (transaction) => {
  if (transaction.type !== 'expense') return true
  return transaction.countInExpenseHistory !== false
}

export const countsInTransactionHistory = (transaction) => {
  if (transaction.type === 'income') return countsInIncomeHistory(transaction)
  return countsInExpenseHistory(transaction)
}

export const isIncomeTotalTransaction = (transaction) =>
  transaction.type === 'income' && countsInIncomeHistory(transaction)

export const isExpenseTotalTransaction = (transaction) =>
  transaction.type === 'expense' && countsInExpenseHistory(transaction)
