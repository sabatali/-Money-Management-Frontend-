import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatAccountOptionLabel } from '../utils/accountDisplay'

const selectClassName =
  'rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30'

const AccountSelect = ({
  label = 'Account',
  name = 'account',
  value,
  onChange,
  required = false,
  placeholder = 'Select account',
  accountNames = null,
  className = selectClassName,
  disabled = false,
}) => {
  const { accounts, accountBalances } = useAppContext()

  const options = useMemo(() => {
    if (Array.isArray(accountNames)) {
      if (accountNames.length === 0) return []
      return accountNames.map((accountName) => ({ name: accountName }))
    }
    if (accountBalances.length > 0) {
      return accountBalances.map((item) => ({ name: item.name }))
    }
    return accounts.map((account) => ({ name: account.name }))
  }, [accountNames, accountBalances, accounts])

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="font-medium text-app-text">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={className}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.name} value={option.name}>
            {formatAccountOptionLabel(option.name, accountBalances)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default AccountSelect
