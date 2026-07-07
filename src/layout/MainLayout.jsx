import { NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import VerificationBanner from '../components/VerificationBanner'
import { useAppContext } from '../context/AppContext'

const MainLayout = () => {
  const { isAuthenticated, refreshAccounts, refreshAccountBalances } = useAppContext()

  useEffect(() => {
    if (!isAuthenticated) return
    refreshAccounts()
    refreshAccountBalances()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <div className="min-h-screen bg-app-base text-app-text">
      <div className="grid min-h-screen grid-cols-1 ">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex min-h-screen flex-col md:ml-[240px]">
          <Navbar />
          <VerificationBanner />
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
            <Outlet />
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="rounded-2xl border border-app-border bg-app-surface p-2 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between text-xs text-app-muted">
            <span>Quick nav</span>
            <span className="text-app-accent">FinVault</span>
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'Tx', path: '/transactions' },
              { label: 'Udhar', path: '/loans' },
              { label: 'Transfers', path: '/transfers' },
              { label: 'Groups', path: '/groups' },
              { label: 'Profile', path: '/profile' },
            ].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-medium ${
                    isActive
                      ? 'bg-app-accent-muted text-app-accent'
                      : 'bg-app-surface-soft text-app-text'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
