const toneClasses = {
  neutral: 'bg-app-surface-elevated text-app-muted ring-1 ring-inset ring-app-border-strong',
  accent: 'bg-app-accent-muted text-app-accent ring-1 ring-inset ring-app-accent/25',
  primary: 'bg-app-primary-muted text-[#a5b4fc] ring-1 ring-inset ring-app-primary/30',
  success: 'bg-app-success-muted text-app-success ring-1 ring-inset ring-app-success/25',
  warning: 'bg-app-warning-muted text-app-warning ring-1 ring-inset ring-app-warning/25',
  danger: 'bg-app-danger-muted text-app-danger ring-1 ring-inset ring-app-danger/25',
  info: 'bg-app-info-muted text-app-info ring-1 ring-inset ring-app-info/25',
  groups: 'bg-app-groups-muted text-app-groups ring-1 ring-inset ring-app-groups/25',
  cancelled: 'bg-app-cancelled-muted text-app-muted ring-1 ring-inset ring-app-cancelled/25',
}

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
}

/**
 * Generic status/label pill used across the app (verification state,
 * member type, transfer status, group-expense semantics, etc.). Pass a
 * `tone` matching the design tokens rather than hardcoding colors.
 */
const Badge = ({ tone = 'neutral', size = 'md', icon: Icon, dot = false, className = '', children }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide ${
        toneClasses[tone] || toneClasses.neutral
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {Icon ? <Icon size={size === 'sm' ? 10 : 12} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

export default Badge
