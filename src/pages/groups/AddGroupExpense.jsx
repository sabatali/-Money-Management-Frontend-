import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Navbar from '../../components/Navbar'
import AccountSelect from '../../components/AccountSelect'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import SplitInput from '../../components/SplitInput'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'

const AddGroupExpense = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user, refreshAccountBalances, refreshTransactions, convertToPKR } = useAppContext()
  const { accountBalances } = useEnsureAccountBalances()
  const [group, setGroup] = useState(null)
  const [myGroupAccounts, setMyGroupAccounts] = useState({ linkedAccounts: [], availableAccounts: [] })
  const [form, setForm] = useState({
    title: '',
    totalAmountOriginal: '',
    currency: 'PKR',
    paidBy: '',
    splitType: 'EQUAL',
    accountUsed: '',
    date: '',
  })
  const [manualSplits, setManualSplits] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [warning, setWarning] = useState('')

  const members = group?.members || []

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const [groupRes, myAccountsRes] = await Promise.all([
          api.getGroup(token, id),
          api.getMyGroupAccounts(token, id),
        ])
        setGroup(groupRes.data)
        setMyGroupAccounts(myAccountsRes.data || { linkedAccounts: [], availableAccounts: [] })
        if (user?.id) {
          setForm((prev) => ({
            ...prev,
            paidBy: user.id,
          }))
        }
      } catch (err) {
        setError(err.message || 'Failed to load group.')
      }
    }
    fetchGroup()
  }, [id, token, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const splitInputs = useMemo(() => {
    if (form.splitType !== 'MANUAL') return null
    return members.map((member) => (
      <SplitInput
        key={member.user._id}
        label={member.user.name}
        value={manualSplits[member.user._id] || ''}
        onChange={(event) =>
          setManualSplits((prev) => ({
            ...prev,
            [member.user._id]: event.target.value,
          }))
        }
      />
    ))
  }, [form.splitType, manualSplits, members])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setWarning('')
    setLoading(true)
    
    // Check if user has linked accounts
    if (myGroupAccounts.linkedAccounts.length === 0) {
      setError('Please link your accounts to this group before adding expenses.')
      setLoading(false)
      return
    }
    
    // Check if account is selected and is a linked account
    if (!form.accountUsed || !myGroupAccounts.linkedAccounts.includes(form.accountUsed)) {
      setError('Please select one of your linked accounts.')
      setLoading(false)
      return
    }
    
    try {
      const selected = accountBalances.find(
        (account) => account.name === form.accountUsed,
      )
      const available = Number(selected?.currentBalancePKR ?? 0)
      const spending = convertToPKR(Number(form.totalAmountOriginal || 0), form.currency)
      if (form.accountUsed && spending > available) {
        setWarning(
          `Insufficient balance. Available PKR ${available.toLocaleString()}.`,
        )
        setLoading(false)
        return
      }
      const payload = {
        ...form,
        group: id,
        totalAmountOriginal: Number(form.totalAmountOriginal),
        paidBy: user?.id || form.paidBy,
        splits:
          form.splitType === 'MANUAL'
            ? Object.entries(manualSplits).map(([user, shareAmountPKR]) => ({
                user,
                shareAmountPKR: Number(shareAmountPKR || 0),
              }))
            : [],
      }
      await api.createGroupExpense(token, payload)
      await refreshAccountBalances()
      await refreshTransactions()
      navigate(`/groups/${id}`)
    } catch (err) {
      setError(err.message || 'Failed to add expense.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Navbar title="Add group expense" subtitle={group?.name || 'Loading...'} />
      <Card title="Expense details" subtitle="Track who paid and how it splits.">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Groceries"
            required
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Total amount"
              name="totalAmountOriginal"
              type="number"
              value={form.totalAmountOriginal}
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
                className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text"
              >
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 text-sm">
              <label className="font-medium text-app-text">Paid by</label>
              <div className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text">
                {user?.name || 'You'}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="font-medium text-app-text">Split type</label>
              <select
                name="splitType"
                value={form.splitType}
                onChange={handleChange}
                className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text"
              >
                <option value="EQUAL">Equal</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </div>
          {form.splitType === 'MANUAL' ? (
            <div className="grid gap-3 md:grid-cols-2">{splitInputs}</div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {myGroupAccounts.linkedAccounts.length === 0 ? (
              <div className="md:col-span-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-200">
                Please link your accounts to this group first.
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => navigate(`/groups/${id}`)}
                >
                  Go to Group to Link Accounts
                </Button>
              </div>
            ) : null}
            <AccountSelect
              label="Account used"
              name="accountUsed"
              value={form.accountUsed}
              onChange={handleChange}
              accountNames={myGroupAccounts.linkedAccounts}
              placeholder="Select linked account"
              disabled={myGroupAccounts.linkedAccounts.length === 0}
              required={myGroupAccounts.linkedAccounts.length > 0}
            />
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {error}
            </div>
          ) : null}
          {warning ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              {warning}
            </div>
          ) : null}
          <Button 
            type="submit" 
            disabled={loading || myGroupAccounts.linkedAccounts.length === 0}
          >
            {loading ? 'Saving...' : 'Add expense'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default AddGroupExpense
