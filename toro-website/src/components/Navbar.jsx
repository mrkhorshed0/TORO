import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/computer-division', label: 'Computer Division' },
    { to: '/apps-games', label: 'Apps & Games' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          Toro
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
