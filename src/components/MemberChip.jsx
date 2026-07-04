const MemberChip = ({ name, role }) => {
  return (
    <div className="flex items-center gap-2 rounded-full border border-app-border-strong bg-app-surface px-3 py-1 text-xs text-app-text">
      <span>{name}</span>
      {role === 'admin' ? (
        <span className="rounded-full bg-app-accent-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-app-muted">
          Admin
        </span>
      ) : null}
    </div>
  )
}

export default MemberChip
