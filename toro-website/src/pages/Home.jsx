import { Link } from 'react-router-dom'
import heroStudioImg from '../assets/images/hero_indie_studio_1794964322593.jpg'
import studioCraftImg from '../assets/images/studio_craft_tiles_1794964321539.jpg'
import { useSiteContent } from '../context/SiteContentContext'

function Home() {
  const { content } = useSiteContent()
  const home = content.home

  const para1 =
    home.bodyParagraphs?.[0] ||
    'We design games around clean rules and tactile touch controls. Whether a session lasts two minutes or twenty, players get an uncluttered interface that runs smoothly across phones and tablets.'
  const para2 =
    home.bodyParagraphs?.[1] ||
    'Our releases are maintained for both Google Play Store and Amazon Appstore, ensuring compatibility across Android phones and Fire tablets with regular stability updates.'
  const para3 =
    home.bodyParagraphs?.[2] ||
    'From pick-up-and-play arcade loops to quiet logic puzzles, we build accessible experiences designed for broad audiences without unnecessary complexity.'

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="kicker-text">{home.kicker}</p>
              <h1 className="hero-title">{home.title}</h1>
              <p className="hero-lead">{home.lead}</p>

              <div className="hero-actions">
                <Link to="/contact" className="btn btn-primary">
                  {home.ctaLabel || 'Contact the Studio'}
                </Link>
                <Link to="/about" className="text-link">
                  About Toro
                </Link>
              </div>

              <div className="hero-meta-row">
                <span>Google Play Store</span>
                <span className="meta-sep" aria-hidden="true">
                  ·
                </span>
                <span>Amazon Appstore</span>
                <span className="meta-sep" aria-hidden="true">
                  ·
                </span>
                <span>Indie Studio</span>
              </div>
            </div>

            <div className="hero-media">
              <img
                src={heroStudioImg}
                alt="Bright sunlit indie game studio desk with tablet wireframes and design sketches"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Studio overview">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <span className="trust-label">Location</span>
              <span className="trust-value">
                {home.location || 'Rangpur, Bangladesh'}
              </span>
            </div>
            <div className="trust-item">
              <span className="trust-label">Publishing Platforms</span>
              <span className="trust-value">
                {home.platforms || 'Google Play & Amazon Appstore'}
              </span>
            </div>
            <div className="trust-item">
              <span className="trust-label">Studio Focus</span>
              <span className="trust-value">Original Mobile Games</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How Toro builds games</h2>
            <p className="section-subtitle">
              Every release is crafted by an independent team focused on clear
              mechanics, fast loading times, and dependable store support.
            </p>
          </div>

          <div className="bento-grid">
            <article className="bento-card bento-span-7 bento-mint">
              <div>
                <span className="editorial-index">01.</span>
                <h3>Focused Gameplay &amp; Responsive Controls</h3>
                <p>{para1}</p>
              </div>
              <div className="inline-meta-list">
                <span>60fps Target</span>
                <span className="meta-sep" aria-hidden="true">
                  ·
                </span>
                <span>Compact Download Size</span>
                <span className="meta-sep" aria-hidden="true">
                  ·
                </span>
                <span>Tablet &amp; Phone Ready</span>
              </div>
            </article>

            <article className="bento-card bento-span-5 bento-warm">
              <div>
                <span className="editorial-index">02.</span>
                <h3>Multi-Store Publishing</h3>
                <p>{para2}</p>
              </div>
              <div className="inline-meta-list">
                <span>Android</span>
                <span className="meta-sep" aria-hidden="true">
                  ·
                </span>
                <span>Amazon FireOS</span>
              </div>
            </article>

            <article className="bento-card bento-span-12 bento-media-card">
              <div className="bento-media-body">
                <span className="editorial-index">03.</span>
                <h3>Genres We Craft</h3>
                <p>{para3}</p>
                <div className="inline-meta-list">
                  <span>Puzzle</span>
                  <span className="meta-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>Casual</span>
                  <span className="meta-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>Arcade</span>
                  <span className="meta-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>Logic &amp; Strategy</span>
                </div>
              </div>
              <div className="bento-media-visual">
                <img
                  src={studioCraftImg}
                  alt="Minimalist ceramic geometric game blocks and joystick tokens in bright daylight"
                  referrerPolicy="no-referrer"
                />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <div className="cta-band">
            <div className="cta-band-copy">
              <h2>Have player feedback or a publishing inquiry?</h2>
              <p>
                Reach out directly to our studio in{' '}
                {home.location || 'Rangpur, Bangladesh'} for player support,
                partnership inquiries, or store verification questions.
              </p>
            </div>
            <Link to="/contact" className="btn btn-primary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
