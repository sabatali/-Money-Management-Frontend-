import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useAppContext } from '../../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAppContext()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-app-text">Login</h3>
        <p className="text-sm text-app-muted">
          Access your dashboard and manage your finances.
        </p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
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
        <div className="flex items-center justify-between text-xs text-app-muted">
          <span>Forgot password?</span>
          <span>Reset coming soon</span>
        </div>
        {error ? (
          <div className="rounded-xl border border-app-expense/30 bg-app-expense-muted px-3 py-2 text-xs text-app-expense">
            {error}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'}
        </Button>
      </form>
      <p className="text-xs text-app-muted">
        New here?{' '}
        <Link className="font-semibold text-app-accent" to="/register">
          Create an account
        </Link>
      </p>
    </div>
  )
}

export default Login
