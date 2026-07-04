import { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Modal from '../../components/Modal'

const Accounts = () => {
  const { token } = useAppContext()
  const [accounts, setAccounts] = useState([])
  const [balances, setBalances] = useState([])
  const [exchangeRate, setExchangeRate] = useState(280)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRateModalOpen, setIsRateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    currency: 'PKR',
    openingBalance: '',
  })
  const [rateForm, setRateForm] = useState({ rate: 280 })

  useEffect(() => {
    fetchData()
  }, [token])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsRes, balancesRes, rateRes] = await Promise.all([
        api.getAccounts(token),
        api.getAccountBalances(token),
        api.getExchangeRate(token),
      ])
      setAccounts(accountsRes.data || [])
      setBalances(balancesRes.data || [])
      setExchangeRate(rateRes.data?.rate || 280)
      setRateForm({ rate: rateRes.data?.rate || 280 })
    } catch (err) {
      setError(err.message || 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createAccount(token, {
        ...formData,
        openingBalance: Number(formData.openingBalance) || 0,
      })
      setFormData({ name: '', currency: 'PKR', openingBalance: '' })
      setIsAddModalOpen(false)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to create account')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.updateAccount(token, editingAccount._id, {
        ...formData,
        openingBalance: Number(formData.openingBalance) || 0,
      })
      setFormData({ name: '', currency: 'PKR', openingBalance: '' })
      setEditingAccount(null)
      setIsEditModalOpen(false)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to update account')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this account?')) return
    try {
      await api.deleteAccount(token, id)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to delete account')
    }
  }

  const handleUpdateRate = async (e) => {
    e.preventDefault()
    try {
      await api.updateExchangeRate(token, { rate: Number(rateForm.rate) })
      setIsRateModalOpen(false)
      fetchData()
    } catch (err) {
      setError(err.message || 'Failed to update exchange rate')
    }
  }

  const openEditModal = (account) => {
    setEditingAccount(account)
    setFormData({
      name: account.name,
      currency: account.currency || 'PKR',
      openingBalance: account.openingBalance || account.openingBalancePKR || 0,
    })
    setIsEditModalOpen(true)
  }

  const getBalanceForAccount = (accountId) => {
    const balance = balances.find((b) => b.id === accountId)
    return balance ? balance.currentBalancePKR : 0
  }

  const formatCurrency = (amount, currency) => {
    const symbol = currency === 'USD' ? '$' : '₨'
    return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const totalBalancePKR = balances.reduce((sum, b) => sum + (b.currentBalancePKR || 0), 0)
  const totalBalanceUSD = totalBalancePKR / exchangeRate

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-app-muted">Loading accounts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-app-text">Accounts</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsRateModalOpen(true)}>
            Exchange Rate: 1 USD = {exchangeRate} PKR
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>Add Account</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-app-primary/15 to-app-accent/10">
          <div className="text-sm text-app-muted">Total Balance (PKR)</div>
          <div className="mt-1 text-2xl font-bold text-app-text">
            {formatCurrency(totalBalancePKR, 'PKR')}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20">
          <div className="text-sm text-app-muted">Total Balance (USD)</div>
          <div className="mt-1 text-2xl font-bold text-app-text">
            {formatCurrency(totalBalanceUSD, 'USD')}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20">
          <div className="text-sm text-app-muted">Total Accounts</div>
          <div className="mt-1 text-2xl font-bold text-app-text">{accounts.length}</div>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border text-left text-sm text-app-muted">
                <th className="pb-3 pl-4 font-medium">Account Name</th>
                <th className="pb-3 font-medium">Currency</th>
                <th className="pb-3 font-medium">Opening Balance</th>
                <th className="pb-3 font-medium">Current Balance (PKR)</th>
                <th className="pb-3 pr-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-app-muted/70">
                    No accounts found. Create your first account to get started.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => {
                  const currentBalancePKR = getBalanceForAccount(account._id)
                  return (
                    <tr
                      key={account._id}
                      className="border-b border-app-border last:border-0 hover:bg-app-primary-muted"
                    >
                      <td className="py-4 pl-4 font-medium text-app-text">
                        {account.name}
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            account.currency === 'USD'
                              ? 'bg-blue-500/20 text-blue-200'
                              : 'bg-app-accent-muted text-app-muted'
                          }`}
                        >
                          {account.currency || 'PKR'}
                        </span>
                      </td>
                      <td className="py-4 text-app-muted">
                        {formatCurrency(
                          account.openingBalance || account.openingBalancePKR || 0,
                          account.currency || 'PKR'
                        )}
                      </td>
                      <td className="py-4 font-medium text-app-text">
                        {formatCurrency(currentBalancePKR, 'PKR')}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(account)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(account._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Account Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Account Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bank Alfalah, Payoneer, Cash"
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-app-muted">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-app-border-strong bg-app-surface px-3 py-2 text-app-text outline-none focus:border-app-border0"
            >
              <option value="PKR">PKR (Pakistani Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
          <Input
            label="Opening Balance"
            type="number"
            value={formData.openingBalance}
            onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Account Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Bank Alfalah, Payoneer, Cash"
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-app-muted">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full rounded-lg border border-app-border-strong bg-app-surface px-3 py-2 text-app-text outline-none focus:border-app-border0"
            >
              <option value="PKR">PKR (Pakistani Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>
          <Input
            label="Opening Balance"
            type="number"
            value={formData.openingBalance}
            onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Account</Button>
          </div>
        </form>
      </Modal>

      {/* Exchange Rate Modal */}
      <Modal isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} title="Exchange Rate Settings">
        <form onSubmit={handleUpdateRate} className="space-y-4">
          <div className="rounded-lg border border-app-border-strong bg-app-primary-muted p-4">
            <p className="text-sm text-app-muted">
              Set the exchange rate for USD to PKR. This rate will be used for all currency conversions across the application.
            </p>
          </div>
          <Input
            label="USD to PKR Rate"
            type="number"
            value={rateForm.rate}
            onChange={(e) => setRateForm({ rate: e.target.value })}
            placeholder="280"
            min="1"
            step="0.01"
            required
          />
          <div className="rounded-lg border border-app-border bg-app-surface p-3 text-sm">
            <div className="flex justify-between text-app-muted">
              <span>Example:</span>
              <span className="text-app-text">
                1 USD = {Number(rateForm.rate || 280).toLocaleString('en-US')} PKR
              </span>
            </div>
            <div className="mt-1 flex justify-between text-app-muted">
              <span>100 USD =</span>
              <span className="text-app-text">
                {(100 * Number(rateForm.rate || 280)).toLocaleString('en-US')} PKR
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsRateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Rate</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Accounts
