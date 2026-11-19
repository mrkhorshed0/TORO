const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_SLUG_REGEX = /^[a-z0-9-]+$/

export function isValidEmail(email) {
  if (typeof email !== 'string') return false
  return EMAIL_REGEX.test(email.trim())
}

export function sanitizeSlug(value) {
  if (typeof value !== 'string') return ''
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function isValidPolicySlug(slug) {
  if (typeof slug !== 'string') return false
  return (
    slug.length >= 2 &&
    slug.length <= 64 &&
    VALID_SLUG_REGEX.test(slug) &&
    !slug.startsWith('-') &&
    !slug.endsWith('-')
  )
}

export function normalizeContactForm({ name, email, topic, message }, allowedTopics) {
  const trimmedName = (name || '').trim().slice(0, 100)
  const trimmedEmail = (email || '').trim().slice(0, 140)
  const trimmedMessage = (message || '').trim().slice(0, 3000)

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return {
      ok: false,
      error: 'Please complete your name, email address, and message.',
    }
  }

  if (!isValidEmail(trimmedEmail)) {
    return {
      ok: false,
      error: 'Please enter a valid email address.',
    }
  }

  const safeTopic =
    Array.isArray(allowedTopics) && allowedTopics.includes(topic)
      ? topic
      : allowedTopics?.[0] || 'Player Support'

  return {
    ok: true,
    data: {
      name: trimmedName,
      email: trimmedEmail,
      topic: safeTopic,
      message: trimmedMessage,
    },
  }
}
