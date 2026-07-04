import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'

const devToolsEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_RESET === 'true'

const Profile = () => {
  const navigate = useNavigate()
  const {
    user,
    logout,
    token,
    accounts,
    accountBalances,
    refreshAccounts,
    refreshAccountBalances,
    addAccount,
    deleteAccount,
    categories,
    refreshCategories,
    addCategory,
    deleteCategory,
  } = useAppContext()
  const [form, setForm] = useState({ name: '', openingBalancePKR: '' })
  const [categoryForm, setCategoryForm] = useState({ name: '', type: 'expense' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  useEffect(() => {
    refreshAccounts()
    refreshAccountBalances()
    refreshCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAccount = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await addAccount({
        name: form.name,
        openingBalancePKR: Number(form.openingBalancePKR || 0),
      })
      setForm({ name: '', openingBalancePKR: '' })
      refreshAccountBalances()
    } catch (err) {
      setError(err.message || 'Failed to add account.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (event) => {
    event.preventDefault()
    setCategoryError('')
    setCategoryLoading(true)
    try {
      await addCategory({
        name: categoryForm.name,
        type: categoryForm.type,
      })
      setCategoryForm({ name: '', type: 'expense' })
    } catch (err) {
      setCategoryError(err.message || 'Failed to add category.')
    } finally {
      setCategoryLoading(false)
    }
  }

  const handleResetDatabase = async () => {
    const confirmed = window.confirm(
      'Delete ALL users, accounts, transactions, loans, groups, and every other record?\n\nThis cannot be undone. You will need to register again.',
    )
    if (!confirmed) return

    setResetError('')
    setResetMessage('')
    setResetLoading(true)
    try {
      const response = await api.resetDatabase(token)
      setResetMessage(response.message || 'Database cleared.')
      logout()
      navigate('/register', { replace: true })
    } catch (err) {
      setResetError(err.message || 'Failed to reset database.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold text-app-text">Profile</h3>
        <p className="text-sm text-app-muted">
          Manage your personal details and account access.
        </p>
      </div>
      <Card title="User Information">
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Name
            </p>
            <p className="text-base text-app-text">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Email
            </p>
            <p className="text-base text-app-text">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              University
            </p>
            <p className="text-base text-app-text">{user?.university}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Program
            </p>
            <p className="text-base text-app-text">{user?.program}</p>
          </div>
        </div>
      </Card>
      <Card title="Accounts" subtitle="Add your accounts and opening balances.">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleAddAccount}>
          <Input
            label="Account name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="NayaPay"
            required
          />
          <Input
            label="Opening Balance (PKR)"
            name="openingBalancePKR"
            type="number"
            value={form.openingBalancePKR}
            onChange={handleChange}
            placeholder="0"
          />
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Add account'}
            </Button>
          </div>
        </form>
        {error ? (
          <div className="mt-3 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
            {error}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(accountBalances.length ? accountBalances : accounts).map((account) => (
            <div
              key={account._id || account.id}
              className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm"
            >
              <div>
                <div className="text-app-text">{account.name}</div>
                <div className="text-xs text-app-muted">
                  Opening: PKR {Number(account.openingBalancePKR || 0).toLocaleString()}
                </div>
                {'currentBalancePKR' in account ? (
                  <div className="text-xs text-app-muted">
                    Current: PKR {Number(account.currentBalancePKR || 0).toLocaleString()}
                  </div>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deleteAccount(account._id || account.id)
                  refreshAccountBalances()
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {(accountBalances.length ? accountBalances : accounts).length === 0 ? (
            <div className="rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm text-app-muted">
              No accounts yet. Add one above.
            </div>
          ) : null}
        </div>
      </Card>
      <Card title="Categories" subtitle="Add your income and expense categories.">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleAddCategory}>
          <Input
            label="Category name"
            name="name"
            value={categoryForm.name}
            onChange={handleCategoryChange}
            placeholder="Groceries"
            required
          />
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">Type</label>
            <select
              name="type"
              value={categoryForm.type}
              onChange={handleCategoryChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={categoryLoading}>
              {categoryLoading ? 'Saving...' : 'Add category'}
            </Button>
          </div>
        </form>
        {categoryError ? (
          <div className="mt-3 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
            {categoryError}
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm"
            >
              <div>
                <div className="text-app-text">{category.name}</div>
                <div className="text-xs text-app-muted">
                  {category.type === 'expense' ? 'Expense' : 'Income'}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await deleteCategory(category._id)
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          {categories.length === 0 ? (
            <div className="rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm text-app-muted">
              No categories yet. Add one above.
            </div>
          ) : null}
        </div>
      </Card>
      <Card title="Account Actions">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary">Edit Profile</Button>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
      {devToolsEnabled ? (
        <Card
          title="Testing · Database reset"
          subtitle="Clear everything and start fresh (development only)."
        >
          <p className="text-sm text-app-muted">
            Removes all users, accounts, transactions, loans, transfers, and groups from
            the database.
          </p>
          {resetError ? (
            <div className="mt-3 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {resetError}
            </div>
          ) : null}
          {resetMessage ? (
            <div className="mt-3 rounded-xl border border-app-income/30 bg-app-income-muted px-3 py-2 text-xs text-app-income">
              {resetMessage}
            </div>
          ) : null}
          <Button
            className="mt-4"
            variant="danger"
            onClick={handleResetDatabase}
            disabled={resetLoading}
          >
            {resetLoading ? 'Clearing...' : 'Reset database · Sab delete karo'}
          </Button>
        </Card>
      ) : null}
    </div>
  )
}

export default Profile
