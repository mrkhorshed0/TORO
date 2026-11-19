import { useEffect, useState } from 'react'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '../../lib/firebase'
import { useSiteContent } from '../../context/SiteContentContext'
import { defaultSiteContent } from '../../data/defaultSiteContent'

const SITE_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'contact', label: 'Contact Info' },
]

const LEGAL_SECTIONS = [
  { id: 'privacyPolicy', label: 'Studio Privacy Policy' },
  { id: 'terms', label: 'Terms & Conditions' },
]

function AdminContentTab({ mode }) {
  const sections = mode === 'legal' ? LEGAL_SECTIONS : SITE_SECTIONS
  const { content } = useSiteContent()
  const [activeSection, setActiveSection] = useState(sections[0].id)
  const [form, setForm] = useState({
    kicker: '',
    title: '',
    lead: '',
    bodyText: '',
    ctaLabel: '',
    email: '',
    location: '',
    platforms: '',
    lastUpdated: '',
  })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setActiveSection(sections[0].id)
  }, [mode])

  useEffect(() => {
    const data = content[activeSection] || defaultSiteContent[activeSection] || {}
    setForm({
      kicker: data.kicker || '',
      title: data.title || '',
      lead: data.lead || '',
      bodyText: (data.bodyParagraphs || []).join('\n\n'),
      ctaLabel: data.ctaLabel || '',
      email: data.email || '',
      location: data.location || '',
      platforms: data.platforms || '',
      lastUpdated: data.lastUpdated || '',
    })
    setNotice('')
    setError('')
  }, [activeSection, content])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    const title = form.title.trim().slice(0, 200)
    const lead = form.lead.trim().slice(0, 800)

    if (!title || !lead) {
      setError('Headline Title and Lead Paragraph are required.')
      return
    }

    const payload = {
      sectionId: activeSection,
      kicker: form.kicker.trim().slice(0, 120),
      title,
      lead,
      updatedAt: serverTimestamp(),
    }

    if (activeSection !== 'contact') {
      payload.bodyParagraphs = form.bodyText
        .split(/\n{2,}/)
        .map((p) => p.trim().slice(0, 2000))
        .filter(Boolean)
        .slice(0, 25)
    }

    if (activeSection === 'home') {
      payload.ctaLabel = form.ctaLabel.trim().slice(0, 80)
      payload.location = form.location.trim().slice(0, 120)
      payload.platforms = form.platforms.trim().slice(0, 160)
    }

    if (activeSection === 'contact') {
      payload.email = form.email.trim().slice(0, 120)
      payload.location = form.location.trim().slice(0, 120)
      payload.platforms = form.platforms.trim().slice(0, 160)
    }

    if (activeSection === 'privacyPolicy' || activeSection === 'terms') {
      payload.lastUpdated = form.lastUpdated.trim().slice(0, 60) || 'November 2026'
    }

    setSaving(true)
    const path = `siteContent/${activeSection}`
    try {
      await setDoc(doc(db, 'siteContent', activeSection), payload)
      setNotice('Published changes live to the public website.')
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path)
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefault = async () => {
    setSaving(true)
    setError('')
    setNotice('')
    const path = `siteContent/${activeSection}`
    try {
      await deleteDoc(doc(db, 'siteContent', activeSection))
      setNotice('Restored built-in default copy for this section.')
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-section-title">
            {mode === 'legal' ? 'Legal Documents Editor' : 'Website Content Editor'}
          </h2>
          <p className="admin-section-sub">
            {mode === 'legal'
              ? 'Edit the public Studio Privacy Policy and Terms & Conditions linked in the site footer.'
              : 'Update live text across Toro public pages without editing source code.'}
          </p>
        </div>
      </div>

      <div className="segmented-tabs" role="tablist" aria-label="Content sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={`segmented-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
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

      <div className="admin-panel-card">
        <form className="form" onSubmit={handleSave}>
          <div className="admin-form-grid">
            <div className="form-group">
              <label htmlFor="cms-kicker">Section Kicker</label>
              <input
                id="cms-kicker"
                type="text"
                maxLength={120}
                value={form.kicker}
                onChange={(e) => setForm({ ...form, kicker: e.target.value })}
              />
            </div>

            {(activeSection === 'privacyPolicy' || activeSection === 'terms') && (
              <div className="form-group">
                <label htmlFor="cms-updated">Last Updated Label</label>
                <input
                  id="cms-updated"
                  type="text"
                  maxLength={60}
                  value={form.lastUpdated}
                  onChange={(e) => setForm({ ...form, lastUpdated: e.target.value })}
                />
              </div>
            )}

            {activeSection === 'home' && (
              <div className="form-group">
                <label htmlFor="cms-cta">Primary CTA Button Label</label>
                <input
                  id="cms-cta"
                  type="text"
                  maxLength={80}
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cms-title">
              Headline Title{' '}
              <span className="char-counter tabular-nums">
                ({form.title.length}/200)
              </span>
            </label>
            <input
              id="cms-title"
              type="text"
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cms-lead">
              Lead Summary{' '}
              <span className="char-counter tabular-nums">
                ({form.lead.length}/800)
              </span>
            </label>
            <textarea
              id="cms-lead"
              rows="3"
              maxLength={800}
              value={form.lead}
              onChange={(e) => setForm({ ...form, lead: e.target.value })}
              required
            />
          </div>

          {(activeSection === 'home' || activeSection === 'contact') && (
            <div className="admin-form-grid">
              {activeSection === 'contact' && (
                <div className="form-group">
                  <label htmlFor="cms-email">Studio Email</label>
                  <input
                    id="cms-email"
                    type="email"
                    maxLength={120}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cms-location">Studio Location</label>
                <input
                  id="cms-location"
                  type="text"
                  maxLength={120}
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cms-platforms">Storefronts Label</label>
                <input
                  id="cms-platforms"
                  type="text"
                  maxLength={160}
                  value={form.platforms}
                  onChange={(e) => setForm({ ...form, platforms: e.target.value })}
                />
              </div>
            </div>
          )}

          {activeSection !== 'contact' && (
            <div className="form-group">
              <label htmlFor="cms-body">
                Body Sections / Paragraphs (separate paragraphs with a blank line)
              </label>
              <textarea
                id="cms-body"
                rows="10"
                value={form.bodyText}
                onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              />
            </div>
          )}

          <div className="admin-form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetDefault}
              disabled={saving}
            >
              Reset to Default
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Publishing...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminContentTab
