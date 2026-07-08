import { CheckCircle2, Circle, Crown } from 'lucide-react'
import Badge from './Badge'

const MemberChip = ({ name, role, memberType = 'registered' }) => {
  const isGuest = memberType === 'guest'
  return (
    <div className="flex items-center gap-2 rounded-full border border-app-border-strong bg-app-surface py-1 pl-3 pr-2 text-xs text-app-text">
      <span className="font-medium">{name}</span>
      {role === 'admin' ? (
        <Badge tone="accent" size="sm" icon={Crown}>
          Admin
        </Badge>
      ) : null}
      <Badge tone={isGuest ? 'neutral' : 'success'} size="sm" icon={isGuest ? Circle : CheckCircle2}>
        {isGuest ? 'Guest' : 'Registered'}
      </Badge>
    </div>
  )
}

export default MemberChip
