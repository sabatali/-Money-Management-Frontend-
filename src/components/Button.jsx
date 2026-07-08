import { Loader2 } from 'lucide-react'

const baseClasses =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2 focus-visible:ring-offset-app-base disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]'

const variants = {
  primary:
    'bg-app-accent text-white shadow-sm shadow-app-accent/20 hover:bg-app-accent-hover hover:shadow-md hover:shadow-app-accent/25',
  secondary:
    'border border-app-border-strong bg-app-surface-elevated text-app-text hover:border-app-accent/40 hover:bg-app-surface-soft',
  outline:
    'border border-app-border-strong bg-transparent text-app-text hover:border-app-accent/50 hover:bg-app-accent-muted',
  ghost: 'bg-transparent text-app-muted hover:bg-app-surface-elevated hover:text-app-text',
  danger:
    'bg-app-danger text-white shadow-sm shadow-app-danger/20 hover:bg-app-danger/90 hover:shadow-md hover:shadow-app-danger/25',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const Button = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" /> : null}
      {children}
    </button>
  )
}

export default Button
