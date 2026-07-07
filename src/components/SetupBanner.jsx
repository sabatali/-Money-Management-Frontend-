import { Link } from 'react-router-dom'
import Button from './Button'
import { useAppContext } from '../context/AppContext'

/**
 * Persistent, dismissible nudge shown when a user skipped onboarding (or
 * deleted everything) and has no accounts set up yet. Dismissal is
 * remembered for the current session only, so it reappears on next login,
 * mirroring the VerificationBanner pattern.
 */
const SetupBanner = () => {
  const { isAuthenticated, accounts, setupBannerDismissed, dismissSetupBanner } = useAppContext()

  if (!isAuthenticated || accounts.length > 0 || setupBannerDismissed) {
    return null
  }

  return (
    <div className="border-b border-app-border-strong bg-app-surface-soft px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-lg leading-none">🧭</span>
          <div>
            <p className="text-sm font-semibold text-app-text">
              Finish setting up your accounts and categories.
            </p>
            <p className="text-xs text-app-muted">
              You'll need at least one account and category before you can record transactions,
              transfers, or loans.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link to="/onboarding">
            <Button size="sm">Finish setup</Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={dismissSetupBanner}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SetupBanner
