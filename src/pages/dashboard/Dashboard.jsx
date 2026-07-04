import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import { labels } from '../../constants/labels'
import { isExpenseTotalTransaction, isIncomeTotalTransaction } from '../../utils/transactionFilters'

const Dashboard = () => {
  const {
    transactions,
    loans,
    transfers,
    accountBalances,
    refreshAccountBalances,
    refreshTransactions,
    refreshLoans,
    refreshTransfers,
  } = useAppContext()

  useEffect(() => {
    refreshAccountBalances()
    refreshTransactions()
    refreshLoans()
    refreshTransfers()
  }, [])

  const incomeTotal = transactions
    .filter(isIncomeTotalTransaction)
    .reduce((sum, item) => sum + Number(item.amountPKR || 0), 0)
  const expenseTotal = transactions
    .filter(isExpenseTotalTransaction)
    .reduce((sum, item) => sum + Number(item.amountPKR || 0), 0)
  const loanTotal = loans.reduce((sum, item) => sum + Number(item.amountPKR || 0), 0)
  const totalBalance =
    accountBalances.length > 0
      ? accountBalances.reduce(
          (sum, account) => sum + Number(account.currentBalancePKR || 0),
          0,
        )
      : incomeTotal - expenseTotal - loanTotal

  const netFlow = incomeTotal - expenseTotal

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-app-border-strong bg-gradient-to-br from-app-surface-elevated via-app-surface to-app-surface-soft p-6 shadow-lg shadow-black/25">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-app-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-app-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-app-muted">
              Total Balance
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-app-text">
              <span className="text-app-accent">PKR</span>{' '}
              {totalBalance.toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-app-muted">
              All accounts · converted to PKR
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-app-border bg-app-base/50 px-3 py-1 text-xs">
              <span className="text-app-muted">Net cash flow:</span>
              <span className={netFlow >= 0 ? 'font-semibold text-app-income' : 'font-semibold text-app-expense'}>
                {netFlow >= 0 ? '+' : ''}PKR {netFlow.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/transactions/new">
              <Button size="sm">+ Add Transaction</Button>
            </Link>
            <Link to="/transfers/new">
              <Button size="sm" variant="secondary">
                Transfer
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-app-income/20 bg-app-income-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-income">
                Income · Amdani
              </p>
              <p className="mt-2 text-2xl font-semibold text-app-text">
                PKR {incomeTotal.toLocaleString()}
              </p>
            </div>
            <span className="rounded-lg bg-app-income-muted px-2 py-1 text-lg">↑</span>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            Salary, freelance · Tankhaah aur kamai
          </p>
        </Card>
        <Card className="border-app-expense/20 bg-app-expense-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-expense">
                Expenses · Kharcha
              </p>
              <p className="mt-2 text-2xl font-semibold text-app-text">
                PKR {expenseTotal.toLocaleString()}
              </p>
            </div>
            <span className="rounded-lg bg-app-expense-muted px-2 py-1 text-lg">↓</span>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            Bills, shopping · Bills aur kharcha
          </p>
        </Card>
        <Card className="border-app-accent/20 bg-app-accent-muted/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-app-accent">
                Loans · Udhar
              </p>
              <p className="mt-2 text-2xl font-semibold text-app-text">
                PKR {loanTotal.toLocaleString()}
              </p>
            </div>
            <span className="rounded-lg bg-app-accent-muted px-2 py-1 text-lg">⇄</span>
          </div>
          <p className="mt-3 text-xs text-app-muted">
            {labels.dashboard.loansHint}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="Recent Transfers" subtitle="Latest account movements">
          <div className="space-y-3 text-sm">
            {transfers.length === 0 ? (
              <p className="text-app-muted">No transfers yet.</p>
            ) : (
              transfers.slice(0, 3).map((transfer) => (
                <div
                  key={transfer._id}
                  className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2.5"
                >
                  <div>
                    <p className="font-medium text-app-text">
                      {transfer.fromAccount} → {transfer.toAccount}
                    </p>
                    <p className="text-xs text-app-muted">
                      {transfer.date?.slice(0, 10)} · {transfer.description}
                    </p>
                  </div>
                  <span className="font-semibold text-app-accent">
                    PKR {Number(transfer.amountPKR || 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card title="Quick Actions">
          <div className="grid gap-3 text-sm">
            <Link to="/transactions/new">
              <Button className="w-full">Add Transaction</Button>
            </Link>
            <Link to="/loans/new">
              <Button className="w-full" variant="secondary">
                Add Loan · Udhar likho
              </Button>
            </Link>
            <Link to="/transfers/new">
              <Button className="w-full" variant="ghost">
                Add Transfer
              </Button>
            </Link>
            <Link to="/accounts">
              <Button className="w-full" variant="ghost">
                View Accounts
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
