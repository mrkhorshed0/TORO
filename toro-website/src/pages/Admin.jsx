import { useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, firebaseProjectId } from '../lib/firebase'
import AdminPoliciesTab from './admin/AdminPoliciesTab'
import AdminContentTab from './admin/AdminContentTab'
import AdminInboxTab from './admin/AdminInboxTab'

const BOOTSTRAPPED_ADMIN_EMAILS = [
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
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeTab, setActiveTab] = useState('policies')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Login form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
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
      setIsAuthorized(false)
      return
    }

    const emailNormalized = (firebaseUser.email || '').toLowerCase()
    const isBootstrappedEmail =
      firebaseUser.emailVerified &&
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

    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setLoginError('Please enter both your admin email and password.')
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
        setLoginError('Incorrect email or password. Please check your credentials.')
      } else if (code === 'auth/operation-not-allowed') {
        setLoginError(
          'Email/Password sign-in is not enabled yet in Firebase Console. Open the setup instructions below.'
        )
      } else if (code === 'auth/too-many-requests') {
        setLoginError('Too many failed attempts. Please wait a moment and try again.')
      } else {
        setLoginError(err?.message || 'Unable to sign in.')
      }
    } finally {
      setSigningIn(false)
    }
  }

  const handleSendVerification = async () => {
    if (!user) return
    setVerificationSent('')
    try {
      await sendEmailVerification(user)
      setVerificationSent(
        `Verification link sent to ${user.email}. Click the link in your inbox, then press Refresh Status.`
      )
    } catch (err) {
      setVerificationSent(err?.message || 'Could not send verification email right now.')
    }
  }

  const handleRefreshUser = async () => {
    if (!auth.currentUser) return
    await auth.currentUser.reload()
    setUser({ ...auth.currentUser })
    await evaluateAuthorization(auth.currentUser)
  }

  const handleSignOut = async () => {
    await signOut(auth)
    setIsAuthorized(false)
  }

  if (authLoading) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Toro Studio Console</p>
          <h1>Loading workspace...</h1>
          <div className="skeleton-line skeleton-lg" />
          <div className="skeleton-line skeleton-md" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Toro · Private Access</p>
          <h1>Studio Admin Sign In</h1>
          <p className="admin-auth-sub">
            Sign in with your studio email and password to manage game privacy
            policies, site copy, and player messages.
          </p>

          <form className="form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="admin-email">Admin Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="supportgemcartbd@gmail.com"
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
              {signingIn ? 'Signing In...' : 'Sign In to Admin Panel'}
            </button>

            {loginError && (
              <p className="form-error" role="alert">
                {loginError}
              </p>
            )}
          </form>

          <details className="admin-setup-guide">
            <summary>First-time Firebase Email/Password Setup Guide</summary>
            <ol>
              <li>
                Open Firebase Console for project{' '}
                <code>{firebaseProjectId}</code>.
              </li>
              <li>
                Go to <strong>Authentication → Sign-in method</strong> and enable{' '}
                <strong>Email/Password</strong>.
              </li>
              <li>
                Under <strong>Authentication → Users</strong>, add your admin
                email (e.g. <code>supportgemcartbd@gmail.com</code> or{' '}
                <code>toro@gmail.com</code>) and set your password.
              </li>
              <li>
                Sign in above. On first login, verify your email (or add your UID
                to Firestore collection <code>admins</code>).
              </li>
            </ol>
          </details>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <p className="kicker-text">Verification Required</p>
          <h1>Confirm Admin Identity</h1>
          <p className="admin-auth-sub">
            Signed in as <strong>{user.email}</strong> (UID:{' '}
            <code>{user.uid}</code>).
          </p>

          {!user.emailVerified && (
            <p className="admin-auth-sub">
              Your email address is not verified yet. Verify your email or add a
              document at Firestore path <code>admins/{user.uid}</code> with{' '}
              <code>{'{ email, role: "admin" }'}</code>.
            </p>
          )}

          {verificationSent && (
            <p className="form-feedback" role="status">
              {verificationSent}
            </p>
          )}

          <div className="admin-verify-actions">
            {!user.emailVerified && (
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
            >
              Refresh Status
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
            <a href="/" className="text-link" style={{ minHeight: '32px' }}>
              View Public Site
            </a>
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
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              Open Live Site
            </a>
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
