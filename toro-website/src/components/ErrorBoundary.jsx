import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error caught by ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="policy-shell">
          <main className="policy-main">
            <div className="container container-narrow">
              <div className="prose-block">
                <p className="kicker-text">Application Notice</p>
                <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
                  Something interrupted this request
                </h1>
                <p>
                  We encountered an unexpected data or permission error while
                  loading this view.
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {this.state.message}
                </p>
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.handleReset}
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
