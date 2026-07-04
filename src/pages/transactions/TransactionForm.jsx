import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import AccountSelect from '../../components/AccountSelect'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import { useAppContext } from '../../context/AppContext'

const emptyForm = {
  type: 'expense',
  category: '',
  amount: '',
  currency: 'PKR',
  account: '',
  date: '',
  description: '',
}

const TransactionForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const {
    transactions,
    categories,
    refreshCategories,
    refreshTransactions,
    refreshAccountBalances,
    addTransaction,
    updateTransaction,
  } = useAppContext()
  const { accountBalances } = useEnsureAccountBalances()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (!editing) return
    const current = transactions.find((item) => item._id === id)
    if (current) {
      setForm({
        type: current.type,
        category: current.category,
        amount: current.amount,
        currency: current.currency,
        account: current.account,
        date: current.date ? current.date.slice(0, 10) : '',
        description: current.description,
      })
    }
  }, [editing, id, transactions])

  useEffect(() => {
    refreshCategories()
    refreshTransactions()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setWarning('')
    const payload = {
      ...form,
      amount: Number(form.amount || 0),
    }
    const selected = accountBalances.find(
      (account) => account.name === form.account,
    )
    const available = Number(selected?.currentBalancePKR ?? 0)
    const spending =
      form.currency === 'USD'
        ? Math.round(Number(payload.amount || 0) * 280)
        : Number(payload.amount || 0)
    if (form.type === 'expense' && form.account && spending > available) {
      setWarning(
        `Insufficient balance. Available PKR ${available.toLocaleString()}.`,
      )
      return
    }
    if (editing) {
      await updateTransaction(id, payload)
    } else {
      await addTransaction(payload)
    }
    refreshAccountBalances()
    navigate('/transactions')
  }

  const conversionPreview =
    form.currency === 'USD'
      ? Math.round(Number(form.amount || 0) * 280)
      : Number(form.amount || 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            {editing ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <p className="text-sm text-app-muted">
            Capture income, expenses, and every campus purchase.
          </p>
        </div>
        <Link to="/transactions">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="">Select a category</option>
              {categories
                .filter((category) => category.type === form.type)
                .map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>
          <Input
            label="Amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            required
          />
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <AccountSelect
            label="Account"
            name="account"
            value={form.account}
            onChange={handleChange}
            placeholder="Select an account"
            required
          />
          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short note about this transaction"
            />
          </div>
          <div className="md:col-span-2 rounded-xl border border-app-border bg-app-surface-soft p-4 text-sm text-app-muted">
            Converted PKR amount: {conversionPreview.toLocaleString()}
          </div>
          {warning ? (
            <div className="md:col-span-2 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {warning}
            </div>
          ) : null}
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">
              {editing ? 'Save Changes' : 'Add Transaction'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/transactions')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default TransactionForm
