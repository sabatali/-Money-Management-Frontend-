import { Component } from 'react'
import Button from './Button'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-app-base px-4 text-app-text">
          <div className="max-w-md rounded-2xl border border-app-border bg-app-surface p-6 text-center shadow-xl">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-app-muted">
              Kuch ghalat ho gaya — page load nahi ho saka.
            </p>
            <p className="mt-3 rounded-lg bg-app-surface-soft px-3 py-2 text-xs text-app-expense">
              {this.state.error.message}
            </p>
            <Button className="mt-4" onClick={this.handleReload}>
              Reload page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
