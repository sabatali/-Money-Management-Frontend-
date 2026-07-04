import { Link, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAppContext } from '../../context/AppContext'

const TransactionDetail = () => {
  const { id } = useParams()
  const { transactions } = useAppContext()
  const transaction = transactions.find((item) => item._id === id)

  const formatType = (type) => (type === 'expense' ? 'Expense' : 'Income')

  if (!transaction) {
    return (
      <Card title="Transaction not found">
        <p className="text-sm text-app-muted">
          This transaction may have been removed or does not exist.
        </p>
        <Link to="/transactions">
          <Button className="mt-4">Back to Transactions</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            Transaction Detail
          </h3>
          <p className="text-sm text-app-muted">
            {formatType(transaction.type)} · {transaction.category}
          </p>
        </div>
        <Link to={`/transactions/${transaction._id}/edit`}>
          <Button>Edit Transaction</Button>
        </Link>
      </div>

      <Card>
        <div className="grid gap-4 text-sm md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Amount
            </p>
            <p className="text-lg font-semibold text-app-text">
              {transaction.currency} {transaction.amount}
            </p>
            <p className="text-xs text-app-muted">
              Converted: PKR {Number(transaction.amountPKR || 0).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Account
            </p>
            <p className="text-base text-app-text">
              {transaction.account}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Date
            </p>
            <p className="text-base text-app-text">
              {transaction.date?.slice(0, 10)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              Description
            </p>
            <p className="text-base text-app-text">
              {transaction.description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default TransactionDetail
