import Input from './Input'

const SplitInput = ({ label, value, onChange }) => {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface-soft p-3">
      <div className="text-xs text-app-muted">{label}</div>
      <div className="mt-2">
        <Input type="number" value={value} onChange={onChange} placeholder="0" />
      </div>
    </div>
  )
}

export default SplitInput
