import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'
import { theme } from '../../styles/theme'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isAuthenticated, refreshUser } = useAppContext()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!token) {
        setStatus('error')
        setMessage('This verification link is missing its token.')
        return
      }
      try {
        const response = await api.verifyEmail(token)
        if (cancelled) return
        setStatus('success')
        setMessage(response.message || 'Email successfully verified.')
        if (isAuthenticated) {
          refreshUser().catch(() => {})
        }
      } catch (err) {
        if (cancelled) return
        setStatus('error')
        setMessage(err.message || 'Invalid or expired verification link.')
      }
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-base px-4 text-app-text">
      <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-surface p-8 text-center shadow-xl shadow-black/30">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-app-accent text-sm font-bold text-app-base shadow-lg shadow-app-accent/25">
          {theme.brand.shortName}
        </div>

        {status === 'verifying' ? (
          <p className="text-sm text-app-muted">Verifying your email...</p>
        ) : status === 'success' ? (
          <>
            <p className="text-4xl">✅</p>
            <h2 className="mt-3 text-lg font-semibold text-app-text">
              Email successfully verified.
            </h2>
            <p className="mt-2 text-sm text-app-muted">{message}</p>
            <Link to={isAuthenticated ? '/' : '/login'}>
              <Button className="mt-6 w-full">
                {isAuthenticated ? 'Continue to Dashboard' : 'Go to Login'}
              </Button>
            </Link>
          </>
        ) : (
          <>
            <p className="text-4xl">⚠️</p>
            <h2 className="mt-3 text-lg font-semibold text-app-text">Verification failed</h2>
            <p className="mt-2 text-sm text-app-muted">{message}</p>
            <Link to={isAuthenticated ? '/profile' : '/login'}>
              <Button className="mt-6 w-full" variant="secondary">
                {isAuthenticated ? 'Request a new link from Profile' : 'Go to Login'}
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
