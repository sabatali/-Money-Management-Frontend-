const Card = ({ title, subtitle, children, className = '' }) => {
  return (
    <div
      className={`rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm shadow-black/20 ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-app-text">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-sm text-app-muted">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export default Card
