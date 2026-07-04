import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Navbar from '../../components/Navbar'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../services/api'

const AddGroup = () => {
  const navigate = useNavigate()
  const { token } = useAppContext()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.createGroup(token, { name })
      navigate(`/groups/${response.data._id}`)
    } catch (err) {
      setError(err.message || 'Failed to create group.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Navbar title="Create group" subtitle="Start a shared wallet with roommates." />
      <Card title="Group details">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Room 12B"
            required
          />
          {error ? (
            <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
              {error}
            </div>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create group'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default AddGroup
