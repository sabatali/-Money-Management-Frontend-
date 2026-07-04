import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Navbar from '../../components/Navbar'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'

const Groups = () => {
  const { token } = useAppContext()
  const [groups, setGroups] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchGroups = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.getGroups(token)
      setGroups(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load groups.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return (
    <div className="space-y-6">
      <Navbar
        title="Roommate Groups"
        subtitle="All group expenses are visible to members."
        actions={
          <Link to="/groups/new">
            <Button size="sm">Create group</Button>
          </Link>
        }
      />
      <Card title="Your groups" subtitle="Tap a group to see balances and expenses.">
        {loading ? (
          <p className="text-sm text-app-muted">Loading groups...</p>
        ) : null}
        {error ? (
          <p className="text-sm text-app-expense">{error}</p>
        ) : null}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/groups/${group._id}`}
              className="rounded-2xl border border-app-border bg-app-surface-soft p-4 transition hover:border-app-border-strong"
            >
              <h3 className="text-lg font-semibold text-app-text">{group.name}</h3>
              <p className="mt-1 text-xs text-app-muted">
                Members: {group.members?.length || 0}
              </p>
            </Link>
          ))}
          {!loading && groups.length === 0 ? (
            <div className="rounded-2xl border border-app-border bg-app-surface-soft p-4 text-sm text-app-muted">
              No groups yet. Create one to start splitting expenses.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}

export default Groups
