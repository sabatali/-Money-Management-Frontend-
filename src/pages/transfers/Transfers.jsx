import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import { useAppContext } from '../../context/AppContext'

const Transfers = () => {
  const { transfers, refreshTransfers } = useAppContext()

  useEffect(() => {
    refreshTransfers()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-semibold text-app-text">Transfers</h3>
          <p className="text-sm text-app-muted">
            Move money between accounts with clarity.
          </p>
        </div>
        <Link to="/transfers/new">
          <Button>Add Transfer</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {transfers.map((transfer) => (
          <Card key={transfer._id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-app-muted">
                  {transfer.currency}
                </p>
                <h4 className="text-lg font-semibold text-app-text">
                  {transfer.fromAccount} → {transfer.toAccount}
                </h4>
                <p className="text-xs text-app-muted">
                  {transfer.date?.slice(0, 10)} · {transfer.description}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-lg font-semibold text-app-text">
                  {transfer.currency} {transfer.amountOriginal}
                </p>
                <p className="text-xs text-app-muted">
                  PKR {Number(transfer.amountPKR || 0).toLocaleString()}
                </p>
                {transfer.fee > 0 && (
                  <p className="text-xs text-amber-200/80">
                    Fee: {transfer.feeCurrency || transfer.currency} {transfer.fee}
                    {' '}→ PKR {Number(transfer.feePKR || 0).toLocaleString()}
                  </p>
                )}
                <Link to={`/transfers/${transfer._id}/edit`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Transfers
