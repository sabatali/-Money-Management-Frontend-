export const getAccountBalanceByName = (accountBalances, accountName) => {
  const match = accountBalances.find((item) => item.name === accountName)
  if (!match) return undefined
  return Number(match.currentBalancePKR ?? 0)
}

export const formatAccountOptionLabel = (accountName, accountBalances) => {
  const balance = getAccountBalanceByName(accountBalances, accountName)
  if (balance === undefined) {
    return `${accountName} (PKR …)`
  }
  return `${accountName} (PKR ${balance.toLocaleString()})`
}
