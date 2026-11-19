import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '../../lib/firebase'
import { copyTextToClipboard } from '../../utils/clipboard'

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
  { id: 'archived', label: 'Archived' },
]

function formatTimestamp(ts) {
  if (!ts) return 'Just now'
  try {
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts)
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function AdminInboxTab() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return undefined
    }

    const path = 'contactMessages'
    const q = query(collection(db, path), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = []
        snapshot.forEach((docSnap) => {
          rows.push({ id: docSnap.id, ...docSnap.data() })
        })
        setMessages(rows)
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        try {
          handleFirestoreError(err, OperationType.LIST, path)
        } catch {
          setError('Could not load inbox messages. Please verify your permissions.')
        }
      }
    )

    return () => unsubscribe()
  }, [])

  const counts = useMemo(() => {
    const c = { all: messages.length, unread: 0, read: 0, archived: 0 }
    for (const msg of messages) {
      if (msg.status === 'unread') c.unread += 1
      else if (msg.status === 'read') c.read += 1
      else if (msg.status === 'archived') c.archived += 1
    }
    return c
  }, [messages])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return messages.filter((msg) => {
      if (statusFilter !== 'all' && msg.status !== statusFilter) return false
      if (!q) return true
      return (
        (msg.name || '').toLowerCase().includes(q) ||
        (msg.email || '').toLowerCase().includes(q) ||
        (msg.topic || '').toLowerCase().includes(q) ||
        (msg.message || '').toLowerCase().includes(q)
      )
    })
  }, [messages, statusFilter, search])

  const selectedMessage = useMemo(
    () => messages.find((m) => m.id === selectedId) || filtered[0] || null,
    [messages, filtered, selectedId]
  )

  const handleStatusChange = async (msgId, nextStatus) => {
    if (!db) return
    setError('')
    const path = `contactMessages/${msgId}`
    try {
      await updateDoc(doc(db, 'contactMessages', msgId), { status: nextStatus })
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, path)
      } catch {
        setError('Could not update message status.')
      }
    }
  }

  const handleSelectMessage = async (msg) => {
    setSelectedId(msg.id)
    setConfirmDeleteId('')
    if (msg.status === 'unread') {
      await handleStatusChange(msg.id, 'read')
    }
  }

  const handleDelete = async (msgId) => {
    if (!db) return
    setError('')
    const path = `contactMessages/${msgId}`
    try {
      await deleteDoc(doc(db, 'contactMessages', msgId))
      setConfirmDeleteId('')
      if (selectedId === msgId) setSelectedId(null)
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, path)
      } catch {
        setError('Could not delete this message.')
      }
    }
  }

  const handleCopySenderEmail = async (email) => {
    const ok = await copyTextToClipboard(email)
    if (ok) {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedEmail(false)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <div>
          <h2 className="admin-section-title">Contact Inbox</h2>
          <p className="admin-section-sub">
            Messages submitted from the public Contact page.
          </p>
        </div>
      </div>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-filter-bar">
        <div className="segmented-tabs" role="tablist" aria-label="Filter inbox">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab.id}
              className={`segmented-tab ${statusFilter === tab.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab.id)}
            >
              {tab.label}{' '}
              <span className="tabular-nums">({counts[tab.id]})</span>
            </button>
          ))}
        </div>

        <input
          type="search"
          className="admin-search"
          placeholder="Search sender, email, or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-panel-card">
          <div className="skeleton-line skeleton-md" />
          <div className="skeleton-line skeleton-lg" />
          <div className="skeleton-line skeleton-md" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">
          <h3>No messages in this view</h3>
          <p>
            Visitor inquiries submitted on the Contact page will appear here in
            real time.
          </p>
        </div>
      ) : (
        <div className="inbox-split">
          <div className="inbox-list" role="list">
            {filtered.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id
              return (
                <button
                  key={msg.id}
                  type="button"
                  role="listitem"
                  className={`inbox-row ${isSelected ? 'selected' : ''} ${
                    msg.status === 'unread' ? 'unread' : ''
                  }`}
                  onClick={() => handleSelectMessage(msg)}
                >
                  <div className="inbox-row-top">
                    <span className="inbox-sender">{msg.name}</span>
                    <span className={`state-label state-${msg.status}`}>
                      {msg.status === 'unread'
                        ? 'Unread'
                        : msg.status === 'archived'
                        ? 'Archived'
                        : 'Read'}
                    </span>
                  </div>
                  <div className="inbox-meta">
                    <span>{msg.topic}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {formatTimestamp(msg.createdAt)}
                    </span>
                  </div>
                  <p className="inbox-preview">{msg.message}</p>
                </button>
              )
            })}
          </div>

          {selectedMessage && (
            <div className="inbox-detail">
              <div className="inbox-detail-head">
                <div>
                  <span className={`state-label state-${selectedMessage.status}`}>
                    {selectedMessage.status === 'unread'
                      ? 'Unread'
                      : selectedMessage.status === 'archived'
                      ? 'Archived'
                      : 'Read'}
                  </span>
                  <h3>{selectedMessage.topic}</h3>
                  <p className="inbox-detail-sender">
                    From <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                  </p>
                  <p className="inbox-detail-time tabular-nums">
                    Received {formatTimestamp(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>

              <div className="inbox-detail-body">
                <p>{selectedMessage.message}</p>
              </div>

              <div className="inbox-detail-actions">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    `Re: ${selectedMessage.topic} — Toro Studio`
                  )}`}
                  className="btn btn-primary btn-sm"
                >
                  Reply via Email
                </a>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopySenderEmail(selectedMessage.email)}
                >
                  {copiedEmail ? 'Email Copied' : 'Copy Email'}
                </button>
                {selectedMessage.status !== 'unread' ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusChange(selectedMessage.id, 'unread')}
                  >
                    Mark Unread
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusChange(selectedMessage.id, 'read')}
                  >
                    Mark Read
                  </button>
                )}
                {selectedMessage.status !== 'archived' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                  >
                    Archive
                  </button>
                )}

                {confirmDeleteId === selectedMessage.id ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setConfirmDeleteId('')}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setConfirmDeleteId(selectedMessage.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminInboxTab
