import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, handleFirestoreError, isFirebaseConfigured, OperationType } from '../lib/firebase'
import { useSiteContent } from '../context/SiteContentContext'
import { copyTextToClipboard } from '../utils/clipboard'
import { normalizeContactForm } from '../utils/validators'

const TOPICS = [
  'Player Support',
  'Game Feedback',
  'Business & Publishing',
  'Privacy Inquiry',
]

function Contact() {
  const { content } = useSiteContent()
  const contactInfo = content.contact
  const studioEmail = contactInfo.email || 'toro@gmail.com'

  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: TOPICS[0],
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('')

    const validation = normalizeContactForm(form, TOPICS)
    if (!validation.ok) {
      setError(validation.error)
      return
    }

    if (!isFirebaseConfigured || !db) {
      setError(
        `Direct form delivery is currently offline. Please email us directly at ${studioEmail}.`
      )
      return
    }

    setSubmitting(true)
    const path = 'contactMessages'
    try {
      await addDoc(collection(db, path), {
        ...validation.data,
        status: 'unread',
        createdAt: serverTimestamp(),
      })

      setStatus(
        'Your message has been delivered to Toro Studio. We will reply to your email address soon.'
      )
      setForm({ name: '', email: '', topic: TOPICS[0], message: '' })
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, path)
      } catch {
        setError(
          `Unable to submit right now. Please try again or email us directly at ${studioEmail}.`
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyEmail = async () => {
    const ok = await copyTextToClipboard(studioEmail)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } else {
      setCopied(false)
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="kicker-text">{contactInfo.kicker}</p>
          <h1 className="page-title">{contactInfo.title}</h1>
          <p className="page-lead">{contactInfo.lead}</p>
        </div>
      </section>

      <section className="prose-section">
        <div className="container">
          <div className="contact-layout">
            <div className="form-card">
              <form className="form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    maxLength={100}
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    maxLength={140}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="topic">Subject</label>
                  <select
                    id="topic"
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  >
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows="5"
                    maxLength={3000}
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                {status && (
                  <p className="form-feedback" role="status">
                    {status}
                  </p>
                )}
              </form>
            </div>

            <aside className="contact-sidebar">
              <div className="info-panel">
                <h2>Studio Details</h2>

                <div className="info-row">
                  <span className="info-label">Studio Email</span>
                  <div className="email-copy-row">
                    <span className="info-value">{studioEmail}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCopyEmail}
                    >
                      {copied ? 'Email Copied' : 'Copy Email'}
                    </button>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Location</span>
                  <span className="info-value">
                    {contactInfo.location || 'Rangpur, Bangladesh'}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Storefronts</span>
                  <span className="info-value">
                    {contactInfo.platforms ||
                      'Google Play Store · Amazon Appstore'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
