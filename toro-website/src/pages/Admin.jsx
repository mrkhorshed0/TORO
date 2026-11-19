import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import AdminPoliciesTab from './admin/AdminPoliciesTab'
import AdminContentTab from './admin/AdminContentTab'
import AdminInboxTab from './admin/AdminInboxTab'

const BOOTSTRAPPED_ADMIN_EMAILS = [
  'mdkhorshedalom573@gmail.com',
  'supportgemcartbd@gmail.com',
  'toro@gmail.com',
]

const ADMIN_TABS = [
  { id: 'policies', label: 'Game Policies' },
  { id: 'content', label: 'Site Content' },
  { id: 'legal', label: 'Legal Pages' },
  { id: 'inbox', label: 'Contact Inbox' },
]

function Admin() {
  const [authLoading, setAuthLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [emailVerified, setEmailVerified] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState('policies')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [verificationSent, setVerificationSent] = useState('')

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Toro Studio Console'

    let robotsMeta = document.querySelector('meta[name="robots"]')
    const createdMeta = !robotsMeta
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta')
      robotsMeta.setAttribute('name', 'robots')
      document.head.appendChild(robotsMeta)
    }
    const previousContent = robotsMeta.getAttribute('content')
    robotsMeta.setAttribute('content', 'noindex, nofollow')

    return () => {
      document.title = previousTitle
      if (createdMeta && robotsMeta.parentNode) {
        robotsMeta.parentNode.removeChild(robotsMeta)
      } else if (previousContent !== null) {
        robotsMeta.setAttribute('content', previousContent)
      } else {
        robotsMeta.removeAttribute('content')
      }
    }
  }, [])

  const evaluateAuthorization = async (firebaseUser) => {
    if (!firebaseUser) {
      setEmailVerified(false)
      setIsAuthorized(false)
      return
    }

    setEmailVerified(Boolean(firebaseUser.emailVerified))
    const emailNormalized = (firebaseUser.email || '').toLowerCase()
    const isBootstrappedEmail =
      Boolean(firebaseUser.emailVerified) &&
      BOOTSTRAPPED_ADMIN_EMAILS.includes(emailNormalized)

    if (isBootstrappedEmail) {
      setIsAuthorized(true)
      return
    }

    try {
      const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid))
      setIsAuthorized(adminSnap.exists())
    } catch {
      setIsAuthorized(false)
    }
  }

  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setAuthLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      await evaluateAuthorization(firebaseUser)
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')

    if (!auth) {
      setLoginError('Firebase configuration is not set for this environment.')
      return
    }

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setLoginError('Please enter both your email address and password.')
      return
    }

    setSigningIn(true)
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password)
      setPassword('')
    } catch (err) {
      const code = err?.code || ''
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setLoginError('Incorrect email or password. Please try again.')
      } else if (code === 'auth/too-many-requests') {
        setLoginError('Too many failed attempts. Please wait a moment and try again.')
      } else {
        setLoginError('Unable to sign in right now. Please check your credentials.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const handleSendVerification = async () => {
    if (!auth?.currentUser) return
    setVerificationSent('')
    try {
      await sendEmailVerification(auth.currentUser)
      setVerificationSent(
        `A verification link has been sent to ${auth.currentUser.email}. Open the link in your inbox, then tap Refresh Status.`
      )
    } catch {
      setVerificationSent('Could not send verification email right now. Please wait a moment and try again.')
    }
  }

  const handleRefreshUser = async () => {
    if (!auth?.currentUser) return
    setCheckingStatus(true)
    setVerificationSent('')
    try {
      await auth.currentUser.reload()
      await auth.currentUser.getIdToken(true)
      setUser(auth.currentUser)
      await evaluateAuthorization(auth.currentUser)
      if (!auth.currentUser.emailVerified) {
        setVerificationSent('Email is still unverified. Please click the verification link in your email first.')
      }
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth)
    }
    setEmailVerified(false)
    setIsAuthorized(false)
    setVerificationSent('')
  }

  if (authLoading) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Toro Studio</p>
          <h1>Loading Console</h1>
          <div className="skeleton-line skeleton-lg" />
          <div className="skeleton-line skeleton-md" />
        </div>
      </div>
    )
  }

  if (!isFirebaseConfigured || !auth || !db) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Environment Setup Required</p>
          <h1>Console Unavailable</h1>
          <p className="admin-auth-sub">
            Firebase environment variables are not configured on this deployment.
            Add your <code>VITE_FIREBASE_*</code> variables in Vercel Project
            Settings and redeploy to enable the studio console.
          </p>
          <div className="admin-auth-footer">
            <Link to="/" className="text-link">
              Return to Toro Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Toro Studio</p>
          <h1>Admin Sign In</h1>
          <p className="admin-auth-sub">
            Sign in with your studio email and password to manage game privacy
            policies, site copy, and messages.
          </p>

          <form className="form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={signingIn}
              style={{ width: '100%' }}
            >
              {signingIn ? 'Signing In...' : 'Sign In'}
            </button>

            {loginError && (
              <p className="form-error" role="alert">
                {loginError}
              </p>
            )}
          </form>

          <div className="admin-auth-footer">
            <Link to="/" className="text-link">
              Return to Toro Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">
            {emailVerified ? 'Access Restricted' : 'Email Verification'}
          </p>
          <h1>
            {emailVerified
              ? 'Account Not Authorized'
              : 'Verify Your Email'}
          </h1>
          <p className="admin-auth-sub">
            Signed in as <strong className="break-word">{user.email}</strong>.{' '}
            {emailVerified
              ? 'This email address does not have administrator permission for the Toro console.'
              : 'Please verify your email address before entering the studio console.'}
          </p>

          {verificationSent && (
            <p className="form-feedback" role="status">
              {verificationSent}
            </p>
          )}

          <div className="admin-verify-actions">
            {!emailVerified && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendVerification}
              >
                Send Verification Email
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRefreshUser}
              disabled={checkingStatus}
            >
              {checkingStatus ? 'Checking...' : 'Refresh Status'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  const activeLabel =
    ADMIN_TABS.find((t) => t.id === activeTab)?.label || 'Console'

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Close admin sidebar"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="brand-wordmark">Toro</span>
          <span className="admin-role-text">Studio Console</span>
        </div>

        <nav className="admin-sidebar-nav" aria-label="Admin sections">
          {ADMIN_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id)
                setMobileMenuOpen(false)
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-email" title={user.email || ''}>
            {user.email}
          </div>
          <div className="admin-sidebar-links">
            <Link to="/" className="text-link" style={{ minHeight: '32px' }}>
              Public Site
            </Link>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="nav-toggle admin-mobile-toggle"
              aria-label="Toggle admin sidebar"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="admin-breadcrumb">
              <span>Admin</span>
              <span className="meta-sep" aria-hidden="true">
                /
              </span>
              <strong>{activeLabel}</strong>
            </div>
          </div>

          <div className="admin-topbar-right">
            <Link to="/" className="btn btn-secondary btn-sm">
              View Live Site
            </Link>
          </div>
        </header>

        <main className="admin-main">
          {activeTab === 'policies' && <AdminPoliciesTab />}
          {activeTab === 'content' && <AdminContentTab mode="site" />}
          {activeTab === 'legal' && <AdminContentTab mode="legal" />}
          {activeTab === 'inbox' && <AdminInboxTab />}
        </main>
      </div>
    </div>
  )
}

export default Admin
