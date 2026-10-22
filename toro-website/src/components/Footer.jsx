import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <h3>Toro</h3>
          <p>Bangladesh-based apps &amp; games</p>
        </div>

        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-contact">
          <p>toro@gmail.com</p>
          <p>Rangpur, Bangladesh</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>© 2025 Toro. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
