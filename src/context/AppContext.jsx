import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const AppContext = createContext(null)

const TOKEN_KEY = 'sem_token'
const USER_KEY = 'sem_user'
const VERIFY_BANNER_DISMISSED_KEY = 'sem_verify_banner_dismissed'
const SETUP_BANNER_DISMISSED_KEY = 'sem_setup_banner_dismissed'

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      localStorage.removeItem(USER_KEY)
      return null
    }
  })
  const [accounts, setAccounts] = useState([])
  const [accountBalances, setAccountBalances] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loans, setLoans] = useState([])
  const [transfers, setTransfers] = useState([])
  const [exchangeRate, setExchangeRate] = useState(null)
  const [verificationBannerDismissed, setVerificationBannerDismissed] = useState(
    () => sessionStorage.getItem(VERIFY_BANNER_DISMISSED_KEY) === 'true',
  )
  const [setupBannerDismissed, setSetupBannerDismissed] = useState(
    () => sessionStorage.getItem(SETUP_BANNER_DISMISSED_KEY) === 'true',
  )

  const isAuthenticated = Boolean(token)

  const dismissVerificationBanner = () => {
    sessionStorage.setItem(VERIFY_BANNER_DISMISSED_KEY, 'true')
    setVerificationBannerDismissed(true)
  }

  const dismissSetupBanner = () => {
    sessionStorage.setItem(SETUP_BANNER_DISMISSED_KEY, 'true')
    setSetupBannerDismissed(true)
  }

  const refreshUser = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return null
    const response = await api.getMe(activeToken)
    if (response.data) {
      setUser(response.data)
      localStorage.setItem(USER_KEY, JSON.stringify(response.data))
    }
    return response.data
  }

  const sendVerificationEmail = async () => api.sendVerificationEmail(token)

  const convertToPKR = (amount, currency) => {
    if (!amount) return 0
    if (currency === 'PKR') return Number(amount)
    if (!exchangeRate) return 0
    return Math.round(Number(amount) * exchangeRate)
  }

  const refreshExchangeRate = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return
    const response = await api.getExchangeRate(activeToken)
    setExchangeRate(response.data?.rate ?? null)
  }

  const updateExchangeRate = async (rate) => {
    const response = await api.updateExchangeRate(token, { rate: Number(rate) })
    setExchangeRate(response.data?.rate ?? null)
    return response.data
  }

  const login = async (payload) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await api.login(payload)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      sessionStorage.removeItem(VERIFY_BANNER_DISMISSED_KEY)
      setVerificationBannerDismissed(false)
      sessionStorage.removeItem(SETUP_BANNER_DISMISSED_KEY)
      setSetupBannerDismissed(false)
      const userAccounts = await refreshAccounts(response.token)
      await refreshAccountBalances(response.token)
      const userCategories = await refreshCategories(response.token)
      await refreshTransactions(response.token)
      await refreshLoans(response.token)
      await refreshTransfers(response.token)
      await refreshExchangeRate(response.token)
      const needsOnboarding = userAccounts.length === 0 && userCategories.length === 0
      return { user: response.user, needsOnboarding }
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (payload) => {
    setIsLoading(true)
    setAuthError(null)
    try {
      const response = await api.register(payload)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      sessionStorage.removeItem(VERIFY_BANNER_DISMISSED_KEY)
      setVerificationBannerDismissed(false)
      sessionStorage.removeItem(SETUP_BANNER_DISMISSED_KEY)
      setSetupBannerDismissed(false)
      const userAccounts = await refreshAccounts(response.token)
      await refreshAccountBalances(response.token)
      const userCategories = await refreshCategories(response.token)
      await refreshTransactions(response.token)
      await refreshLoans(response.token)
      await refreshTransfers(response.token)
      await refreshExchangeRate(response.token)
      const needsOnboarding = userAccounts.length === 0 && userCategories.length === 0
      return { user: response.user, needsOnboarding }
    } catch (error) {
      setAuthError(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAccounts([])
    setAccountBalances([])
    setCategories([])
    setTransactions([])
    setLoans([])
    setTransfers([])
    setExchangeRate(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const refreshAccounts = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return []
    const response = await api.getAccounts(activeToken)
    const data = response.data || []
    setAccounts(data)
    return data
  }

  const refreshAccountBalances = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return
    const response = await api.getAccountBalances(activeToken)
    setAccountBalances(response.data || [])
  }

  const refreshCategories = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return []
    const response = await api.getCategories(activeToken)
    const data = response.data || []
    setCategories(data)
    return data
  }

  const addCategory = async (payload) => {
    const response = await api.createCategory(token, payload)
    setCategories((prev) => [response.data, ...prev])
    return response.data
  }

  const deleteCategory = async (id) => {
    await api.deleteCategory(token, id)
    setCategories((prev) => prev.filter((item) => item._id !== id))
  }

  const refreshLoans = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return
    const response = await api.getLoans(activeToken)
    setLoans(response.data || [])
  }

  const addLoan = async (payload) => {
    const response = await api.createLoan(token, payload)
    setLoans((prev) => [response.data, ...prev])
    return response.data
  }

  const updateLoan = async (id, payload) => {
    const response = await api.updateLoan(token, id, payload)
    setLoans((prev) => prev.map((item) => (item._id === id ? response.data : item)))
    return response.data
  }

  const removeLoan = async (id) => {
    await api.deleteLoan(token, id)
    setLoans((prev) => prev.filter((item) => item._id !== id))
  }

  const refreshTransfers = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return
    const response = await api.getTransfers(activeToken)
    setTransfers(response.data || [])
  }

  const addTransfer = async (payload) => {
    const response = await api.createTransfer(token, payload)
    setTransfers((prev) => [response.data, ...prev])
    return response.data
  }

  const updateTransfer = async (id, payload) => {
    const response = await api.updateTransfer(token, id, payload)
    setTransfers((prev) => prev.map((item) => (item._id === id ? response.data : item)))
    return response.data
  }

  const removeTransfer = async (id) => {
    await api.deleteTransfer(token, id)
    setTransfers((prev) => prev.filter((item) => item._id !== id))
  }

  const addAccount = async (payload) => {
    const response = await api.createAccount(token, payload)
    setAccounts((prev) => [response.data, ...prev])
    return response.data
  }

  const updateAccount = async (id, payload) => {
    const response = await api.updateAccount(token, id, payload)
    setAccounts((prev) =>
      prev.map((item) => (item._id === id ? response.data : item)),
    )
    return response.data
  }

  const deleteAccount = async (id) => {
    await api.deleteAccount(token, id)
    setAccounts((prev) => prev.filter((item) => item._id !== id))
  }

  const refreshTransactions = async (overrideToken) => {
    const activeToken = overrideToken || token
    if (!activeToken) return
    const response = await api.getTransactions(activeToken)
    setTransactions(response.data || [])
  }

  const addTransaction = async (payload) => {
    const response = await api.createTransaction(token, payload)
    setTransactions((prev) => [response.data, ...prev])
    return response.data
  }

  const updateTransaction = async (id, payload) => {
    const response = await api.updateTransaction(token, id, payload)
    setTransactions((prev) =>
      prev.map((item) => (item._id === id ? response.data : item)),
    )
    return response.data
  }

  const removeTransaction = async (id) => {
    await api.deleteTransaction(token, id)
    setTransactions((prev) => prev.filter((item) => item._id !== id))
  }

  useEffect(() => {
    if (!token) return
    refreshAccounts()
    refreshAccountBalances()
    refreshCategories()
    refreshTransactions()
    refreshLoans()
    refreshTransfers()
    refreshExchangeRate()
    // Restore session data once when token is available (e.g. page refresh).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Light polling so the "email not verified" state clears itself across
  // the app (banner, feature guards) as soon as the user verifies in
  // another tab, without requiring a logout/login cycle.
  useEffect(() => {
    if (!token || !user || user.emailVerified) return undefined
    const interval = setInterval(() => {
      refreshUser().catch(() => {})
    }, 20000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.emailVerified])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      authError,
      accounts,
      accountBalances,
      categories,
      refreshAccounts,
      refreshAccountBalances,
      refreshCategories,
      refreshTransactions,
      refreshLoans,
      refreshTransfers,
      addAccount,
      updateAccount,
      deleteAccount,
      transactions,
      loans,
      transfers,
      login,
      register,
      logout,
      addTransaction,
      updateTransaction,
      removeTransaction,
      addCategory,
      deleteCategory,
      addLoan,
      updateLoan,
      removeLoan,
      addTransfer,
      updateTransfer,
      removeTransfer,
      exchangeRate,
      convertToPKR,
      refreshExchangeRate,
      updateExchangeRate,
      refreshUser,
      sendVerificationEmail,
      verificationBannerDismissed,
      dismissVerificationBanner,
      setupBannerDismissed,
      dismissSetupBanner,
    }),
    [
      user,
      token,
      accounts,
      accountBalances,
      categories,
      isAuthenticated,
      isLoading,
      authError,
      transactions,
      loans,
      transfers,
      exchangeRate,
      verificationBannerDismissed,
      setupBannerDismissed,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
