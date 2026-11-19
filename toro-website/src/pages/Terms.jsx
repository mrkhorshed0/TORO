import { useSiteContent } from '../context/SiteContentContext'

function renderTermParagraph(text, index) {
  const match = text.match(/^(\d+\.\s+[^:]+):\s*(.*)$/)
  if (match) {
    return (
      <div key={index}>
        <h2>{match[1]}</h2>
        <p>{match[2]}</p>
      </div>
    )
  }
  return <p key={index}>{text}</p>
}

function Terms() {
  const { content } = useSiteContent()
  const terms = content.terms
  const studioEmail = content.contact?.email || 'toro@gmail.com'
  const studioLocation = content.contact?.location || 'Rangpur, Bangladesh'

  return (
    <>
      <section className="page-hero">
        <div className="container container-narrow">
          <p className="kicker-text">{terms.kicker}</p>
          <h1 className="page-title">{terms.title}</h1>
          <p className="page-lead">
            Last updated: {terms.lastUpdated || 'November 2026'} · {terms.lead}
          </p>
        </div>
      </section>

      <section className="prose-section">
        <div className="container container-narrow">
          <div className="prose-block">
            {(terms.bodyParagraphs || []).map((text, index) =>
              renderTermParagraph(text, index)
            )}

            <h2>Contact</h2>
            <p>Email: {studioEmail}</p>
            <p>Location: {studioLocation}</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Terms
