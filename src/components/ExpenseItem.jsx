import Button from './Button'
import { labels } from '../constants/labels'

const ExpenseItem = ({ expense, currentUserId, onPayShare, balances = [] }) => {
  const paidBy = expense.paidBy?.name || 'Unknown'
  const splitLabel =
    expense.splitType === 'EQUAL' ? 'Equal split' : 'Manual split'
  const paidById = expense.paidBy?._id || expense.paidBy
  const userSplit = expense.splits?.find(
    (split) => String(split.user?._id || split.user) === String(currentUserId),
  )
  const userShare = Number(userSplit?.shareAmountPKR || 0)

  // Check if user still owes money to the payer based on overall group balance
  const userBalance = balances.find(
    (b) => String(b.userId) === String(currentUserId)
  )
  const payerBalance = balances.find(
    (b) => String(b.userId) === String(paidById)
  )

  // User should only pay if:
  // 1. They have a share in this expense
  // 2. They're not the payer
  // 3. They have a negative balance (owe money) OR payer has positive balance (is owed money)
  const shouldShowPayButton =
    currentUserId &&
    userShare > 0 &&
    String(currentUserId) !== String(paidById) &&
    (userBalance?.balance < 0 || payerBalance?.balance > 0)

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-app-muted">{labels.groups.paidBy(paidBy)}</div>
          <h4 className="text-lg font-semibold text-app-text">
            {expense.title}
          </h4>
          <p className="text-xs text-app-muted/80">{splitLabel}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-app-muted">
            {expense.currency} {expense.totalAmountOriginal}
          </div>
          <div className="text-lg font-semibold text-app-accent">
            PKR {expense.totalAmountPKR?.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-app-muted">
        <span className="rounded-full border border-app-border-strong px-2 py-1">
          Account: {expense.accountUsed}
        </span>
        <span className="rounded-full border border-app-border-strong px-2 py-1">
          Date: {expense.date ? expense.date.slice(0, 10) : '-'}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-xs text-app-muted">
        {(expense.splits || []).map((split) => (
          <div
            key={split.user?._id || split.user}
            className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2"
          >
            <span>{split.user?.name || split.user}</span>
            <span>PKR {Number(split.shareAmountPKR || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
      {shouldShowPayButton ? (
        <div className="mt-4">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              onPayShare?.({
                fromUserId: currentUserId,
                toUserId: paidById,
                amountPKR: userShare,
              })
            }
          >
            Pay your share · Apna hissa do (PKR {userShare.toLocaleString()})
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default ExpenseItem
