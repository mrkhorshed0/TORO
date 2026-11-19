import { createContext, useContext, useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from '../lib/firebase'
import { defaultSiteContent } from '../data/defaultSiteContent'

const SiteContentContext = createContext({
  content: defaultSiteContent,
  loading: true,
})

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(defaultSiteContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const path = 'siteContent'
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const merged = { ...defaultSiteContent }
        snapshot.forEach((docSnap) => {
          const id = docSnap.id
          if (merged[id]) {
            merged[id] = {
              ...merged[id],
              ...docSnap.data(),
            }
          }
        })
        setContent(merged)
        setLoading(false)
      },
      (error) => {
        setLoading(false)
        try {
          handleFirestoreError(error, OperationType.LIST, path)
        } catch (err) {
          console.warn('Using fallback site content:', err.message)
        }
      }
    )

    return () => unsubscribe()
  }, [])

  return (
    <SiteContentContext.Provider value={{ content, loading }}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}
