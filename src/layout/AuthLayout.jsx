import { Outlet } from 'react-router-dom'
import { ShieldCheck, TrendingUp, Wallet } from 'lucide-react'
import { theme } from '../styles/theme'
import Logo from '../components/Logo'

const highlights = [
  { label: 'Income', value: 'Track inflows', icon: TrendingUp, tone: 'text-app-success' },
  { label: 'Expenses', value: 'Monitor spending', icon: Wallet, tone: 'text-app-danger' },
  { label: 'Balance', value: 'Real-time view', icon: ShieldCheck, tone: 'text-app-accent' },
]

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-app-base px-4 py-10 text-app-text">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{theme.brand.name}</h1>
              <p className="text-xs uppercase tracking-[0.16em] text-app-muted">
                {theme.brand.tagline}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-app-border-strong bg-app-surface px-4 py-2 text-xs text-app-muted md:flex">
            <ShieldCheck size={14} className="text-app-accent" />
            Secure · Smart · Your finances
          </div>
        </header>
        <main className="grid gap-6 rounded-3xl border border-app-border bg-app-surface p-6 shadow-elevation-3 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <section className="space-y-5">
            <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Take control of your <span className="text-app-accent">money</span>.
            </h2>
            <p className="text-sm leading-relaxed text-app-muted">
              Track income, expenses, loans, and shared group expenses in one premium
              dashboard. Built for clarity — see exactly where every rupee goes.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-app-border bg-app-surface-soft p-4 transition-colors hover:border-app-border-strong"
                >
                  <item.icon size={16} className={item.tone} />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-app-text">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-app-muted">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-app-border bg-app-surface-soft p-6">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}

export default AuthLayout
