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
  required = false,
}) => {
  const inputId = id || name

  return (
    <div className="flex flex-col gap-2 text-sm">
      {label ? (
        <label htmlFor={inputId} className="font-medium text-app-text">
          {label}
          {required ? <span className="text-app-accent"> *</span> : null}
        </label>
      ) : null}
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        className="w-full rounded-lg border border-app-border-strong bg-app-surface px-3 py-2.5 text-app-text placeholder:text-app-muted/60 focus:border-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent/30"
      />
      {error ? (
        <span className="text-xs text-app-expense">{error}</span>
      ) : null}
      {helper ? (
        <span className="text-xs text-app-muted">{helper}</span>
      ) : null}
    </div>
  )
}

export default Input
