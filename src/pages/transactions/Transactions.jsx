import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAppContext } from '../../context/AppContext'
import { countsInTransactionHistory } from '../../utils/transactionFilters'

const Transactions = () => {
  const { transactions, refreshTransactions } = useAppContext()

  useEffect(() => {
    refreshTransactions()
  }, [])

  const visibleTransactions = useMemo(
    () => transactions.filter(countsInTransactionHistory),
    [transactions],
  )
  const formatType = (type) => (type === 'expense' ? 'Expense' : 'Income')

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            Transactions
          </h3>
          <p className="text-sm text-app-muted">
            View all income and expense activity in one place.
          </p>
        </div>
        <Link to="/transactions/new">
          <Button>Add Transaction</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {visibleTransactions.map((transaction) => (
          <Card key={transaction._id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-app-muted">
                  {formatType(transaction.type)}
                </p>
                <h4 className="text-lg font-semibold text-app-text">
                  {transaction.category}
                </h4>
                <p className="text-xs text-app-muted">
                  {transaction.date?.slice(0, 10)} · {transaction.account}
                </p>
                <p className="mt-2 text-sm text-app-muted/80">
                  {transaction.description}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-lg font-semibold text-app-text">
                  {transaction.currency} {transaction.amount}
                </p>
                <p className="text-xs text-app-muted">
                  PKR {Number(transaction.amountPKR || 0).toLocaleString()}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Link to={`/transactions/${transaction._id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                  <Link to={`/transactions/${transaction._id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Transactions
