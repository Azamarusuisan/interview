import { useState, useEffect } from 'react'

export interface EntrySheet {
  id: string
  title: string
  answers: Record<string, string>
  createdAt: string
  updatedAt: string
}

export function useEntrySheets() {
  const [entrySheets, setEntrySheets] = useState<EntrySheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEntrySheets()
  }, [])

  const fetchEntrySheets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/es')
      if (!response.ok) {
        throw new Error('Failed to fetch entry sheets')
      }
      const data = await response.json()
      setEntrySheets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createEntrySheet = async (title: string, answers: Record<string, string>) => {
    try {
      const response = await fetch('/api/es', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, answers }),
      })
      if (!response.ok) {
        throw new Error('Failed to create entry sheet')
      }
      const newEntrySheet = await response.json()
      await fetchEntrySheets()
      return newEntrySheet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateEntrySheet = async (id: string, updates: Partial<{ title: string; answers: Record<string, string> }>) => {
    try {
      const response = await fetch(`/api/es/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('Failed to update entry sheet')
      }
      const updatedEntrySheet = await response.json()
      await fetchEntrySheets()
      return updatedEntrySheet
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deleteEntrySheet = async (id: string) => {
    try {
      const response = await fetch(`/api/es/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete entry sheet')
      }
      await fetchEntrySheets()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return {
    entrySheets,
    loading,
    error,
    fetchEntrySheets,
    createEntrySheet,
    updateEntrySheet,
    deleteEntrySheet,
  }
}