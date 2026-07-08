const sizes = {
  sm: { box: 'h-8 w-8 rounded-lg', icon: 16 },
  md: { box: 'h-10 w-10 rounded-xl', icon: 20 },
  lg: { box: 'h-12 w-12 rounded-xl', icon: 24 },
}

/**
 * LibraMate brand mark: a balanced "L" ledger stroke with an accent dot,
 * echoing the idea of balance + tracked value. Kept as inline SVG (no
 * external asset) so it always matches the current accent color.
 */
const Logo = ({ size = 'md', className = '' }) => {
  const { box, icon } = sizes[size] || sizes.md

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${box} bg-app-accent/12 ring-1 ring-inset ring-app-accent/30 ${className}`}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M7 4V15.5C7 16.8807 8.11929 18 9.5 18H18"
          stroke="var(--color-app-accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="7" r="2" fill="var(--color-app-accent)" />
      </svg>
    </div>
  )
}

export default Logo
