import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAppContext } from '../../context/AppContext'
import {
  getLoanTypeLabel,
  getLoanStatusLabel,
  labels,
} from '../../constants/labels'

const Loans = () => {
  const { loans, refreshLoans } = useAppContext()

  useEffect(() => {
    refreshLoans()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">
            {labels.loans.pageTitle}
          </h3>
          <p className="text-sm text-app-muted">{labels.loans.pageSubtitle}</p>
        </div>
        <Link to="/loans/new">
          <Button>{labels.loans.addLoan}</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {loans.map((loan) => {
          const typeInfo = getLoanTypeLabel(loan.type || 'Lent')
          const statusInfo = getLoanStatusLabel(loan.status)
          const isBorrowed = loan.type === 'Borrowed'

          return (
            <Card key={loan._id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isBorrowed
                          ? 'bg-amber-500/20 text-amber-200'
                          : 'bg-blue-500/20 text-blue-200'
                      }`}
                    >
                      {typeInfo.en} · {typeInfo.ur}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        loan.status === 'Returned'
                          ? 'bg-app-accent-muted text-app-muted'
                          : 'bg-rose-500/20 text-rose-200'
                      }`}
                    >
                      {statusInfo.en} · {statusInfo.ur}
                    </span>
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-app-text">
                    {loan.person}
                  </h4>
                  <p className="text-xs text-app-muted">
                    {isBorrowed
                      ? labels.loans.borrowedFrom(loan.person)
                      : labels.loans.lentTo(loan.person)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-app-muted/70">
                    {typeInfo.hint}
                  </p>
                  <div className="mt-2 text-xs text-app-muted">
                    {!isBorrowed ? (
                      loan.status === 'Pending' ? (
                        <span>
                          {labels.loans.fromAccount}: {loan.fromAccount}
                        </span>
                      ) : (
                        <span>
                          {labels.loans.fromAccount}: {loan.fromAccount}
                          {loan.toAccount ? ` · ${labels.loans.returnedTo}: ${loan.toAccount}` : ''}
                        </span>
                      )
                    ) : loan.status === 'Pending' ? (
                      <span>
                        {labels.loans.receivedIn}: {loan.toAccount}
                      </span>
                    ) : (
                      <span>
                        {labels.loans.receivedIn}: {loan.toAccount}
                        {loan.fromAccount ? ` · ${labels.loans.paidBackFrom}: ${loan.fromAccount}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-app-muted/70">
                    {isBorrowed ? 'Liya · Borrowed' : 'Diya · Lent'}:{' '}
                    {loan.dateGiven?.slice(0, 10)}
                    {loan.dateReturned && loan.status === 'Returned'
                      ? ` · Wapas · ${isBorrowed ? 'Paid back' : 'Returned'}: ${loan.dateReturned.slice(0, 10)}`
                      : ''}
                  </p>
                </div>
                <div className="space-y-2 text-right">
                  <p className="text-lg font-semibold text-app-text">
                    PKR {Number(loan.amountPKR || 0).toLocaleString()}
                  </p>
                  <Link to={`/loans/${loan._id}/edit`}>
                    <Button variant="secondary" size="sm">
                      Edit · Badlo
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default Loans
