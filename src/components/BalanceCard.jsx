import BilingualLabel from './BilingualLabel'
import { balanceDisplay } from '../constants/labels'

const BalanceCard = ({ name, balance }) => {
  const isPositive = balance > 0
  const isZero = balance === 0

  const status = isZero
    ? balanceDisplay.settled
    : isPositive
      ? balanceDisplay.receive
      : balanceDisplay.pay

  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${
        isPositive
          ? 'border-app-income/30 bg-app-income-muted'
          : isZero
            ? 'border-app-border bg-app-surface-soft'
            : 'border-app-expense/30 bg-app-expense-muted'
      }`}
    >
      <div className="text-sm text-app-muted">{name}</div>
      <div className="mt-2">
        <BilingualLabel
          en={status.en}
          ur={status.ur}
          hint={status.hint}
          primaryClassName="text-lg font-semibold text-app-text"
          urClassName="text-sm font-normal text-app-muted"
        />
      </div>
      <div
        className={`mt-1 text-2xl font-semibold ${
          isPositive ? 'text-app-income' : isZero ? 'text-app-muted' : 'text-app-expense'
        }`}
      >
        PKR {Math.abs(balance).toLocaleString()}
      </div>
    </div>
  )
}

export default BalanceCard
