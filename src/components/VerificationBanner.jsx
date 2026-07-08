import { useEffect, useState } from 'react'
import { Mail } from 'lucide-react'
import Button from './Button'
import { useAppContext } from '../context/AppContext'

const DEFAULT_COOLDOWN_SECONDS = 60

/**
 * Persistent, dismissible nudge shown while the user's email is unverified.
 * Dismissal is remembered for the current session only (see AppContext),
 * so it reappears on the next login as required.
 */
const VerificationBanner = () => {
  const { user, verificationBannerDismissed, dismissVerificationBanner, sendVerificationEmail } =
    useAppContext()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  if (!user || user.emailVerified || verificationBannerDismissed) {
    return null
  }

  const handleVerify = async () => {
    setStatus('sending')
    setMessage('')
    try {
      const response = await sendVerificationEmail()
      setStatus('sent')
      setMessage(response?.message || 'Verification email sent. Please check your inbox.')
      setCooldown(response?.data?.cooldownSeconds || DEFAULT_COOLDOWN_SECONDS)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Failed to send verification email.')
      if (err.data?.retryAfterSeconds) {
        setCooldown(err.data.retryAfterSeconds)
      }
    }
  }

  const buttonLabel =
    cooldown > 0
      ? `Resend in ${cooldown}s`
      : status === 'sending'
        ? 'Sending...'
        : status === 'sent'
          ? 'Resend Email'
          : 'Verify Email'

  return (
    <div className="border-b border-app-accent/30 bg-app-accent-muted px-4 py-3 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-accent/15 text-app-accent">
            <Mail size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-app-text">
              Verify your email to unlock all LibraMate features.
            </p>
            <p className="text-xs text-app-muted">
              Your email is not verified yet. Verify now to securely use Group Expenses and
              future collaborative features.
            </p>
            {message ? (
              <p
                className={`mt-1 text-xs font-medium ${
                  status === 'error' ? 'text-app-expense' : 'text-app-income'
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={handleVerify} disabled={status === 'sending' || cooldown > 0}>
            {buttonLabel}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismissVerificationBanner}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VerificationBanner
