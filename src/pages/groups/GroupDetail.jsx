import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BalanceCard from '../../components/BalanceCard'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ExpenseItem from '../../components/ExpenseItem'
import AccountSelect from '../../components/AccountSelect'
import { useEnsureAccountBalances } from '../../hooks/useEnsureAccountBalances'
import Input from '../../components/Input'
import MemberChip from '../../components/MemberChip'
import AddMemberModal from '../../components/AddMemberModal'
import Navbar from '../../components/Navbar'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'
import { labels } from '../../constants/labels'
import { buildSettlementSuggestions } from '../../utils/groupSettlements'
import { getAccountBalanceByName } from '../../utils/accountDisplay'

const GroupDetail = () => {
  const { id } = useParams()
  const { token, user, accountBalances, refreshAccountBalances, refreshTransactions } =
    useAppContext()
  useEnsureAccountBalances()
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [transfers, setTransfers] = useState([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [guestSubmitting, setGuestSubmitting] = useState(false)
  const [guestError, setGuestError] = useState('')
  const [guestActionState, setGuestActionState] = useState({})
  const [guestEmailDrafts, setGuestEmailDrafts] = useState({})

  // Account linking state
  const [myGroupAccounts, setMyGroupAccounts] = useState({ linkedAccounts: [], availableAccounts: [] })
  const [memberAccounts, setMemberAccounts] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [showLinkAccounts, setShowLinkAccounts] = useState(false)

  const [transferForm, setTransferForm] = useState({
    fromUser: '',
    toUser: '',
    amountPKR: '',
    account: '',
    toAccount: '',
    date: '',
  })
  const [guestPaymentForm, setGuestPaymentForm] = useState({
    fromUser: '',
    amountPKR: '',
    toAccount: '',
    date: '',
  })
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)

  const currentUserId = user?._id || user?.id

  const groupMembers = useMemo(() => group?.groupMembers || [], [group])

  const otherMembers = useMemo(
    () => groupMembers.filter((member) => String(member._id) !== String(currentUserId)),
    [groupMembers, currentUserId],
  )

  const guestMembers = useMemo(
    () => groupMembers.filter((member) => member.memberType === 'guest'),
    [groupMembers],
  )

  const fetchAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [groupRes, expenseRes, balanceRes, transferRes, myAccountsRes, memberAccountsRes] = await Promise.all([
        api.getGroup(token, id),
        api.getGroupExpenses(token, id),
        api.getGroupBalances(token, id),
        api.getGroupTransfers(token, id),
        api.getMyGroupAccounts(token, id),
        api.getGroupMemberAccounts(token, id),
      ])
      setGroup(groupRes.data)
      setExpenses(expenseRes.data || [])
      setBalances(balanceRes.data || [])
      setTransfers(transferRes.data || [])
      setMyGroupAccounts(myAccountsRes.data || { linkedAccounts: [], availableAccounts: [] })
      setMemberAccounts(memberAccountsRes.data || [])
      const members = groupRes.data.groupMembers || []
      const others = members.filter((member) => String(member._id) !== String(currentUserId))
      setTransferForm((prev) => ({
        ...prev,
        fromUser: currentUserId || '',
        toUser: others[0]?._id || prev.toUser || '',
      }))
    } catch (err) {
      setError(err.message || 'Failed to load group.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const totalSpend = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.totalAmountPKR || 0), 0),
    [expenses],
  )

  const settlementSuggestions = useMemo(
    () => buildSettlementSuggestions(balances),
    [balances],
  )

  const handleSearchMembers = async () => {
    setError('')
    try {
      if (!memberEmail.trim()) return
      setSearchLoading(true)
      const response = await api.searchUsers(token, memberEmail.trim())
      setSearchResults(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to search users.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleAddMember = async (userId) => {
    setError('')
    try {
      await api.addGroupMember(token, id, { userId })
      setSearchResults([])
      setMemberEmail('')
      setShowAddMember(false)
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to add member.')
    }
  }

  const handleAddGuest = async (guestForm) => {
    setGuestError('')
    setGuestSubmitting(true)
    try {
      await api.addGuestMember(token, id, guestForm)
      setShowAddMember(false)
      fetchAll()
      return true
    } catch (err) {
      setGuestError(err.message || 'Failed to add guest.')
      return false
    } finally {
      setGuestSubmitting(false)
    }
  }

  const handleInviteGuest = async (memberId, emailOverride) => {
    setGuestActionState((prev) => ({ ...prev, [memberId]: { loading: true } }))
    try {
      const payload = emailOverride ? { email: emailOverride } : {}
      await api.inviteGuestMember(token, id, memberId, payload)
      setGuestActionState((prev) => ({ ...prev, [memberId]: { message: 'Invite sent!' } }))
      fetchAll()
    } catch (err) {
      setGuestActionState((prev) => ({
        ...prev,
        [memberId]: { error: err.message || 'Failed to send invite.' },
      }))
    }
  }

  const handleRemoveMember = async (memberId) => {
    setError('')
    try {
      await api.removeGroupMember(token, id, memberId)
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to remove member.')
    }
  }

  const handleAccountSelection = (accountName) => {
    setSelectedAccounts((prev) => {
      if (prev.includes(accountName)) {
        return prev.filter((a) => a !== accountName)
      }
      if (prev.length >= 2) {
        return prev // Max 2 accounts
      }
      return [...prev, accountName]
    })
  }

  const handleLinkAccounts = async () => {
    if (selectedAccounts.length < 1 || selectedAccounts.length > 2) {
      setError('Please select 1-2 accounts.')
      return
    }
    setError('')
    try {
      await api.linkGroupAccounts(token, id, { accounts: selectedAccounts })
      setShowLinkAccounts(false)
      setSelectedAccounts([])
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to link accounts.')
    }
  }

  const getLinkedAccountsForUser = (userId) => {
    const memberAccount = memberAccounts.find(
      (ma) => String(ma.userId) === String(userId)
    )
    return memberAccount?.accounts || []
  }

  const handleTransferChange = (event) => {
    const { name, value } = event.target
    setTransferForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTransfer = async (event) => {
    event.preventDefault()
    setError('')
    setWarning('')

    // Check if user has linked accounts
    if (myGroupAccounts.linkedAccounts.length === 0) {
      setError('Please link your accounts to this group first.')
      return
    }

    // Validate from account is one of user's linked accounts
    if (!myGroupAccounts.linkedAccounts.includes(transferForm.account)) {
      setError('Please select one of your linked accounts.')
      return
    }

    try {
      const selected = accountBalances.find(
        (account) => account.name === transferForm.account,
      )
      const available = Number(selected?.currentBalancePKR ?? 0)
      const spending = Number(transferForm.amountPKR || 0)
      if (transferForm.account && spending > available) {
        setWarning(
          `Insufficient balance. Available PKR ${available.toLocaleString()}.`,
        )
        return
      }
      await api.createGroupTransfer(token, id, {
        ...transferForm,
        fromUser: currentUserId,
        amountPKR: Number(transferForm.amountPKR),
      })
      setTransferForm((prev) => ({ ...prev, amountPKR: '', toAccount: '' }))
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to record transfer.')
    }
  }

  const handleGuestPaymentChange = (event) => {
    const { name, value } = event.target
    setGuestPaymentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRecordGuestPayment = async (event) => {
    event.preventDefault()
    setError('')
    setWarning('')

    if (!guestPaymentForm.fromUser) {
      setError('Please select which guest paid.')
      return
    }
    if (myGroupAccounts.linkedAccounts.length === 0 || !guestPaymentForm.toAccount) {
      setError('Please select which of your linked accounts received the payment.')
      return
    }

    try {
      await api.createGroupTransfer(token, id, {
        fromUser: guestPaymentForm.fromUser,
        toUser: currentUserId,
        amountPKR: Number(guestPaymentForm.amountPKR),
        toAccount: guestPaymentForm.toAccount,
        date: guestPaymentForm.date,
      })
      setGuestPaymentForm({ fromUser: '', amountPKR: '', toAccount: '', date: '' })
      await refreshAccountBalances()
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to record guest payment.')
    }
  }

  const handleConfirmTransfer = async (transferId, selectedToAccount) => {
    setError('')

    // Check if receiver has linked accounts
    if (myGroupAccounts.linkedAccounts.length === 0) {
      setError('Please link your accounts to this group first.')
      return
    }

    // Validate to account is one of receiver's linked accounts
    if (!selectedToAccount || !myGroupAccounts.linkedAccounts.includes(selectedToAccount)) {
      setError('Please select one of your linked accounts to receive the payment.')
      return
    }

    try {
      await api.confirmGroupTransfer(token, id, transferId, {
        toAccount: selectedToAccount,
      })
      await refreshAccountBalances()
      await refreshTransactions()
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

  const isAdmin = groupMembers.some(
    (member) => member.role === 'admin' && String(member._id) === String(currentUserId),
  )

  return (
    <div className="space-y-6">
      <Navbar
        title={group?.name || 'Group'}
        subtitle={labels.groups.subtitle}
        actions={
          <div className="flex gap-2">
            <Link to={`/groups/${id}/settlements`}>
              <Button size="sm" variant="secondary">
                {labels.groups.viewSettlements}
              </Button>
            </Link>
            <Link to={`/groups/${id}/expenses/new`}>
              <Button size="sm">Add group expense</Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <Card>
          <p className="text-sm text-app-muted">Loading group data...</p>
        </Card>
      ) : null}
      {error ? (
        <Card>
          <p className="text-sm text-app-expense">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Members" subtitle="Everyone in this group.">
          <div className="space-y-3">
            {groupMembers.map((member) => {
              const linkedAccs = member.memberType === 'registered' ? getLinkedAccountsForUser(member.userId) : []
              const actionState = guestActionState[member._id] || {}
              const emailDraft = guestEmailDrafts[member._id] ?? ''
              return (
                <div
                  key={member._id}
                  className="rounded-xl border border-app-border bg-app-surface-soft p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <MemberChip name={member.name} role={member.role} memberType={member.memberType} />
                    {isAdmin ? (
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member._id)}>
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  {linkedAccs.length > 0 ? (
                    <span className="mt-1 block text-xs text-app-muted/70">
                      {linkedAccs.join(', ')}
                    </span>
                  ) : null}
                  {member.memberType === 'guest' ? (
                    <div className="mt-2 space-y-1">
                      {member.email ? (
                        <p className="text-xs text-app-muted">{member.email}</p>
                      ) : null}
                      {isAdmin ? (
                        member.email ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={actionState.loading}
                              onClick={() => handleInviteGuest(member._id)}
                            >
                              {actionState.loading ? 'Sending...' : 'Invite to LibraMate'}
                            </Button>
                            {actionState.message ? (
                              <span className="text-xs text-app-income">{actionState.message}</span>
                            ) : null}
                            {actionState.error ? (
                              <span className="text-xs text-app-expense">{actionState.error}</span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="email"
                              value={emailDraft}
                              onChange={(event) =>
                                setGuestEmailDrafts((prev) => ({ ...prev, [member._id]: event.target.value }))
                              }
                              placeholder="Add email to invite"
                              className="rounded-lg border border-app-border-strong bg-app-surface px-2 py-1.5 text-xs text-app-text"
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={!emailDraft || actionState.loading}
                              onClick={() => handleInviteGuest(member._id, emailDraft)}
                            >
                              {actionState.loading ? 'Sending...' : 'Add & Invite'}
                            </Button>
                            {actionState.error ? (
                              <span className="text-xs text-app-expense">{actionState.error}</span>
                            ) : null}
                          </div>
                        )
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          {/* Link Accounts Section */}
          <div className="mt-4 rounded-2xl border border-app-border bg-app-surface-soft p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-app-muted">Your Linked Accounts</p>
                <p className="text-sm text-app-text">
                  {myGroupAccounts.linkedAccounts.length > 0
                    ? myGroupAccounts.linkedAccounts.join(', ')
                    : 'No accounts linked'}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelectedAccounts(myGroupAccounts.linkedAccounts)
                  setShowLinkAccounts(true)
                }}
              >
                {myGroupAccounts.linkedAccounts.length > 0 ? 'Update' : 'Link Accounts'}
              </Button>
            </div>
          </div>

          {/* Link Accounts Modal */}
          {showLinkAccounts && (
            <div className="mt-4 rounded-2xl border border-app-border-strong bg-app-surface p-4">
              <p className="text-sm font-medium text-app-text mb-3">
                Select 1-2 accounts for this group
              </p>
              <div className="space-y-2">
                {myGroupAccounts.availableAccounts.map((account) => (
                  <label
                    key={account.name}
                    className="flex items-center gap-2 p-2 rounded-lg border border-app-border bg-app-surface-soft cursor-pointer hover:bg-app-primary-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccounts.includes(account.name)}
                      onChange={() => handleAccountSelection(account.name)}
                      className="rounded border-app-border-strong"
                    />
                    <span className="text-sm text-app-text">{account.name}</span>
                    <span className="text-xs text-app-muted/70">
                      PKR{' '}
                      {getAccountBalanceByName(accountBalances, account.name)?.toLocaleString() ??
                        '…'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={handleLinkAccounts}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowLinkAccounts(false)
                    setSelectedAccounts([])
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-app-border bg-app-surface-soft p-4">
            <p className="text-xs text-app-muted">Total spent</p>
            <p className="text-2xl font-semibold text-app-accent">
              PKR {totalSpend.toLocaleString()}
            </p>
          </div>
          {isAdmin ? (
            <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowAddMember(true)}>
              + Add member
            </Button>
          ) : null}
        </Card>

        <Card title={labels.groups.balancesTitle} subtitle={labels.groups.balancesSubtitle}>
          <div className="grid gap-3">
            {balances.map((item) => (
              <BalanceCard key={item.memberId || item.userId} name={item.user} balance={item.balance} />
            ))}
          </div>
        </Card>

        <Card title={labels.groups.whoPaysTitle} subtitle={labels.groups.whoPaysSubtitle}>
          <div className="space-y-2 text-sm">
            {settlementSuggestions.length === 0 ? (
              <p className="text-app-muted">{labels.groups.everyoneSettled}</p>
            ) : (
              settlementSuggestions.slice(0, 2).map((item, index) => (
                <div
                  key={`${item.from}-${item.to}-${index}`}
                  className="rounded-xl border border-app-border bg-app-surface px-3 py-2"
                >
                  <p className="text-app-text">
                    <span className="font-medium">{item.from}</span> pays{' '}
                    <span className="font-medium">{item.to}</span>
                  </p>
                  <p className="text-xs text-app-muted">
                    {item.from} {item.to} ko PKR {item.amount.toLocaleString()} dega
                  </p>
                </div>
              ))
            )}
            <Link to={`/groups/${id}/settlements`}>
              <Button size="sm" variant="secondary" className="mt-2 w-full">
                {labels.groups.viewSettlements}
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Expenses" subtitle="Each expense with split details.">
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <ExpenseItem
                key={expense._id}
                expense={expense}
                currentUserId={currentUserId}
                balances={balances}
                onPayShare={({ fromUserId, toUserId, amountPKR }) => {
                  setTransferForm((prev) => ({
                    ...prev,
                    fromUser: fromUserId,
                    toUser: toUserId,
                    amountPKR: String(amountPKR),
                    date: new Date().toISOString().slice(0, 10),
                  }))
                }}
              />
            ))}
            {expenses.length === 0 ? (
              <p className="text-sm text-app-muted">
                No expenses yet. Add the first one.
              </p>
            ) : null}
          </div>
        </Card>

        <Card title={labels.groups.settlePayment} subtitle={labels.groups.settleSubtitle}>
          {myGroupAccounts.linkedAccounts.length === 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
              Please link your accounts to this group before making payments.
            </div>
          ) : (
          <form className="space-y-3" onSubmit={handleTransfer}>
            <div className="flex flex-col gap-2 text-sm">
              <label className="font-medium text-app-text">From · Kis ne diye</label>
              <div className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text">
                {user?.name || 'You'} · Aap
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="font-medium text-app-text">To · Kis ko milenge</label>
              <select
                name="toUser"
                value={transferForm.toUser}
                onChange={handleTransferChange}
                className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text"
                required
              >
                <option value="">Select member</option>
                {otherMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                    {member.memberType === 'guest' ? ' (Guest)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Amount (PKR)"
              name="amountPKR"
              type="number"
              value={transferForm.amountPKR}
              onChange={handleTransferChange}
              required
            />
            <AccountSelect
              label="From Account (Your Linked Account)"
              name="account"
              value={transferForm.account}
              onChange={handleTransferChange}
              accountNames={myGroupAccounts.linkedAccounts}
              placeholder="Select your linked account"
              required
            />
            <div className="flex flex-col gap-2 text-sm">
              <label className="font-medium text-app-text">
                To Account (Receiver will select on confirmation)
              </label>
              <div className="text-xs text-app-muted/70 px-1">
                If the receiver is a guest, this is recorded immediately — guests don't need to confirm.
                Otherwise, the receiver will choose their linked account when confirming this payment.
              </div>
            </div>
            <Input
              label="Date"
              name="date"
              type="date"
              value={transferForm.date}
              onChange={handleTransferChange}
              required
            />
            {warning ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                {warning}
              </div>
            ) : null}
            <Button type="submit">Record payment · Payment likho</Button>
          </form>
          )}

          {guestMembers.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-app-border bg-app-surface-soft p-4">
              <p className="text-sm font-medium text-app-text">Record a guest's payment</p>
              <p className="mt-1 text-xs text-app-muted">
                A guest paid you back in cash or another way — log it here. No confirmation needed.
              </p>
              <form className="mt-3 space-y-3" onSubmit={handleRecordGuestPayment}>
                <div className="flex flex-col gap-2 text-sm">
                  <label className="font-medium text-app-text">Paid by</label>
                  <select
                    name="fromUser"
                    value={guestPaymentForm.fromUser}
                    onChange={handleGuestPaymentChange}
                    className="rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text"
                    required
                  >
                    <option value="">Select guest</option>
                    {guestMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Amount (PKR)"
                  name="amountPKR"
                  type="number"
                  value={guestPaymentForm.amountPKR}
                  onChange={handleGuestPaymentChange}
                  required
                />
                <AccountSelect
                  label="Received into"
                  name="toAccount"
                  value={guestPaymentForm.toAccount}
                  onChange={handleGuestPaymentChange}
                  accountNames={myGroupAccounts.linkedAccounts}
                  placeholder="Select your linked account"
                  required
                />
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={guestPaymentForm.date}
                  onChange={handleGuestPaymentChange}
                  required
                />
                <Button type="submit" variant="secondary">
                  Save
                </Button>
              </form>
            </div>
          ) : null}

          <div className="mt-4 space-y-2 text-xs">
            {transfers.map((transfer) => {
              const toUserId = transfer.toUser?._id || transfer.toUser
              const transferStatus = transfer.status || 'Pending'
              const isReceiver = String(toUserId) === String(currentUserId)
              const isPending = transferStatus === 'Pending'
              const isConfirmed = transferStatus === 'Confirmed'
              const isRejected = transferStatus === 'Rejected'

              return (
                <div
                  key={transfer._id}
                  className={`rounded-xl border px-3 py-2 ${
                    isConfirmed
                      ? 'border-app-border-strong bg-app-income-muted'
                      : isRejected
                      ? 'border-app-expense/30 bg-app-expense-muted'
                      : 'border-amber-500/20 bg-amber-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-app-muted">
                      <span className="font-medium text-app-text">{transfer.fromUser?.name}</span>
                      {' → '}
                      <span className="font-medium text-app-text">{transfer.toUser?.name}</span>
                      {' · PKR '}{transfer.amountPKR}
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      isConfirmed
                        ? 'bg-app-accent-muted text-app-muted'
                        : isRejected
                        ? 'bg-rose-500/20 text-rose-200'
                        : 'bg-amber-500/20 text-amber-200'
                    }`}>
                      {transferStatus}
                    </span>
                  </div>
                  <div className="mt-1 text-app-muted/70">
                    From: {transfer.account || 'N/A'} → To: {transfer.toAccount || 'N/A'}
                  </div>
                  {isPending && isReceiver && myGroupAccounts.linkedAccounts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-app-muted mb-1">
                        Select account · Account chuno (paise yahan aayenge):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {myGroupAccounts.linkedAccounts.map((accName) => (
                          <Button
                            key={accName}
                            size="sm"
                            onClick={() => handleConfirmTransfer(transfer._id, accName)}
                          >
                            Confirm to {accName}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRejectTransfer(transfer._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                  {isPending && isReceiver && myGroupAccounts.linkedAccounts.length === 0 && (
                    <div className="mt-1 text-rose-200/70">
                      Please link your accounts to confirm this payment.
                    </div>
                  )}
                  {isPending && !isReceiver && (
                    <div className="mt-1 text-amber-200/70">
                      Waiting for {transfer.toUser?.name} to confirm...
                    </div>
                  )}
                </div>
              )
            })}
            {transfers.length === 0 ? (
              <p className="text-app-muted">No payments recorded yet.</p>
            ) : null}
          </div>
        </Card>
      </div>

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => {
          setShowAddMember(false)
          setSearchResults([])
          setMemberEmail('')
          setGuestError('')
        }}
        memberEmail={memberEmail}
        onMemberEmailChange={(event) => setMemberEmail(event.target.value)}
        onSearchUsers={handleSearchMembers}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onAddRegistered={handleAddMember}
        onAddGuest={handleAddGuest}
        guestSubmitting={guestSubmitting}
        guestError={guestError}
      />
    </div>
  )
}

export default GroupDetail
