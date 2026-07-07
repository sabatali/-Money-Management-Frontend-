import { Link } from 'react-router-dom'
import Card from './Card'
import Button from './Button'

/**
 * Friendly blocker shown instead of a broken/empty form when the user
 * hasn't set up the accounts/categories a feature depends on yet
 * (e.g. they skipped onboarding or deleted everything).
 */
const SetupRequiredNotice = ({
  title = 'A bit more setup needed',
  message = 'You need to set this up before continuing.',
  actionLabel = 'Set it up',
  actionTo = '/accounts',
  secondaryLabel,
  secondaryTo,
}) => {
  return (
    <Card>
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-app-accent-muted text-2xl">
          🧭
        </div>
        <h3 className="text-base font-semibold text-app-text">{title}</h3>
        <p className="max-w-sm text-sm text-app-muted">{message}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link to={actionTo}>
            <Button>{actionLabel}</Button>
          </Link>
          {secondaryTo ? (
            <Link to={secondaryTo}>
              <Button variant="secondary">{secondaryLabel}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export default SetupRequiredNotice
