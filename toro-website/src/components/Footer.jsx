import { Link } from 'react-router-dom'
import { useSiteContent } from '../context/SiteContentContext'

function Footer() {
  const { content } = useSiteContent()
  const studioEmail = content.contact?.email || 'toro@gmail.com'
  const studioLocation = content.contact?.location || 'Rangpur, Bangladesh'

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Toro</div>
            <p className="footer-desc">
              Independent game studio in {studioLocation} developing mobile
              games for Google Play Store and Amazon Appstore.
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Studio</h2>
            <nav className="footer-nav" aria-label="Studio links">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/publishing">Publishing</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          <div>
            <h2 className="footer-heading">Legal &amp; Contact</h2>
            <nav className="footer-nav" aria-label="Legal and contact links">
              <Link to="/privacy-policy">Studio Privacy Policy</Link>
              <Link to="/terms">Terms &amp; Conditions</Link>
              <a href={`mailto:${studioEmail}`}>{studioEmail}</a>
            </nav>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Toro. All rights reserved.</span>
          <span>{studioLocation}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
