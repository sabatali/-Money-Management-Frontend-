import { useEffect, useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import { useAppContext } from '../context/AppContext'
import { api } from '../services/api'

const DISMISSED_KEY = 'libramate_claim_prompt_dismissed'

const readDismissed = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

const persistDismissed = (set) => {
  sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)))
}

/**
 * Detects unclaimed guest group-member profiles matching the logged-in
 * user's email and offers to link them, preserving their expense history.
 * Dismissal is remembered for the current session only, so it reappears
 * on the next login (same pattern as VerificationBanner/SetupBanner).
 */
const ClaimGuestPrompt = () => {
  const { token, isAuthenticated } = useAppContext()
  const [claims, setClaims] = useState([])
  const [dismissed, setDismissed] = useState(() => readDismissed())
  const [claimingId, setClaimingId] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      setClaims([])
      return undefined
    }
    let active = true
    api
      .getPendingGuestClaims(token)
      .then((res) => {
        if (active) setClaims(res.data || [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isAuthenticated, token])

  const visibleClaims = claims.filter((claim) => !dismissed.has(claim.memberId))

  if (visibleClaims.length === 0) return null

  const handleDismiss = (memberId) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(memberId)
      persistDismissed(next)
      return next
    })
  }

  const handleClaim = async (memberId) => {
    setClaimingId(memberId)
    setError('')
    setSuccessMessage('')
    try {
      await api.claimGuestMember(token, memberId)
      setSuccessMessage('Profile claimed! Your group history is now linked to your account.')
      setClaims((prev) => prev.filter((claim) => claim.memberId !== memberId))
    } catch (err) {
      setError(err.message || 'Failed to claim profile.')
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <Modal
      isOpen
      onClose={() => visibleClaims.forEach((claim) => handleDismiss(claim.memberId))}
      title="We found previous group expenses for you"
      description="It looks like you were added as a guest before creating your account. Claim these profiles to link their expense history — nothing is duplicated."
    >
      <div className="space-y-3">
        {successMessage ? (
          <p className="rounded-lg bg-app-income-muted px-3 py-2 text-sm text-app-income">
            {successMessage}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-app-expense-muted px-3 py-2 text-sm text-app-expense">{error}</p>
        ) : null}
        {visibleClaims.map((claim) => (
          <div
            key={claim.memberId}
            className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2"
          >
            <div>
              <p className="text-sm text-app-text">{claim.guestName}</p>
              <p className="text-xs text-app-muted">in &ldquo;{claim.groupName}&rdquo;</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={claimingId === claim.memberId}
                onClick={() => handleClaim(claim.memberId)}
              >
                {claimingId === claim.memberId ? 'Claiming...' : 'Claim Profile'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDismiss(claim.memberId)}>
                Cancel
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default ClaimGuestPrompt
