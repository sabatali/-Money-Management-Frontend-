const Card = ({ title, subtitle, actions, children, className = '', hoverable = false, as: Component = 'div', ...props }) => {
  return (
    <Component
      className={`rounded-2xl border border-app-border bg-app-surface p-5 shadow-elevation-1 transition-all duration-200 ${
        hoverable ? 'hover:-translate-y-0.5 hover:border-app-border-strong hover:shadow-elevation-2' : ''
      } ${className}`}
      {...props}
    >
      {title || actions ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h3 className="text-base font-semibold text-app-text">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-app-muted">{subtitle}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </Component>
  )
}

export default Card
