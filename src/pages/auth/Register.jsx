import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAppContext } from '../../context/AppContext'

const Register = () => {
  const navigate = useNavigate()
  const { register, isLoading } = useAppContext()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-app-text">Register</h3>
        <p className="text-sm text-app-muted">
          Create an account to start managing your money.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Aisha Khan"
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@email.com"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
        />
        {error ? (
          <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create account'}
        </Button>
      </form>
      <p className="text-xs text-app-muted">
        Already have an account?{' '}
        <Link className="font-semibold text-app-accent" to="/login">
          Login
        </Link>
      </p>
    </div>
  )
}

export default Register
