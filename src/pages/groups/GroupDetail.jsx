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
  const [memberEmail, setMemberEmail] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  
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
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)

  const currentUserId = user?._id || user?.id

  const otherMembers = useMemo(
    () =>
      (group?.members || []).filter(
        (member) => String(member.user._id) !== String(currentUserId),
      ),
    [group?.members, currentUserId],
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
      const members = groupRes.data.members || []
      const others = members.filter(
        (member) => String(member.user._id) !== String(user?._id || user?.id),
      )
      setTransferForm((prev) => ({
        ...prev,
        fromUser: user?._id || user?.id || '',
        toUser: others[0]?.user?._id || prev.toUser || '',
      }))
    } catch (err) {
      setError(err.message || 'Failed to load group.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [id])

  const totalSpend = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.totalAmountPKR || 0), 0),
    [expenses],
  )

  const settlementSuggestions = useMemo(
    () => buildSettlementSuggestions(balances),
    [balances],
  )

  const handleSearchMembers = async (event) => {
    event.preventDefault()
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
      fetchAll()
    } catch (err) {
      setError(err.message || 'Failed to add member.')
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
      // First update the transfer with the selected account
      // Note: You may need to add an API endpoint to update the toAccount before confirming
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

  // Get linked accounts for a specific user
  const getReceiverLinkedAccounts = (userId) => {
    const memberAccount = memberAccounts.find(
      (ma) => String(ma.userId) === String(userId)
    )
    return memberAccount?.accounts || []
  }

  const isAdmin = group?.members?.some(
    (member) =>
      member.role === 'admin' && String(member.user._id) === String(user?.id),
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
          <div className="flex flex-wrap items-center gap-2">
            {group?.members?.map((member) => {
              const linkedAccs = getLinkedAccountsForUser(member.user._id)
              return (
                <div key={member.user._id} className="flex flex-col">
                  <MemberChip
                    name={member.user.name}
                    role={member.role}
                  />
                  {linkedAccs.length > 0 && (
                    <span className="text-xs text-app-muted/70 ml-1">
                      {linkedAccs.join(', ')}
                    </span>
                  )}
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
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={handleSearchMembers}
            >
              <Input
                label="Search member by email"
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                placeholder="roommate@email.com"
                required
              />
              <Button type="submit" disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          ) : null}
          {isAdmin && searchResults.length ? (
            <div className="mt-4 space-y-2">
              {searchResults.map((userResult) => (
                <div
                  key={userResult.id}
                  className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm"
                >
                  <div>
                    <div className="text-app-text">{userResult.name}</div>
                    <div className="text-xs text-app-muted">
                      {userResult.email}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAddMember(userResult.id)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card title={labels.groups.balancesTitle} subtitle={labels.groups.balancesSubtitle}>
          <div className="grid gap-3">
            {balances.map((item) => (
              <BalanceCard key={item.userId} name={item.user} balance={item.balance} />
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
                currentUserId={user?.id}
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
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.name}
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
                Receiver will choose their linked account when confirming this payment.
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

          <div className="mt-4 space-y-2 text-xs">
            {transfers.map((transfer) => {
              const toUserId = transfer.toUser?._id || transfer.toUser
              const currentUserId = user?._id || user?.id
              const isReceiver = String(toUserId) === String(currentUserId)
              const transferStatus = transfer.status || 'Pending'
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
    </div>
  )
}

export default GroupDetail
