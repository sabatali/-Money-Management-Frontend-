import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Logo from '../../components/Logo'
import SearchableChecklist from '../../components/SearchableChecklist'
import { theme } from '../../styles/theme'
import {
  toTitleCasePreview,
  collapseSpaces,
  isOnlyNumbers,
} from '../../utils/textFormat'

const MAX_NAME_LENGTH = 50

const validateCustomName = (rawValue) => {
  const cleaned = collapseSpaces(rawValue)
  if (!cleaned) return { error: 'Name is required.' }
  if (cleaned.length > MAX_NAME_LENGTH) {
    return { error: `Name must be at most ${MAX_NAME_LENGTH} characters.` }
  }
  if (isOnlyNumbers(cleaned)) {
    return { error: 'Name cannot contain only numbers.' }
  }
  return { cleaned }
}

const STEPS = [
  { key: 'accounts', label: 'Accounts' },
  { key: 'categories', label: 'Categories' },
]

const Onboarding = () => {
  const navigate = useNavigate()
  const { token, refreshAccounts, refreshCategories } = useAppContext()

  const [step, setStep] = useState('accounts')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [masterAccounts, setMasterAccounts] = useState([])
  const [masterCategories, setMasterCategories] = useState([])

  const [selectedAccountIds, setSelectedAccountIds] = useState(new Set())
  const [customAccounts, setCustomAccounts] = useState([])
  const [customAccountError, setCustomAccountError] = useState('')

  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set())
  const [customCategories, setCustomCategories] = useState([])
  const [customCategoryError, setCustomCategoryError] = useState('')
  const [customCategoryType, setCustomCategoryType] = useState('expense')
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setLoadError('')
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          api.getMasterAccounts(token),
          api.getMasterCategories(token),
        ])
        if (cancelled) return
        setMasterAccounts(accountsRes.data || [])
        setMasterCategories(categoriesRes.data || [])
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Failed to load setup options.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  const accountItems = useMemo(
    () => [
      ...masterAccounts.map((account) => ({
        id: account._id,
        masterAccountId: account._id,
        name: account.name,
        icon: account.icon,
        group: account.group,
      })),
      ...customAccounts,
    ],
    [masterAccounts, customAccounts],
  )

  const categoryItemsAll = useMemo(
    () => [
      ...masterCategories.map((category) => ({
        id: category._id,
        masterCategoryId: category._id,
        name: category.name,
        icon: category.icon,
        group: category.group,
        type: category.type,
      })),
      ...customCategories,
    ],
    [masterCategories, customCategories],
  )

  const categoryItems = useMemo(() => {
    if (categoryTypeFilter === 'all') return categoryItemsAll
    return categoryItemsAll.filter((item) => item.type === categoryTypeFilter)
  }, [categoryItemsAll, categoryTypeFilter])

  const toggleAccount = (id) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddCustomAccount = (rawValue) => {
    const { cleaned, error } = validateCustomName(rawValue)
    if (error) {
      setCustomAccountError(error)
      return
    }
    setCustomAccountError('')

    const normalized = cleaned.toLowerCase()
    const existing = accountItems.find((item) => item.name.toLowerCase() === normalized)
    if (existing) {
      setSelectedAccountIds((prev) => new Set(prev).add(existing.id))
      return
    }

    const id = `custom-account:${normalized}`
    const newItem = {
      id,
      name: toTitleCasePreview(cleaned),
      icon: '➕',
      group: 'Custom Account',
    }
    setCustomAccounts((prev) => [...prev, newItem])
    setSelectedAccountIds((prev) => new Set(prev).add(id))
  }

  const handleAddCustomCategory = (rawValue) => {
    const { cleaned, error } = validateCustomName(rawValue)
    if (error) {
      setCustomCategoryError(error)
      return
    }
    setCustomCategoryError('')

    const normalized = cleaned.toLowerCase()
    const existing = categoryItemsAll.find(
      (item) => item.name.toLowerCase() === normalized && item.type === customCategoryType,
    )
    if (existing) {
      setSelectedCategoryIds((prev) => new Set(prev).add(existing.id))
      return
    }

    const id = `custom-category:${customCategoryType}:${normalized}`
    const newItem = {
      id,
      name: toTitleCasePreview(cleaned),
      icon: '➕',
      group: customCategoryType === 'income' ? 'Custom (Income)' : 'Custom (Expense)',
      type: customCategoryType,
    }
    setCustomCategories((prev) => [...prev, newItem])
    setSelectedCategoryIds((prev) => new Set(prev).add(id))
  }

  const persistAccounts = async () => {
    if (selectedAccountIds.size === 0) return
    const items = Array.from(selectedAccountIds).map((id) => {
      const item = accountItems.find((entry) => entry.id === id)
      return item.masterAccountId
        ? { masterAccountId: item.masterAccountId }
        : { name: item.name }
    })
    await api.bulkCreateAccounts(token, items)
    await refreshAccounts()
  }

  const persistCategories = async () => {
    if (selectedCategoryIds.size === 0) return
    const items = Array.from(selectedCategoryIds).map((id) => {
      const item = categoryItemsAll.find((entry) => entry.id === id)
      return item.masterCategoryId
        ? { masterCategoryId: item.masterCategoryId }
        : { name: item.name, type: item.type }
    })
    await api.bulkCreateCategories(token, items)
    await refreshCategories()
  }

  const handleContinueFromAccounts = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      await persistAccounts()
      setStep('categories')
    } catch (err) {
      setSubmitError(err.message || 'Failed to save accounts.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = async () => {
    setSubmitError('')
    setSubmitting(true)
    try {
      await persistCategories()
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(err.message || 'Failed to save categories.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkipAll = () => {
    navigate('/', { replace: true })
  }

  const currentStepIndex = STEPS.findIndex((item) => item.key === step)

  return (
    <div className="min-h-screen bg-app-base px-4 py-8 text-app-text md:py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
                Let's get you set up
              </p>
              <h1 className="text-xl font-semibold md:text-2xl">{theme.brand.name}</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSkipAll}
            className="text-xs font-semibold text-app-muted hover:text-app-text"
          >
            Skip for now
          </button>
        </header>

        <div className="flex items-center gap-2">
          {STEPS.map((item, index) => (
            <div key={item.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  index <= currentStepIndex
                    ? 'bg-app-accent text-app-base'
                    : 'bg-app-surface-soft text-app-muted'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  index <= currentStepIndex ? 'text-app-text' : 'text-app-muted'
                }`}
              >
                {item.label}
              </span>
              {index < STEPS.length - 1 ? (
                <div
                  className={`h-px flex-1 ${
                    index < currentStepIndex ? 'bg-app-accent' : 'bg-app-border'
                  }`}
                />
              ) : null}
            </div>
          ))}
        </div>

        {loading ? (
          <Card>
            <p className="py-10 text-center text-sm text-app-muted">
              Loading setup options...
            </p>
          </Card>
        ) : loadError ? (
          <Card>
            <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-sm text-app-expense">
              {loadError}
            </div>
          </Card>
        ) : step === 'accounts' ? (
          <Card
            title="Which accounts do you use?"
            subtitle="Select all that apply. You can add more or edit balances later."
          >
            <SearchableChecklist
              items={accountItems}
              selectedIds={selectedAccountIds}
              onToggle={toggleAccount}
              searchPlaceholder="Search accounts (e.g. HBL, Payoneer, JazzCash)"
              customPlaceholder="Add a custom account (e.g. My Piggy Bank)"
              onAddCustom={handleAddCustomAccount}
              customError={customAccountError}
            />
          </Card>
        ) : (
          <Card
            title="Which categories do you want to track?"
            subtitle="Pick any expense or income categories that apply to you."
          >
            <div className="mb-4 flex gap-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'expense', label: 'Expense' },
                { key: 'income', label: 'Income' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setCategoryTypeFilter(filter.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    categoryTypeFilter === filter.key
                      ? 'bg-app-accent text-app-base'
                      : 'bg-app-surface-soft text-app-muted hover:text-app-text'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <SearchableChecklist
              items={categoryItems}
              selectedIds={selectedCategoryIds}
              onToggle={toggleCategory}
              searchPlaceholder="Search categories (e.g. mess, hostel, tuition)"
              customPlaceholder="Add a custom category"
              onAddCustom={handleAddCustomCategory}
              customError={customCategoryError}
              emptyMessage="No categories match. Try a different search or add a custom one below."
            />

            <div className="mt-3 flex items-center gap-2 text-xs text-app-muted">
              <span>New custom category type:</span>
              {['expense', 'income'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCustomCategoryType(type)}
                  className={`rounded-full px-3 py-1 font-semibold capitalize transition-colors ${
                    customCategoryType === type
                      ? 'bg-app-accent-muted text-app-accent'
                      : 'bg-app-surface-soft text-app-muted hover:text-app-text'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </Card>
        )}

        {submitError ? (
          <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
            {submitError}
          </div>
        ) : null}

        {!loading && !loadError ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-app-muted">
              {step === 'accounts'
                ? `${selectedAccountIds.size} account(s) selected`
                : `${selectedCategoryIds.size} categor${
                    selectedCategoryIds.size === 1 ? 'y' : 'ies'
                  } selected`}
            </div>
            <div className="flex gap-3">
              {step === 'categories' ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('accounts')}
                  disabled={submitting}
                >
                  Back
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={step === 'accounts' ? handleContinueFromAccounts : handleFinish}
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : step === 'accounts'
                    ? 'Continue'
                    : 'Finish setup'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default Onboarding
