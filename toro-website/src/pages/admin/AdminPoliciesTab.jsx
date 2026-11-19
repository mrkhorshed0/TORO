import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '../../lib/firebase'
import { gamePolicies as starterPolicies } from '../../data/gamePolicies'
import { copyTextToClipboard } from '../../utils/clipboard'
import { isValidEmail, sanitizeSlug } from '../../utils/validators'

const EMPTY_FORM = {
  slug: '',
  gameTitle: '',
  platforms: 'Google Play Store · Amazon Appstore',
  lastUpdated: 'November 2026',
  summary:
    'This Privacy Policy applies exclusively to this game published by Toro. We collect only the technical and advertising identifiers required to run gameplay smoothly, prevent fraud, and support free access through third-party ad networks.',
  dataCollectedText:
    'Device model, operating system version, and screen resolution\nAdvertising ID (Google AAID / Amazon Advertising ID) for ad delivery and frequency capping\nApproximate region derived from IP address and anonymized crash or performance diagnostics\nLocal game progress and settings saved on your device',
  usesAdMob: true,
  usesUnityAds: false,
  usesAnalytics: true,
  directedAtChildrenUnder13: false,
  contactEmail: 'toro@gmail.com',
  studioLocation: 'Rangpur, Bangladesh',
}

function AdminPoliciesTab() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingSlug, setEditingSlug] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copiedSlug, setCopiedSlug] = useState('')
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState('')

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return undefined
    }

    const path = 'gamePolicies'
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const rows = []
        snapshot.forEach((docSnap) => {
          rows.push({ id: docSnap.id, ...docSnap.data() })
        })
        rows.sort((a, b) => (a.gameTitle || '').localeCompare(b.gameTitle || ''))
        setPolicies(rows)
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        try {
          handleFirestoreError(err, OperationType.LIST, path)
        } catch {
          setError('Could not load policies. Please check your permissions or connection.')
        }
      }
    )

    return () => unsubscribe()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return policies
    return policies.filter(
      (item) =>
        (item.gameTitle || '').toLowerCase().includes(q) ||
        (item.slug || '').toLowerCase().includes(q)
    )
  }, [policies, search])

  const openCreate = () => {
    setEditingSlug(null)
    setForm(EMPTY_FORM)
    setError('')
    setNotice('')
    setShowEditor(true)
  }

  const openEdit = (item) => {
    setEditingSlug(item.slug)
    setForm({
      slug: item.slug,
      gameTitle: item.gameTitle || '',
      platforms: item.platforms || 'Google Play Store · Amazon Appstore',
      lastUpdated: item.lastUpdated || 'November 2026',
      summary: item.summary || '',
      dataCollectedText: (item.dataCollected || []).join('\n'),
      usesAdMob: Boolean(item.usesAdMob),
      usesUnityAds: Boolean(item.usesUnityAds),
      usesAnalytics: Boolean(item.usesAnalytics),
      directedAtChildrenUnder13: Boolean(item.directedAtChildrenUnder13),
      contactEmail: item.contactEmail || 'toro@gmail.com',
      studioLocation: item.studioLocation || 'Rangpur, Bangladesh',
    })
    setError('')
    setNotice('')
    setShowEditor(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    const cleanSlug = sanitizeSlug(editingSlug || form.slug)
    if (cleanSlug.length < 2) {
      setError('Slug must be at least 2 characters using lowercase letters, numbers, or hyphens.')
      return
    }

    const gameTitle = form.gameTitle.trim().slice(0, 120)
    const platforms = form.platforms.trim().slice(0, 120)
    const summary = form.summary.trim().slice(0, 2000)
    const lastUpdated = form.lastUpdated.trim().slice(0, 60)
    const contactEmail = form.contactEmail.trim().slice(0, 120)
    const studioLocation = form.studioLocation.trim().slice(0, 120)
    const dataCollected = form.dataCollectedText
      .split('\n')
      .map((line) => line.trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 20)

    if (!gameTitle || !platforms || !summary || dataCollected.length === 0 || !contactEmail) {
      setError('Please complete Game Title, Platforms, Summary, Contact Email, and at least one Data Collected item.')
      return
    }

    if (!isValidEmail(contactEmail)) {
      setError('Please enter a valid developer contact email address.')
      return
    }

    if (!db) {
      setError('Database is not connected.')
      return
    }

    setSaving(true)
    const path = `gamePolicies/${cleanSlug}`
    try {
      await setDoc(doc(db, 'gamePolicies', cleanSlug), {
        slug: cleanSlug,
        gameTitle,
        platforms,
        summary,
        dataCollected,
        usesAdMob: Boolean(form.usesAdMob),
        usesUnityAds: Boolean(form.usesUnityAds),
        usesAnalytics: Boolean(form.usesAnalytics),
        directedAtChildrenUnder13: Boolean(form.directedAtChildrenUnder13),
        contactEmail,
        studioLocation: studioLocation || 'Rangpur, Bangladesh',
        lastUpdated: lastUpdated || 'November 2026',
        updatedAt: serverTimestamp(),
      })

      setNotice(`Saved unlisted policy at /p/${cleanSlug}`)
      setShowEditor(false)
      setEditingSlug(null)
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, path)
      } catch {
        setError('Unable to save policy. Please verify your admin permissions and try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!db) return
    const path = `gamePolicies/${slug}`
    try {
      await deleteDoc(doc(db, 'gamePolicies', slug))
      setConfirmDeleteSlug('')
      setNotice(`Removed policy /p/${slug}`)
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path)
      } catch {
        setError('Unable to delete policy right now.')
      }
    }
  }

  const handleImportStarter = async () => {
    const starter = starterPolicies['toro-game-1']
    if (!starter || !db) return
    setSaving(true)
    setError('')
    const path = 'gamePolicies/toro-game-1'
    try {
      await setDoc(doc(db, 'gamePolicies', 'toro-game-1'), {
        slug: 'toro-game-1',
        gameTitle: starter.gameTitle,
        platforms: starter.platforms,
        summary: starter.summary,
        dataCollected: starter.dataCollected,
        usesAdMob: starter.usesAdMob,
        usesUnityAds: starter.usesUnityAds,
        usesAnalytics: starter.usesAnalytics,
        directedAtChildrenUnder13: starter.directedAtChildrenUnder13,
        contactEmail: starter.contactEmail,
        studioLocation: starter.studioLocation,
        lastUpdated: starter.lastUpdated,
        updatedAt: serverTimestamp(),
      })
      setNotice('Imported starter policy /p/toro-game-1 into Firestore.')
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, path)
      } catch {
        setError('Unable to import starter policy right now.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCopyUrl = async (slug) => {
    const url = `${window.location.origin}/p/${slug}`
    const ok = await copyTextToClipboard(url)
    if (ok) {
      setCopiedSlug(slug)
      setTimeout(() => setCopiedSlug(''), 2500)
    } else {
      setCopiedSlug('')
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-section-title">Unlisted Game Privacy Policies</h2>
          <p className="admin-section-sub">
            Policies are accessible only via direct link (<code>/p/&lt;slug&gt;</code>) and remain hidden from public navigation and search engines.
          </p>
        </div>
        <div className="admin-toolbar-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
            New Game Policy
          </button>
        </div>
      </div>

      {notice && (
        <div className="form-feedback" role="status">
          {notice}
        </div>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {showEditor && (
        <div className="admin-panel-card">
          <div className="admin-panel-head">
            <h3>{editingSlug ? `Edit Policy: /p/${editingSlug}` : 'Create Unlisted Game Policy'}</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowEditor(false)}
            >
              Cancel
            </button>
          </div>

          <form className="form" onSubmit={handleSave}>
            <div className="admin-form-grid">
              <div className="form-group">
                <label htmlFor="policy-title">Game Title</label>
                <input
                  id="policy-title"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Sky Hopper"
                  value={form.gameTitle}
                  onChange={(e) => {
                    const nextTitle = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      gameTitle: nextTitle,
                      slug:
                        editingSlug || prev.slug
                          ? prev.slug
                          : sanitizeSlug(nextTitle),
                    }))
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="policy-slug">Direct URL Slug (/p/slug)</label>
                <input
                  id="policy-slug"
                  type="text"
                  maxLength={64}
                  disabled={Boolean(editingSlug)}
                  placeholder="e.g. sky-hopper-7a2"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="policy-platforms">Store Platforms</label>
                <input
                  id="policy-platforms"
                  type="text"
                  maxLength={120}
                  value={form.platforms}
                  onChange={(e) => setForm({ ...form, platforms: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="policy-updated">Effective Date Label</label>
                <input
                  id="policy-updated"
                  type="text"
                  maxLength={60}
                  value={form.lastUpdated}
                  onChange={(e) => setForm({ ...form, lastUpdated: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="policy-email">Developer Contact Email</label>
                <input
                  id="policy-email"
                  type="email"
                  maxLength={120}
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="policy-location">Studio Location</label>
                <input
                  id="policy-location"
                  type="text"
                  maxLength={120}
                  value={form.studioLocation}
                  onChange={(e) => setForm({ ...form, studioLocation: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="policy-summary">Opening Summary</label>
              <textarea
                id="policy-summary"
                rows="3"
                maxLength={2000}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="policy-data">Data Categories Collected (one per line)</label>
              <textarea
                id="policy-data"
                rows="4"
                value={form.dataCollectedText}
                onChange={(e) => setForm({ ...form, dataCollectedText: e.target.value })}
                required
              />
            </div>

            <div className="admin-checkbox-grid">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.usesAdMob}
                  onChange={(e) => setForm({ ...form, usesAdMob: e.target.checked })}
                />
                <span>Uses Google AdMob</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.usesUnityAds}
                  onChange={(e) => setForm({ ...form, usesUnityAds: e.target.checked })}
                />
                <span>Uses Unity Ads</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.usesAnalytics}
                  onChange={(e) => setForm({ ...form, usesAnalytics: e.target.checked })}
                />
                <span>Platform Crash &amp; Performance Analytics</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={form.directedAtChildrenUnder13}
                  onChange={(e) =>
                    setForm({ ...form, directedAtChildrenUnder13: e.target.checked })
                  }
                />
                <span>Directed at Children Under 13 (COPPA)</span>
              </label>
            </div>

            <div className="admin-form-footer">
              <span className="admin-url-preview">
                Direct URL: <code>/p/{sanitizeSlug(editingSlug || form.slug) || 'your-slug'}</code>
              </span>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Game Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-filter-bar">
        <input
          type="search"
          className="admin-search"
          placeholder="Filter policies by game title or slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="admin-count tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'policy' : 'policies'}
        </span>
      </div>

      {loading ? (
        <div className="admin-panel-card">
          <div className="skeleton-line skeleton-md" />
          <div className="skeleton-line skeleton-lg" />
          <div className="skeleton-line skeleton-md" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No game privacy policies saved yet</h3>
          <p>
            Create your first unlisted game privacy policy to generate a direct
            link for Google Play Console, Amazon Appstore, and in-game settings.
          </p>
          <div className="admin-empty-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              Create First Game Policy
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleImportStarter}
              disabled={saving}
            >
              Import Starter Policy (/p/toro-game-1)
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Game Title</th>
                <th>Direct Path</th>
                <th>SDK Disclosures</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const sdks = [
                  item.usesAdMob ? 'AdMob' : null,
                  item.usesUnityAds ? 'Unity Ads' : null,
                  item.usesAnalytics ? 'Analytics' : null,
                ]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <tr key={item.slug}>
                    <td className="font-semibold text-heading">{item.gameTitle}</td>
                    <td>
                      <code className="slug-code">/p/{item.slug}</code>
                    </td>
                    <td>{sdks || 'No ad SDKs'}</td>
                    <td className="tabular-nums">{item.lastUpdated}</td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleCopyUrl(item.slug)}
                        >
                          {copiedSlug === item.slug ? 'Copied' : 'Copy Link'}
                        </button>
                        <a
                          href={`/p/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-xs"
                        >
                          Open
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        {confirmDeleteSlug === item.slug ? (
                          <>
                            <button
                              type="button"
                              className="btn btn-danger btn-xs"
                              onClick={() => handleDelete(item.slug)}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => setConfirmDeleteSlug('')}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => setConfirmDeleteSlug(item.slug)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminPoliciesTab
