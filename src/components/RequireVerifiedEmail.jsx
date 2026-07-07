import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import Card from './Card'
import { useAppContext } from '../context/AppContext'

/**
 * Feature guard for routes that declare `requiresVerifiedEmail: true` (see
 * routes/groupRoutes.js). Renders a friendly "verify to continue" screen
 * instead of the page when the signed-in user hasn't verified their email
 * yet, and unlocks immediately once verification completes (polled from
 * AppContext) — no re-login required.
 */
const RequireVerifiedEmail = ({ children }) => {
  const navigate = useNavigate()
  const { user, sendVerificationEmail, refreshUser } = useAppContext()
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.emailVerified) return undefined
    refreshUser().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (user?.emailVerified) {
    return children
  }

  const handleVerify = async () => {
    setStatus('sending')
    setMessage('')
    try {
      const response = await sendVerificationEmail()
      setStatus('sent')
      setMessage(response?.message || 'Verification email sent. Please check your inbox.')
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Failed to send verification email.')
    }
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card title="Email Verification Required">
        <p className="text-sm text-app-muted">
          Group Expenses involve multiple users. To protect everyone and prevent fake
          accounts, please verify your email before using this feature.
        </p>
        {message ? (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-xs ${
              status === 'error'
                ? 'border-app-expense/30 bg-app-expense-muted text-app-expense'
                : 'border-app-income/30 bg-app-income-muted text-app-income'
            }`}
          >
            {message}
          </div>
        ) : null}
        <div className="mt-6 flex gap-3">
          <Button onClick={handleVerify} disabled={status === 'sending' || status === 'sent'}>
            {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Email sent' : 'Verify Email'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default RequireVerifiedEmail
