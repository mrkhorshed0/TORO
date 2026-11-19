import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

function About() {
  const { content } = useSiteContent()
  const about = content.about

  return (
    <>
      <section className="page-hero">
        <div className="container container-narrow">
          <p className="kicker-text">{about.kicker}</p>
          <h1 className="page-title">{about.title}</h1>
          <p className="page-lead">{about.lead}</p>
        </div>
      </section>

      <section className="prose-section">
        <div className="container container-narrow">
          <div className="prose-block">
            <h2>Studio Overview</h2>
            {(about.bodyParagraphs || []).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            <div className="split-cards">
              <div className="bento-card bento-mint">
                <span className="editorial-index">01.</span>
                <h3>Player Respect</h3>
                <p>
                  Clear navigation, readable screens, and transparent data
                  practices across every game we release.
                </p>
              </div>
              <div className="bento-card bento-warm">
                <span className="editorial-index">02.</span>
                <h3>Global Distribution</h3>
                <p>
                  Built and verified for Android phones and Amazon Fire tablets
                  worldwide.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <Link to="/contact" className="btn btn-primary">
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
