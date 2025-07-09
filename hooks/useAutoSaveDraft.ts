import { useEffect, useRef } from 'react'

const DB_NAME = 'ESAutoSave'
const STORE_NAME = 'esDrafts'

interface DraftData {
  id: string
  title: string
  answers: Record<string, string>
  timestamp: number
}

export function useAutoSaveDraft(id: string | null, title: string, answers: Record<string, string>) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const saveDraft = async () => {
    if (!id) return

    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      
      const draftData: DraftData = {
        id,
        title,
        answers,
        timestamp: Date.now(),
      }
      
      await store.put(draftData)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }

  const loadDraft = async (): Promise<DraftData | null> => {
    if (!id) return null

    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error('Failed to load draft:', error)
      return null
    }
  }

  const clearDraft = async () => {
    if (!id) return

    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      await store.delete(id)
    } catch (error) {
      console.error('Failed to clear draft:', error)
    }
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      saveDraft()
    }, 10000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [id, title, answers])

  return { saveDraft, loadDraft, clearDraft }
}

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}