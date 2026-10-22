import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Toro</h1>
          <p className="hero-sub">
            A Bangladesh-based software company publishing mobile apps and games
            on Google Play Store and Amazon Appstore.
          </p>
          <div className="hero-actions">
            <Link to="/apps-games" className="btn btn-primary">
              View Our Apps
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Our Divisions</h2>
          <div className="grid grid-2">
            <div className="card">
              <h3>Mobile Apps &amp; Games</h3>
              <p>
                We develop and publish mobile applications and games for Google
                Play Store and Amazon Appstore.
              </p>
            </div>
            <div className="card">
              <h3>Computer Division</h3>
              <p>
                Our computer division focuses on software development and
                publishing across multiple platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">What We Publish</h2>
          <div className="tags">
            <span className="tag">Educational apps</span>
            <span className="tag">Utility apps</span>
            <span className="tag">Casual games</span>
            <span className="tag">Puzzle games</span>
            <span className="tag">Entertainment apps</span>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Why Toro</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>Bangladesh-based team</h3>
              <p>Operated from Rangpur, Bangladesh.</p>
            </div>
            <div className="card">
              <h3>Multi-store publishing</h3>
              <p>Apps live on Google Play Store and Amazon Appstore.</p>
            </div>
            <div className="card">
              <h3>Quality first</h3>
              <p>
                Every app is built with a focus on performance and user
                experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <h2>Have a question or a project idea?</h2>
            <p>Get in touch with our team.</p>
            <Link to="/contact" className="btn btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
