import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import AccountSelect from '../../components/AccountSelect'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import { useAppContext } from '../../context/AppContext'
import { labels } from '../../constants/labels'

const emptyForm = {
  person: '',
  amount: '',
  type: 'Lent',
  fromAccount: '',
  toAccount: '',
  status: 'Pending',
  dateGiven: '',
  dateReturned: '',
}

const LoanForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const {
    loans,
    refreshLoans,
    refreshAccountBalances,
    addLoan,
    updateLoan,
  } = useAppContext()
  const { accountBalances } = useEnsureAccountBalances()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (!editing) return
    const current = loans.find((item) => item._id === id)
    if (current) {
      setForm({
        person: current.person,
        amount: current.amountPKR,
        type: current.type || 'Lent',
        fromAccount: current.fromAccount,
        toAccount: current.toAccount || '',
        status: current.status,
        dateGiven: current.dateGiven ? current.dateGiven.slice(0, 10) : '',
        dateReturned: current.dateReturned ? current.dateReturned.slice(0, 10) : '',
      })
    }
  }, [editing, id, loans])

  useEffect(() => {
    refreshLoans()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setWarning('')
    const payload = {
      person: form.person,
      amountPKR: Number(form.amount || 0),
      type: form.type,
      fromAccount: form.fromAccount,
      toAccount: form.toAccount || undefined,
      status: form.status,
      dateGiven: form.dateGiven,
      dateReturned: form.dateReturned || undefined,
    }

    // Balance validation based on loan type and status
    if (form.type === 'Lent') {
      if (form.status === 'Pending') {
        // Check if fromAccount has enough balance to lend
        const selected = accountBalances.find(
          (account) => account.name === form.fromAccount,
        )
        const available = Number(selected?.currentBalancePKR ?? 0)
        if (form.fromAccount && payload.amountPKR > available) {
          setWarning(
            `Insufficient balance. Available PKR ${available.toLocaleString()}.`,
          )
          return
        }
      }
      // If Returned, toAccount is where money comes back (no validation needed)
    } else if (form.type === 'Borrowed') {
      if (form.status === 'Returned') {
        // Check if fromAccount has enough balance to pay back
        const selected = accountBalances.find(
          (account) => account.name === form.fromAccount,
        )
        const available = Number(selected?.currentBalancePKR ?? 0)
        if (form.fromAccount && payload.amountPKR > available) {
          setWarning(
            `Insufficient balance to pay back. Available PKR ${available.toLocaleString()}.`,
          )
          return
        }
      }
      // If Pending, toAccount receives money (no validation needed)
    }

    if (editing) {
      await updateLoan(id, payload)
    } else {
      await addLoan(payload)
    }
    refreshAccountBalances()
    navigate('/loans')
  }

  const getFromAccountLabel = () => {
    if (form.type === 'Lent') {
      return form.status === 'Pending'
        ? 'From Account · Kis account se diya (Lend From)'
        : 'From Account · Kis account se diya tha (Lent From)'
    }
    return form.status === 'Returned'
      ? 'From Account · Kis account se wapas kiya (Pay Back From)'
      : 'From Account · Zaroori nahi (Not Used)'
  }

  const getToAccountLabel = () => {
    if (form.type === 'Lent') {
      return form.status === 'Returned'
        ? 'To Account · Wapas kahan aaya (Returned To)'
        : 'To Account · Zaroori nahi (Not Used)'
    }
    return form.status === 'Pending'
      ? 'To Account · Paise kahan aaye (Receive To)'
      : 'To Account · Paise kahan aaye thay (Received In)'
  }

  const fromAccountActive =
    (form.type === 'Lent' && form.status === 'Pending') ||
    (form.type === 'Lent' && form.status === 'Returned') ||
    (form.type === 'Borrowed' && form.status === 'Returned')

  const toAccountActive =
    (form.type === 'Lent' && form.status === 'Returned') ||
    (form.type === 'Borrowed' &&
      (form.status === 'Pending' || form.status === 'Returned'))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            {editing ? labels.loans.editLoan : labels.loans.addLoan}
          </h3>
          <p className="text-sm text-app-muted">{labels.loans.formSubtitle}</p>
        </div>
        <Link to="/loans">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            label={labels.loans.person}
            name="person"
            value={form.person}
            onChange={handleChange}
            placeholder="Friend ka naam"
            required
          />
          <Input
            label="Amount (PKR)"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            required
          />
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">{labels.loans.loanType}</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="Lent">Lent · Udhar diya (main ne paise diye)</option>
              <option value="Borrowed">Borrowed · Udhar liya (main ne paise liye)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">{labels.loans.status}</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="Pending">Pending · Abhi baqi hai</option>
              <option value="Returned">Returned · Wapas ho gaya</option>
            </select>
          </div>
          <AccountSelect
            label={getFromAccountLabel()}
            name="fromAccount"
            value={form.fromAccount}
            onChange={handleChange}
            required={fromAccountActive}
            disabled={!fromAccountActive}
            placeholder={fromAccountActive ? 'Select account' : 'Not applicable'}
          />
          <AccountSelect
            label={getToAccountLabel()}
            name="toAccount"
            value={form.toAccount}
            onChange={handleChange}
            required={toAccountActive}
            disabled={!toAccountActive}
            placeholder={toAccountActive ? 'Select account' : 'Not applicable'}
          />
          <Input
            label={form.type === 'Lent' ? labels.loans.dateLent : labels.loans.dateBorrowed}
            name="dateGiven"
            type="date"
            value={form.dateGiven}
            onChange={handleChange}
            required
          />
          <Input
            label={form.type === 'Lent' ? labels.loans.dateReturned : labels.loans.datePaidBack}
            name="dateReturned"
            type="date"
            value={form.dateReturned}
            onChange={handleChange}
          />
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">
              {editing ? 'Save · Save karo' : labels.loans.addLoan}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/loans')}
            >
              Cancel
            </Button>
          </div>
          {warning ? (
            <div className="md:col-span-2 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {warning}
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  )
}

export default LoanForm
