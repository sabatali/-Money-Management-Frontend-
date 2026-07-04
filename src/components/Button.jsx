const baseClasses =
  'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app-base disabled:opacity-50 disabled:cursor-not-allowed'

const variants = {
  primary:
    'bg-app-accent text-app-base hover:bg-app-accent-hover shadow-sm shadow-app-accent/25',
  secondary:
    'bg-app-surface-elevated text-app-text border border-app-border-strong hover:border-app-accent/40 hover:bg-app-surface-soft',
  ghost: 'bg-transparent text-app-text hover:bg-app-accent-muted',
}

const sizes = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const Button = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export default Button
