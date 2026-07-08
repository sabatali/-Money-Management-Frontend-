import { AlertCircle, CheckCircle2 } from 'lucide-react'

const Input = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  helper,
  error,
  success,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const inputId = id || name
  const state = error ? 'error' : success ? 'success' : 'default'

  const ringClasses = {
    default: 'border-app-border-strong focus:border-app-accent focus:ring-app-accent/25',
    error: 'border-app-danger/60 focus:border-app-danger focus:ring-app-danger/25',
    success: 'border-app-success/60 focus:border-app-success focus:ring-app-success/25',
  }

  return (
    <div className={`flex flex-col gap-2 text-sm ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="font-medium text-app-text">
          {label}
          {required ? <span className="text-app-accent"> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-muted"
          />
        ) : null}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-app-surface text-app-text placeholder:text-app-muted/60 outline-none transition-colors duration-150 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
            Icon ? 'pl-9 pr-3' : 'px-3.5'
          } py-2.5 ${ringClasses[state]}`}
          {...props}
        />
        {state === 'error' ? (
          <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-danger" />
        ) : null}
        {state === 'success' ? (
          <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-success" />
        ) : null}
      </div>
      {error ? (
        <span className="flex items-center gap-1 text-xs text-app-danger">{error}</span>
      ) : null}
      {!error && success ? (
        <span className="flex items-center gap-1 text-xs text-app-success">{success}</span>
      ) : null}
      {!error && !success && helper ? (
        <span className="text-xs text-app-muted">{helper}</span>
      ) : null}
    </div>
  )
}

export default Input
