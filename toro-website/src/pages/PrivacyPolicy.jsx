import { useSiteContent } from '../context/SiteContentContext'

function renderPolicyParagraph(text, index) {
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

function PrivacyPolicy() {
  const { content } = useSiteContent()
  const policy = content.privacyPolicy
  const studioEmail = content.contact?.email || 'toro@gmail.com'
  const studioLocation = content.contact?.location || 'Rangpur, Bangladesh'

  return (
    <>
      <section className="page-hero">
        <div className="container container-narrow">
          <p className="kicker-text">{policy.kicker}</p>
          <h1 className="page-title">{policy.title}</h1>
          <p className="page-lead">
            Last updated: {policy.lastUpdated || 'November 2026'} ·{' '}
            {policy.lead}
          </p>
        </div>
      </section>

      <section className="prose-section">
        <div className="container container-narrow">
          <div className="prose-block">
            {(policy.bodyParagraphs || []).map((text, index) =>
              renderPolicyParagraph(text, index)
            )}

            <p style={{ marginTop: '14px' }}>
              Google Partner Data Policy:{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                policies.google.com/technologies/partner-sites
              </a>
            </p>

            <h2>Contact Us</h2>
            <p>Email: {studioEmail}</p>
            <p>Location: {studioLocation}</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default PrivacyPolicy
