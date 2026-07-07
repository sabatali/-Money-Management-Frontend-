import { useMemo, useState } from 'react'
import Input from './Input'
import Button from './Button'

/**
 * Generic searchable, grouped, multi-select checklist used by the onboarding
 * screens for choosing accounts/categories from a master catalogue, plus an
 * inline "add custom" affordance for entries not in the list.
 *
 * items: [{ id, name, icon?, group }]
 * selectedIds: Set<string>
 */
const SearchableChecklist = ({
  items,
  selectedIds,
  onToggle,
  searchPlaceholder = 'Search...',
  customPlaceholder = 'Add a custom entry',
  onAddCustom,
  customError = '',
  emptyMessage = 'No matches found.',
}) => {
  const [query, setQuery] = useState('')
  const [customValue, setCustomValue] = useState('')

  const groups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = normalizedQuery
      ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      : items

    const byGroup = new Map()
    filtered.forEach((item) => {
      const key = item.group || 'Other'
      if (!byGroup.has(key)) byGroup.set(key, [])
      byGroup.get(key).push(item)
    })
    return Array.from(byGroup.entries())
  }, [items, query])

  const handleAddCustom = (event) => {
    event.preventDefault()
    if (!customValue.trim() || !onAddCustom) return
    onAddCustom(customValue.trim())
    setCustomValue('')
  }

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder}
      />

      <div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-app-muted">{emptyMessage}</p>
        ) : (
          groups.map(([groupName, groupItems]) => (
            <div key={groupName}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-app-muted">
                {groupName}
              </h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {groupItems.map((item) => {
                  const isSelected = selectedIds.has(item.id)
                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'border-app-accent/60 bg-app-accent-muted text-app-text'
                          : 'border-app-border bg-app-surface-soft text-app-text hover:border-app-border-strong'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(item.id)}
                        className="h-4 w-4 rounded border-app-border-strong accent-app-accent"
                      />
                      {item.icon ? (
                        <span className="text-base leading-none">{item.icon}</span>
                      ) : null}
                      <span className="flex-1 truncate">{item.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {onAddCustom ? (
        <form onSubmit={handleAddCustom} className="flex gap-2 border-t border-app-border pt-4">
          <div className="flex-1">
            <Input
              value={customValue}
              onChange={(event) => setCustomValue(event.target.value)}
              placeholder={customPlaceholder}
              error={customError}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={!customValue.trim()}>
            Add
          </Button>
        </form>
      ) : null}
    </div>
  )
}

export default SearchableChecklist
