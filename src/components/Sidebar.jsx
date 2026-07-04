import { NavLink } from 'react-router-dom'
import { theme } from '../styles/theme'
import { labels } from '../constants/labels'

const navItems = [
  { label: 'Dashboard', path: '/', icon: '◈' },
  { label: 'Transactions', path: '/transactions', icon: '⇄' },
  { label: 'Accounts', path: '/accounts', icon: '▣' },
  { label: labels.nav.loans, path: '/loans', icon: '↗' },
  { label: 'Transfers', path: '/transfers', icon: '⟳' },
  { label: 'Groups', path: '/groups', icon: '◎' },
  { label: 'Profile', path: '/profile', icon: '○' },
]

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-app-border bg-app-surface-soft px-4 py-6 md:flex">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-accent text-sm font-bold text-app-base shadow-lg shadow-app-accent/20">
            {theme.brand.shortName}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
              {theme.brand.tagline}
            </p>
            <h1 className="text-lg font-semibold text-app-text">
              {theme.brand.name}
            </h1>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition ${
                isActive
                  ? 'bg-app-accent-muted text-app-accent'
                  : 'text-app-muted hover:bg-app-primary-muted hover:text-app-text'
              }`
            }
          >
            <span className="text-xs opacity-70">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-xl border border-app-border bg-app-surface p-4">
        <p className="text-xs font-medium text-app-accent">Smart budgeting</p>
        <p className="mt-1 text-xs text-app-muted">
          Track income, expenses, and transfers in one place.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
