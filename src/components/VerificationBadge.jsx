import { CheckCircle2, Clock3 } from 'lucide-react'
import Badge from './Badge'

const VerificationBadge = ({ verified, className = '' }) => (
  <Badge tone={verified ? 'success' : 'warning'} icon={verified ? CheckCircle2 : Clock3} className={className}>
    {verified ? 'Verified' : 'Not Verified'}
  </Badge>
)

export default VerificationBadge
