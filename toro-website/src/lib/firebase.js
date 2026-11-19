import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore'

// Safely load local AI Studio config if present (gitignored; never committed to GitHub)
const localConfigModules = import.meta.glob('../../../firebase-applet-config.json', {
  eager: true,
})
const localConfig = Object.values(localConfigModules)[0]?.default || {}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain || '',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId || '',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    localConfig.storageBucket ||
    '',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    localConfig.messagingSenderId ||
    '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId || '',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    localConfig.firestoreDatabaseId ||
    '(default)',
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)

let app = null
let db = null
let auth = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
  auth = getAuth(app)
}

export { db, auth }
export const firebaseProjectId = firebaseConfig.projectId

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
}

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo))
  throw new Error(JSON.stringify(errInfo))
}

async function testConnection() {
  if (!db) return
  try {
    await getDocFromServer(doc(db, 'test', 'connection'))
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.')
    }
  }
}

testConnection()
