import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import AccountSelect from '../../components/AccountSelect'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import { useAppContext } from '../../context/AppContext'

const emptyForm = {
  fromAccount: '',
  toAccount: '',
  amount: '',
  currency: 'PKR',
  fee: '',
  feeCurrency: 'PKR',
  date: '',
  description: '',
}

const TransferForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const {
    transfers,
    refreshTransfers,
    refreshAccountBalances,
    addTransfer,
    updateTransfer,
    convertToPKR,
  } = useAppContext()
  const { accountBalances } = useEnsureAccountBalances()
  const editing = Boolean(id)
  const [form, setForm] = useState(emptyForm)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (!editing) return
    const current = transfers.find((item) => item._id === id)
    if (current) {
      setForm({
        fromAccount: current.fromAccount,
        toAccount: current.toAccount,
        amount: current.amountOriginal,
        currency: current.currency,
        fee: current.fee || '',
        feeCurrency: current.feeCurrency || current.currency,
        date: current.date ? current.date.slice(0, 10) : '',
        description: current.description,
      })
    }
  }, [editing, id, transfers])

  useEffect(() => {
    refreshTransfers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setWarning('')
    const feeAmount = Number(form.fee || 0)
    const payload = {
      fromAccount: form.fromAccount,
      toAccount: form.toAccount,
      amountOriginal: Number(form.amount || 0),
      currency: form.currency,
      fee: feeAmount,
      feeCurrency: form.feeCurrency,
      date: form.date,
      description: form.description,
    }
    const selected = accountBalances.find(
      (account) => account.name === form.fromAccount,
    )
    const available = Number(selected?.currentBalancePKR ?? 0)
    const transferAmount = convertToPKR(Number(payload.amountOriginal || 0), form.currency)
    const feePKR = convertToPKR(feeAmount, form.feeCurrency)
    const totalSpending = transferAmount + feePKR
    if (form.fromAccount && totalSpending > available) {
      setWarning(
        `Insufficient balance. Available PKR ${available.toLocaleString()}, Required PKR ${totalSpending.toLocaleString()} (Transfer: ${transferAmount.toLocaleString()} + Fee: ${feePKR.toLocaleString()}).`,
      )
      return
    }
    if (editing) {
      await updateTransfer(id, payload)
    } else {
      await addTransfer(payload)
    }
    refreshAccountBalances()
    navigate('/transfers')
  }

  const conversionPreview = convertToPKR(Number(form.amount || 0), form.currency)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            {editing ? 'Edit Transfer' : 'Add Transfer'}
          </h3>
          <p className="text-sm text-app-muted">
            Keep track of transfers between your accounts.
          </p>
        </div>
        <Link to="/transfers">
          <Button variant="secondary">Back to list</Button>
        </Link>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <AccountSelect
            label="From Account"
            name="fromAccount"
            value={form.fromAccount}
            onChange={handleChange}
            placeholder="Select account"
            required
          />
          <AccountSelect
            label="To Account"
            name="toAccount"
            value={form.toAccount}
            onChange={handleChange}
            placeholder="Select account"
            required
          />
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
          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Transfer Fee (Optional)"
            name="fee"
            type="number"
            value={form.fee}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
          />
          <div className="flex flex-col gap-2 text-sm">
            <label className="font-medium text-app-text">Fee Currency</label>
            <select
              name="feeCurrency"
              value={form.feeCurrency}
              onChange={handleChange}
              className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Input
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Reason for this transfer (e.g., Upwork to Bank)"
            />
          </div>
          <div className="md:col-span-2 rounded-xl border border-app-border bg-app-surface-soft p-4 text-sm text-app-muted">
            <div className="flex justify-between">
              <span>Transfer Amount (PKR):</span>
              <span className="font-medium text-app-text">{conversionPreview.toLocaleString()}</span>
            </div>
            {Number(form.fee || 0) > 0 && (
              <>
                <div className="mt-1 flex justify-between">
                  <span>Fee (PKR):</span>
                  <span className="font-medium text-amber-200">
                    {convertToPKR(Number(form.fee), form.feeCurrency).toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 border-t border-app-border-strong pt-2 flex justify-between">
                  <span>Total Deduction (PKR):</span>
                  <span className="font-medium text-app-text">
                    {(
                      conversionPreview + convertToPKR(Number(form.fee), form.feeCurrency)
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="mt-2 text-xs text-app-muted/70">
                  Note: A fee expense will be automatically created if fee is greater than 0 PKR.
                </p>
              </>
            )}
          </div>
          {warning ? (
            <div className="md:col-span-2 rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {warning}
            </div>
          ) : null}
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit">
              {editing ? 'Save Changes' : 'Add Transfer'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/transfers')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default TransferForm
