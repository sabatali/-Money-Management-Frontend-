import { Outlet } from 'react-router-dom'
import { theme } from '../styles/theme'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-app-base px-4 py-10 text-app-text">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-app-accent text-sm font-bold text-app-base shadow-lg shadow-app-accent/25">
              {theme.brand.shortName}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-app-muted">
                {theme.brand.tagline}
              </p>
              <h1 className="text-2xl font-semibold">{theme.brand.name}</h1>
            </div>
          </div>
          <div className="hidden rounded-full border border-app-border-strong bg-app-surface px-4 py-2 text-xs text-app-muted md:block">
            Secure · Smart · Your finances
          </div>
        </header>
        <main className="grid gap-6 rounded-3xl border border-app-border bg-app-surface p-6 shadow-xl shadow-black/30 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <section className="space-y-4">
            <h2 className="text-3xl font-semibold">
              Take control of your{' '}
              <span className="text-app-accent">money</span>.
            </h2>
            <p className="text-sm text-app-muted">
              Track income, expenses, loans, and transfers in one professional
              dashboard. Built for clarity — see where every rupee goes.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Income', value: 'Track inflows', color: 'text-app-income' },
                { label: 'Expenses', value: 'Monitor spending', color: 'text-app-expense' },
                { label: 'Balance', value: 'Real-time view', color: 'text-app-accent' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-app-border bg-app-surface-soft p-4"
                >
                  <p className={`text-xs font-semibold uppercase tracking-wider ${item.color}`}>
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-app-muted">{item.value}</p>
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
