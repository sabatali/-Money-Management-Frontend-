import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BalanceCard from '../../components/BalanceCard'
import Button from '../../components/Button'
import Card from '../../components/Card'
import AccountSelect from '../../components/AccountSelect'
import Input from '../../components/Input'
import Navbar from '../../components/Navbar'
import { useAppContext } from '../../context/AppContext'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import { api } from '../../services/api'
import { balanceDisplay, labels } from '../../constants/labels'
import {
  buildPairwiseNetSettlements,
  buildSettlementSuggestions,
  getMyPaymentSuggestions,
} from '../../utils/groupSettlements'

const GroupSettlements = () => {
  const { id } = useParams()
  const { token, user, refreshAccountBalances } = useAppContext()
  useEnsureAccountBalances()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [transfers, setTransfers] = useState([])
  const [myGroupAccounts, setMyGroupAccounts] = useState({ linkedAccounts: [] })
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payForm, setPayForm] = useState({
    account: '',
    date: new Date().toISOString().slice(0, 10),
  })

  const currentUserId = user?._id || user?.id

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [groupRes, expenseRes, balanceRes, transferRes, myAccountsRes] =
        await Promise.all([
          api.getGroup(token, id),
          api.getGroupExpenses(token, id),
          api.getGroupBalances(token, id),
          api.getGroupTransfers(token, id),
          api.getMyGroupAccounts(token, id),
        ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data || [])
      setBalances(balanceRes.data || [])
      setTransfers(transferRes.data || [])
      setMyGroupAccounts(myAccountsRes.data || { linkedAccounts: [] })
    } catch (err) {
      setError(err.message || 'Failed to load settlements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const pairwise = useMemo(
    () => buildPairwiseNetSettlements(expenses, transfers, balances),
    [expenses, transfers, balances],
  )

  const suggestions = useMemo(() => buildSettlementSuggestions(balances), [balances])

  const myPayments = useMemo(
    () => getMyPaymentSuggestions(suggestions, currentUserId),
    [suggestions, currentUserId],
  )

  const myTotalOwed = useMemo(
    () => myPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [myPayments],
  )

  const pendingForMe = transfers.filter((transfer) => {
    const toUserId = transfer.toUser?._id || transfer.toUser
    return (
      (transfer.status || 'Pending') === 'Pending' &&
      String(toUserId) === String(currentUserId)
    )
  })

  const handlePayFormChange = (event) => {
    const { name, value } = event.target
    setPayForm((prev) => ({ ...prev, [name]: value }))
  }

  const recordPayment = async ({ toUserId, amountPKR }) => {
    if (myGroupAccounts.linkedAccounts.length === 0) {
      setError('Please link your accounts to this group first.')
      return false
    }
    if (!payForm.account || !myGroupAccounts.linkedAccounts.includes(payForm.account)) {
      setError('Please select one of your linked accounts.')
      return false
    }
    if (!payForm.date) {
      setError('Please select a payment date.')
      return false
    }

    await api.createGroupTransfer(token, id, {
      fromUser: currentUserId,
      toUser: toUserId,
      amountPKR: Number(amountPKR),
      account: payForm.account,
      date: payForm.date,
    })
    return true
  }

  const handlePaySingle = async (suggestion) => {
    setError('')
    setWarning('')
    setPayLoading(true)
    try {
      const ok = await recordPayment({
        toUserId: suggestion.toUserId,
        amountPKR: suggestion.amount,
      })
      if (!ok) return
      await refreshAccountBalances()
      await fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to record payment.')
    } finally {
      setPayLoading(false)
    }
  }

  const handlePayAllIOwe = async () => {
    if (myPayments.length === 0) return
    setError('')
    setWarning('')
    setPayLoading(true)
    try {
      for (const payment of myPayments) {
        const ok = await recordPayment({
          toUserId: payment.toUserId,
          amountPKR: payment.amount,
        })
        if (!ok) return
      }
      await refreshAccountBalances()
      await fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to record payments.')
    } finally {
      setPayLoading(false)
    }
  }

  const handleConfirmTransfer = async (transferId, selectedToAccount) => {
    setError('')
    if (!myGroupAccounts.linkedAccounts.includes(selectedToAccount)) {
      setError('Please select one of your linked accounts.')
      return
    }
    try {
      await api.confirmGroupTransfer(token, id, transferId, {
        toAccount: selectedToAccount,
      })
      await refreshAccountBalances()
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to confirm transfer.')
    }
  }

  const handleRejectTransfer = async (transferId) => {
    setError('')
    try {
      await api.rejectGroupTransfer(token, id, transferId)
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to reject transfer.')
    }
  }

  const canPay = myGroupAccounts.linkedAccounts.length > 0 && myPayments.length > 0

  return (
    <div className="space-y-6">
      <Navbar
        title={labels.groups.settlementsPageTitle}
        subtitle={group?.name || labels.groups.settlementsPageSubtitle}
        actions={
          <Link to={`/groups/${id}`}>
            <Button size="sm" variant="secondary">
              Back to group
            </Button>
          </Link>
        }
      />

      {loading ? (
        <Card>
          <p className="text-sm text-app-muted">Loading...</p>
        </Card>
      ) : null}

      {error ? (
        <Card>
          <p className="text-sm text-app-expense">{error}</p>
        </Card>
      ) : null}

      {pendingForMe.length > 0 ? (
        <Card
          title="Pending for you · Aap ke liye intezar"
          subtitle="Accept or decline incoming payments."
        >
          <div className="space-y-3">
            {pendingForMe.map((transfer) => (
              <div
                key={transfer._id}
                className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
              >
                <p className="text-sm text-app-text">
                  <span className="font-medium">{transfer.fromUser?.name}</span> ne aap ko{' '}
                  <span className="font-semibold text-app-accent">
                    PKR {Number(transfer.amountPKR).toLocaleString()}
                  </span>{' '}
                  bhejne ki koshish ki
                </p>
                <p className="mt-1 text-xs text-app-muted">
                  From account: {transfer.account}
                </p>
                {myGroupAccounts.linkedAccounts.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {myGroupAccounts.linkedAccounts.map((accName) => (
                      <Button
                        key={accName}
                        size="sm"
                        onClick={() => handleConfirmTransfer(transfer._id, accName)}
                      >
                        Accept to {accName}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRejectTransfer(transfer._id)}
                    >
                      Decline
                    </Button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-rose-200">
                    Link your accounts in the group page first.
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={labels.groups.balancesTitle} subtitle={labels.groups.balancesSubtitle}>
          <div className="grid gap-3">
            {balances.map((item) => (
              <div key={item.userId} className="space-y-1">
                <BalanceCard name={item.user} balance={item.balance} />
                {item.balance > 0 ? (
                  <p className="text-xs text-app-income px-1">
                    {item.user} gave PKR {item.balance.toLocaleString()} · others need to return
                  </p>
                ) : item.balance < 0 ? (
                  <p className="text-xs text-app-expense px-1">
                    {item.user} needs to return PKR {Math.abs(item.balance).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-app-muted px-1">
                    {balanceDisplay.settled.en} · {balanceDisplay.settled.ur}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card
          title={labels.groups.pairwiseTitle}
          subtitle={labels.groups.pairwiseSubtitle}
        >
          <div className="space-y-2 text-sm">
            {pairwise.length === 0 ? (
              <p className="text-app-muted">{labels.groups.everyoneSettled}</p>
            ) : (
              pairwise.map((item) => (
                <div
                  key={`${item.fromUserId}-${item.toUserId}`}
                  className="rounded-xl border border-app-border bg-app-surface px-3 py-2"
                >
                  <p className="text-app-text">
                    <span className="font-medium">{item.from}</span>
                    {' → '}
                    <span className="font-medium">{item.to}</span>
                  </p>
                  <p className="text-xs text-app-muted">
                    {labels.groups.netOwes(item.from, item.to, item.amount)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-app-accent">
                    PKR {item.amount.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card
        title={labels.groups.minimumPaymentsTitle}
        subtitle={labels.groups.minimumPaymentsSubtitle}
      >
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="text-sm text-app-muted">{labels.groups.everyoneSettled}</p>
          ) : (
            <div className="space-y-2 text-sm">
              {suggestions.map((item, index) => {
                const isMine = String(item.fromUserId) === String(currentUserId)
                return (
                  <div
                    key={`${item.fromUserId}-${item.toUserId}-${index}`}
                    className={`rounded-xl border px-3 py-2 ${
                      isMine
                        ? 'border-app-accent/30 bg-app-accent-muted/20'
                        : 'border-app-border bg-app-surface'
                    }`}
                  >
                    <p className="text-app-text">
                      <span className="font-medium">{item.from}</span> pays{' '}
                      <span className="font-medium">{item.to}</span>
                    </p>
                    <p className="text-xs text-app-muted">
                      {labels.groups.pays(item.from, item.to, item.amount)}
                    </p>
                    <p className="mt-1 font-semibold text-app-accent">
                      PKR {item.amount.toLocaleString()}
                    </p>
                    {isMine ? (
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={payLoading || !canPay}
                        onClick={() => handlePaySingle(item)}
                      >
                        {labels.groups.payNow(item.amount)}
                      </Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}

          {myPayments.length > 0 ? (
            <div className="rounded-2xl border border-app-border bg-app-surface-soft p-4 space-y-3">
              <p className="text-sm font-medium text-app-text">
                Your payments · Aap ke payments
              </p>
              {myGroupAccounts.linkedAccounts.length === 0 ? (
                <p className="text-xs text-amber-200">
                  Link your accounts on the group page before paying.
                </p>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <AccountSelect
                      label="From account · Kis account se"
                      name="account"
                      value={payForm.account}
                      onChange={handlePayFormChange}
                      accountNames={myGroupAccounts.linkedAccounts}
                      placeholder="Select linked account"
                      required
                    />
                    <Input
                      label="Date"
                      name="date"
                      type="date"
                      value={payForm.date}
                      onChange={handlePayFormChange}
                      required
                    />
                  </div>
                  {warning ? (
                    <p className="text-xs text-amber-200">{warning}</p>
                  ) : null}
                  <Button
                    disabled={payLoading || !payForm.account}
                    onClick={handlePayAllIOwe}
                  >
                    {payLoading
                      ? 'Recording...'
                      : labels.groups.payAllIOwe(myTotalOwed)}
                  </Button>
                  <p className="text-xs text-app-muted">
                    Pays all {myPayments.length} remaining balance
                    {myPayments.length > 1 ? 's' : ''} in one go — receiver confirms each.
                  </p>
                </>
              )}
            </div>
          ) : null}
        </div>
      </Card>

      <Card
        title="All payments · Saari payments"
        subtitle="Pending, confirmed, and rejected settlement records."
      >
        <div className="space-y-2 text-sm">
          {transfers.length === 0 ? (
            <p className="text-app-muted">No payments recorded yet.</p>
          ) : (
            transfers.map((transfer) => {
              const status = transfer.status || 'Pending'
              const isReceiver =
                String(transfer.toUser?._id || transfer.toUser) === String(currentUserId)
              return (
                <div
                  key={transfer._id}
                  className={`rounded-xl border px-3 py-2 ${
                    status === 'Confirmed'
                      ? 'border-app-border-strong bg-app-income-muted'
                      : status === 'Rejected'
                        ? 'border-app-expense/30 bg-app-expense-muted'
                        : 'border-amber-500/20 bg-amber-500/10'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-app-muted">
                      <span className="font-medium text-app-text">
                        {transfer.fromUser?.name}
                      </span>
                      {' → '}
                      <span className="font-medium text-app-text">
                        {transfer.toUser?.name}
                      </span>
                      {' · PKR '}
                      {Number(transfer.amountPKR).toLocaleString()}
                    </div>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium">{status}</span>
                  </div>
                  <p className="mt-1 text-xs text-app-muted/70">
                    {transfer.account || 'N/A'} → {transfer.toAccount || 'Pending selection'}
                  </p>
                  {status === 'Pending' && isReceiver ? (
                    <p className="mt-1 text-xs text-amber-200">Waiting for your accept/decline</p>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

export default GroupSettlements
