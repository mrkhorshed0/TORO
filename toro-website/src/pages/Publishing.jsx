import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

function Publishing() {
  const { content } = useSiteContent()
  const publishing = content.publishing
  const paragraphs = publishing.bodyParagraphs || []
  const intro = paragraphs[0]
  const principles = paragraphs.slice(1)

  return (
    <>
      <section className="page-hero">
        <div className="container container-narrow">
          <p className="kicker-text">{publishing.kicker}</p>
          <h1 className="page-title">{publishing.title}</h1>
          <p className="page-lead">{publishing.lead}</p>
        </div>
      </section>

      <section className="prose-section">
        <div className="container container-narrow">
          <div className="prose-block">
            <h2>Where We Publish</h2>
            {intro && <p>{intro}</p>}

            {principles.length > 0 && (
              <>
                <h2>Our Development Principles</h2>
                <ul>
                  {principles.map((item, idx) => {
                    const colonIndex = item.indexOf(':')
                    if (colonIndex > 0 && colonIndex < 45) {
                      const label = item.slice(0, colonIndex)
                      const rest = item.slice(colonIndex + 1)
                      return (
                        <li key={idx}>
                          <strong>{label}:</strong>
                          {rest}
                        </li>
                      )
                    }
                    return <li key={idx}>{item}</li>
                  })}
                </ul>
              </>
            )}

            <h2>Direct Store Support</h2>
            <p>
              If you are reaching out regarding a game published under our
              developer account—for player support, feedback, or store
              verification—our team responds directly via email.
            </p>

            <div style={{ marginTop: '28px' }}>
              <Link to="/contact" className="btn btn-primary">
                Contact Studio Support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Publishing
