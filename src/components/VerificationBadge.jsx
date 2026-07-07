const VerificationBadge = ({ verified, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
      verified
        ? 'bg-app-income-muted text-app-income'
        : 'bg-app-accent-muted text-app-accent'
    } ${className}`}
  >
    {verified ? '🟢 Verified' : '🟡 Not Verified'}
  </span>
)

export default VerificationBadge
