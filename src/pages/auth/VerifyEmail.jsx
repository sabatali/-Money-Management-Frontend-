import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Button from '../../components/Button'
import Logo from '../../components/Logo'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'

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
      <div className="w-full max-w-md rounded-3xl border border-app-border bg-app-surface p-8 text-center shadow-elevation-3">
        <div className="mx-auto mb-5 flex justify-center">
          <Logo size="lg" />
        </div>

        {status === 'verifying' ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-surface-elevated">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-app-border-strong border-t-app-accent" />
            </div>
            <p className="mt-4 text-sm text-app-muted">Verifying your email...</p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-success-muted text-app-success">
              <CheckCircle2 size={26} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-app-text">
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-app-danger-muted text-app-danger">
              <AlertTriangle size={24} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-app-text">Verification failed</h2>
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
