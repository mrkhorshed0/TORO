import test from 'node:test'
import assert from 'node:assert/strict'
import {
  isValidEmail,
  isValidPolicySlug,
  normalizeContactForm,
  sanitizeSlug,
} from './validators.js'

test('sanitizeSlug normalizes titles into clean URL slugs', () => {
  assert.equal(sanitizeSlug('Sky Hopper 2!'), 'sky-hopper-2')
  assert.equal(sanitizeSlug('  ---Toro Game--1--- '), 'toro-game-1')
  assert.equal(sanitizeSlug('a'.repeat(80)).length, 64)
})

test('isValidPolicySlug validates unlisted game privacy policy slugs', () => {
  assert.equal(isValidPolicySlug('toro-game-1'), true)
  assert.equal(isValidPolicySlug('a'), false)
  assert.equal(isValidPolicySlug('../admin'), false)
  assert.equal(isValidPolicySlug('UpperCase'), false)
  assert.equal(isValidPolicySlug('-leading'), false)
})

test('isValidEmail validates studio and visitor email addresses', () => {
  assert.equal(isValidEmail('toro@gmail.com'), true)
  assert.equal(isValidEmail('player@example.co.uk'), true)
  assert.equal(isValidEmail('not-an-email'), false)
  assert.equal(isValidEmail('missing@domain'), false)
  assert.equal(isValidEmail(''), false)
})

test('normalizeContactForm enforces required fields and sanitizes topic', () => {
  const topics = ['Player Support', 'Game Feedback']

  const empty = normalizeContactForm(
    { name: '  ', email: 'a@b.com', topic: 'Player Support', message: 'Hi' },
    topics
  )
  assert.equal(empty.ok, false)

  const badEmail = normalizeContactForm(
    { name: 'Toro Player', email: 'bad', topic: 'Player Support', message: 'Hi' },
    topics
  )
  assert.equal(badEmail.ok, false)

  const valid = normalizeContactForm(
    {
      name: '  Khorshed  ',
      email: ' player@example.com ',
      topic: 'InjectedTopic',
      message: ' Great game! ',
    },
    topics
  )
  assert.equal(valid.ok, true)
  assert.deepEqual(valid.data, {
    name: 'Khorshed',
    email: 'player@example.com',
    topic: 'Player Support',
    message: 'Great game!',
  })
})
