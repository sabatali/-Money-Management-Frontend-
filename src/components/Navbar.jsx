import { Download } from 'lucide-react'
import Button from './Button'
import VerificationBadge from './VerificationBadge'
import { useAppContext } from '../context/AppContext'
import { theme } from '../styles/theme'

const Navbar = ({ title, subtitle, actions }) => {
  const { user } = useAppContext()

  return (
    <div className="flex flex-col gap-4 border-b border-app-border bg-app-surface-soft/60 px-4 py-5 backdrop-blur-md md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-app-muted">
          {theme.brand.name} · {theme.brand.tagline}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-app-text">
            {title || 'Welcome back'}
          </h2>
          {user ? <VerificationBadge verified={Boolean(user.emailVerified)} /> : null}
        </div>
        <p className="mt-1 text-sm text-app-muted">
          {subtitle || `Hi ${user?.name || 'there'}, here's your financial overview.`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Button variant="secondary" size="sm">
          <Download size={14} />
          Export
        </Button>
      </div>
    </div>
  )
}

export default Navbar
