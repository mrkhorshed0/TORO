import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="prose-section">
      <div className="container container-narrow">
        <div className="prose-block" style={{ textAlign: 'center' }}>
          <p className="kicker-text">404</p>
          <h1 className="page-title" style={{ marginBottom: '12px' }}>
            Page not found
          </h1>
          <p style={{ margin: '0 auto 24px' }}>
            The page you requested does not exist or may have moved.
          </p>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFound
