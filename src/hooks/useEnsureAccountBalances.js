import { useEffect } from 'react'
import { useAppContext } from '../context/AppContext'

export const useEnsureAccountBalances = () => {
  const {
    accounts,
    accountBalances,
    refreshAccounts,
    refreshAccountBalances,
  } = useAppContext()

  useEffect(() => {
    refreshAccounts()
    refreshAccountBalances()
  }, [])

  const balancesReady = accountBalances.length > 0

  return {
    accounts,
    accountBalances,
    balancesReady,
  }
}
