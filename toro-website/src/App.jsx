import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import { SiteContentProvider } from './context/SiteContentContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Publishing from './pages/Publishing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import Contact from './pages/Contact'
import GamePolicy from './pages/GamePolicy'
import Admin from './pages/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function StudioLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="main">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <SiteContentProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Indie Game Studio Pages */}
          <Route
            path="/"
            element={
              <StudioLayout>
                <Home />
              </StudioLayout>
            }
          />
          <Route
            path="/about"
            element={
              <StudioLayout>
                <About />
              </StudioLayout>
            }
          />
          <Route
            path="/publishing"
            element={
              <StudioLayout>
                <Publishing />
              </StudioLayout>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <StudioLayout>
                <PrivacyPolicy />
              </StudioLayout>
            }
          />
          <Route
            path="/terms"
            element={
              <StudioLayout>
                <Terms />
              </StudioLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <StudioLayout>
                <Contact />
              </StudioLayout>
            }
          />

          {/* Unlisted Per-Game Privacy Policy Routes (Direct link only, noindex) */}
          <Route path="/p/:slug" element={<GamePolicy />} />
          <Route path="/policy/:slug" element={<GamePolicy />} />

          {/* Unlisted Studio Admin Console */}
          <Route path="/khorshed/admin" element={<Admin />} />
        </Routes>
      </SiteContentProvider>
    </ErrorBoundary>
  )
}

export default App
