import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '../lib/firebase'
import { gamePolicies } from '../data/gamePolicies'

const VALID_SLUG_REGEX = /^[a-z0-9-]+$/

function GamePolicy() {
  const { slug } = useParams()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadPolicy() {
      if (!slug || !VALID_SLUG_REGEX.test(slug) || slug.length < 2 || slug.length > 64) {
        if (active) {
          setPolicy(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const path = `gamePolicies/${slug}`
      try {
        const snap = await getDoc(doc(db, 'gamePolicies', slug))
        if (!active) return
        if (snap.exists()) {
          setPolicy(snap.data())
        } else if (gamePolicies[slug]) {
          setPolicy(gamePolicies[slug])
        } else {
          setPolicy(null)
        }
      } catch (err) {
        if (gamePolicies[slug]) {
          if (active) setPolicy(gamePolicies[slug])
        } else {
          try {
            handleFirestoreError(err, OperationType.GET, path)
          } catch {
            if (active) setPolicy(null)
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPolicy()
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    const previousTitle = document.title
    document.title = policy
      ? `${policy.gameTitle} — Privacy Policy | Toro`
      : 'Privacy Policy | Toro'

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
  }, [policy])

  if (loading) {
    return (
      <div className="policy-shell">
        <header className="policy-topbar">
          <div className="container container-narrow policy-topbar-inner">
            <span className="policy-brand">Toro</span>
            <span className="policy-doc-label">Game Privacy Policy</span>
          </div>
        </header>
        <main className="policy-main">
          <div className="container container-narrow">
            <div className="prose-block">
              <div className="skeleton-line skeleton-sm" />
              <div className="skeleton-line skeleton-lg" />
              <div className="skeleton-line skeleton-md" />
              <div className="skeleton-line skeleton-md" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="policy-shell">
        <header className="policy-topbar">
          <div className="container container-narrow policy-topbar-inner">
            <span className="policy-brand">Toro</span>
            <span className="policy-doc-label">Game Privacy Policy</span>
          </div>
        </header>

        <main className="policy-main">
          <div className="container container-narrow">
            <div className="prose-block">
              <h1 className="page-title" style={{ fontSize: '1.75rem' }}>
                Policy document unavailable
              </h1>
              <p>
                Please open the Privacy Policy link directly from inside the
                game or its official store listing.
              </p>
              <p>
                For assistance, contact{' '}
                <a href="mailto:toro@gmail.com">toro@gmail.com</a>.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="policy-shell">
      <header className="policy-topbar">
        <div className="container container-narrow policy-topbar-inner">
          <span className="policy-brand">Toro</span>
          <span className="policy-doc-label">
            Game Privacy Policy · {policy.platforms}
          </span>
        </div>
      </header>

      <main className="policy-main">
        <div className="container container-narrow">
          <div className="prose-block">
            <p className="kicker-text">Last updated: {policy.lastUpdated}</p>
            <h1 className="page-title" style={{ marginBottom: '16px' }}>
              Privacy Policy for {policy.gameTitle}
            </h1>
            <p>{policy.summary}</p>

            <h2>1. Information Processed</h2>
            <ul>
              {(policy.dataCollected || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <h2>2. How Data Is Used</h2>
            <p>
              Technical and gameplay diagnostic information is used only to keep{' '}
              <strong>{policy.gameTitle}</strong> stable, save local player
              preferences, prevent abuse, and serve advertisements where
              applicable.
            </p>

            <h2>3. Third-Party Services &amp; Advertising</h2>
            {policy.usesAdMob && (
              <p>
                This game uses Google AdMob (Google Mobile Ads SDK) to display
                advertisements. Google and its partners may use your device
                advertising ID and network information to provide and measure
                ads. Review Google&apos;s partner policy at{' '}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  policies.google.com/technologies/partner-sites
                </a>
                .
              </p>
            )}
            {policy.usesUnityAds && (
              <p>
                This game may display ads served by Unity Ads, which processes
                device identifiers and ad interaction metrics in accordance with
                Unity&apos;s Privacy Policy.
              </p>
            )}
            {policy.usesAnalytics && (
              <p>
                Anonymous crash reports and performance metrics may be collected
                by platform services (such as Google Play Services or Amazon
                Appstore) to improve stability across devices.
              </p>
            )}
            <p>
              You can limit or reset your advertising ID anytime inside your
              Android or FireOS device privacy settings.
            </p>

            <h2>4. Children&apos;s Privacy</h2>
            {policy.directedAtChildrenUnder13 ? (
              <p>
                This game follows applicable children&apos;s privacy safeguards
                and restricts personalized advertising in compliance with COPPA
                and store family policies.
              </p>
            ) : (
              <p>
                <strong>{policy.gameTitle}</strong> is not directed to children
                under the age of 13. We do not knowingly collect personal
                information from children. If you believe a child has submitted
                personal data, please email us for immediate removal.
              </p>
            )}

            <h2>5. Data Sharing &amp; Retention</h2>
            <p>
              Toro does not sell your personal information. Local save data
              stays on your device and is cleared when you uninstall the game.
              Diagnostic and ad data handled by third-party SDKs follow their
              respective retention policies.
            </p>

            <h2>6. Contact the Developer</h2>
            <p>
              Developer: Toro
              <br />
              Email:{' '}
              <a href={`mailto:${policy.contactEmail}`}>
                {policy.contactEmail}
              </a>
              <br />
              Location: {policy.studioLocation}
            </p>
          </div>
        </div>
      </main>

      <footer className="policy-footer">
        <div className="container container-narrow">
          <span>
            © {new Date().getFullYear()} Toro · {policy.gameTitle} Privacy
            Notice
          </span>
        </div>
      </footer>
    </div>
  )
}

export default GamePolicy
