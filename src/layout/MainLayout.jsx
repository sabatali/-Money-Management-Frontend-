import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, ArrowLeftRight, HandCoins, Repeat, Users, CircleUserRound } from 'lucide-react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import VerificationBanner from '../components/VerificationBanner'
import SetupBanner from '../components/SetupBanner'
import ClaimGuestPrompt from '../components/ClaimGuestPrompt'
import { useAppContext } from '../context/AppContext'

const mobileNavItems = [
  { label: 'Home', path: '/', icon: LayoutGrid, end: true },
  { label: 'Tx', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Udhar', path: '/loans', icon: HandCoins },
  { label: 'Transfers', path: '/transfers', icon: Repeat },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'Profile', path: '/profile', icon: CircleUserRound },
]

const MainLayout = () => {
  const { isAuthenticated, refreshAccounts, refreshAccountBalances } = useAppContext()
  const location = useLocation()

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
          <SetupBanner />
          <ClaimGuestPrompt />
          <div className="flex-1 overflow-y-auto px-4 pb-24 pt-6 md:px-6 md:pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <div className="rounded-2xl border border-app-border bg-app-surface/95 p-2 shadow-elevation-3 backdrop-blur-md">
          <div className="flex justify-between gap-1">
            {mobileNavItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-[10px] font-medium transition-colors ${
                      isActive
                        ? 'bg-app-accent-muted text-app-accent'
                        : 'text-app-muted hover:text-app-text'
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
