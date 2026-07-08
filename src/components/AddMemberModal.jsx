import { useState } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'

const AddMemberModal = ({
  isOpen,
  onClose,
  memberEmail,
  onMemberEmailChange,
  onSearchUsers,
  searchResults,
  searchLoading,
  onAddRegistered,
  onAddGuest,
  guestSubmitting,
  guestError,
}) => {
  const [tab, setTab] = useState('registered')
  const [guestForm, setGuestForm] = useState({ name: '', email: '', phone: '', notes: '' })

  if (!isOpen) return null

  const handleGuestChange = (event) => {
    const { name, value } = event.target
    setGuestForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleGuestSubmit = async (event) => {
    event.preventDefault()
    const ok = await onAddGuest(guestForm)
    if (ok) {
      setGuestForm({ name: '', email: '', phone: '', notes: '' })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add member"
      description="Add someone with a LibraMate account, or a guest who doesn't need one."
    >
      <div className="mb-4 flex gap-2 rounded-xl border border-app-border bg-app-surface-soft p-1">
        <button
          type="button"
          onClick={() => setTab('registered')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'registered'
              ? 'bg-app-surface text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          🟢 LibraMate User
        </button>
        <button
          type="button"
          onClick={() => setTab('guest')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'guest'
              ? 'bg-app-surface text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          ⚪ Guest Member
        </button>
      </div>

      {tab === 'registered' ? (
        <div className="space-y-4">
          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault()
              onSearchUsers()
            }}
          >
            <Input
              label="Search member by email"
              type="email"
              value={memberEmail}
              onChange={onMemberEmailChange}
              placeholder="roommate@email.com"
              required
            />
            <Button type="submit" disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          {searchResults.length ? (
            <div className="space-y-2">
              {searchResults.map((userResult) => (
                <div
                  key={userResult.id}
                  className="flex items-center justify-between rounded-xl border border-app-border bg-app-surface-soft px-3 py-2 text-sm"
                >
                  <div>
                    <div className="text-app-text">{userResult.name}</div>
                    <div className="text-xs text-app-muted">{userResult.email}</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => onAddRegistered(userResult.id)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <form className="space-y-3" onSubmit={handleGuestSubmit}>
          <Input
            label="Full name"
            name="name"
            value={guestForm.name}
            onChange={handleGuestChange}
            placeholder="Ali Raza"
            required
          />
          <Input
            label="Email (optional)"
            name="email"
            type="email"
            value={guestForm.email}
            onChange={handleGuestChange}
            placeholder="ali@gmail.com"
          />
          <Input
            label="Phone (optional)"
            name="phone"
            value={guestForm.phone}
            onChange={handleGuestChange}
            placeholder="+92XXXXXXXXXX"
          />
          <Input
            label="Notes (optional)"
            name="notes"
            value={guestForm.notes}
            onChange={handleGuestChange}
            placeholder="Roommate"
          />
          {guestError ? (
            <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {guestError}
            </div>
          ) : null}
          <p className="text-xs text-app-muted">
            Guests don't need a LibraMate account — they can still be included in expenses,
            owe or receive money, and be invited to join LibraMate later.
          </p>
          <Button type="submit" disabled={guestSubmitting}>
            {guestSubmitting ? 'Saving...' : 'Save guest'}
          </Button>
        </form>
      )}
    </Modal>
  )
}

export default AddMemberModal
