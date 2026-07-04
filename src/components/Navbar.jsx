import Button from './Button'
import { useAppContext } from '../context/AppContext'
import { theme } from '../styles/theme'

const Navbar = ({ title, subtitle, actions }) => {
  const { user } = useAppContext()

  return (
    <div className="flex flex-col gap-4 border-b border-app-border bg-app-surface-soft/50 px-4 py-5 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
          {theme.brand.name} · {theme.brand.tagline}
        </p>
        <h2 className="text-2xl font-semibold text-app-text">
          {title || 'Welcome back'}
        </h2>
        <p className="mt-1 text-sm text-app-muted">
          {subtitle || `Hi ${user?.name || 'there'}, here's your financial overview.`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <Button variant="secondary" size="sm">
          Export
        </Button>
      </div>
    </div>
  )
}

export default Navbar
