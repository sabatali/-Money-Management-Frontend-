import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  HandCoins,
  Repeat,
  Users,
  CircleUserRound,
  Sparkles,
} from 'lucide-react'
import { theme } from '../styles/theme'
import { labels } from '../constants/labels'
import Logo from './Logo'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutGrid, end: true },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Accounts', path: '/accounts', icon: Wallet },
  { label: labels.nav.loans, path: '/loans', icon: HandCoins },
  { label: 'Transfers', path: '/transfers', icon: Repeat },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'Profile', path: '/profile', icon: CircleUserRound },
]

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-app-border bg-app-surface-soft px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-1">
        <Logo size="md" />
        <div>
          <h1 className="text-lg font-bold leading-tight text-app-text">{theme.brand.name}</h1>
          <p className="text-[11px] uppercase tracking-[0.16em] text-app-muted">
            {theme.brand.tagline}
          </p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-app-accent-muted text-app-accent'
                    : 'text-app-muted hover:bg-app-surface-elevated hover:text-app-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 2}
                    className="shrink-0"
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div className="rounded-xl border border-app-border bg-app-surface p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-app-accent">
          <Sparkles size={13} />
          Smart budgeting
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-app-muted">
          Track income, expenses, and transfers in one place.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
