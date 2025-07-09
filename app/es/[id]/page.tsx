'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEntrySheets } from '@/hooks/useEntrySheets'
import EsDetail from '@/components/es/EsDetail'

interface EntrySheetDetailPageProps {
  params: Promise<{ id: string }>
}

export default function EntrySheetDetailPage({ params }: EntrySheetDetailPageProps) {
  const searchParams = useSearchParams()
  const [id, setId] = useState<string>('')
  const [entrySheet, setEntrySheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { updateEntrySheet, deleteEntrySheet } = useEntrySheets()

  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId)
      const editMode = searchParams.get('edit') === 'true'
      setIsEditing(editMode)
    })
  }, [params, searchParams])

  useEffect(() => {
    if (id) {
      fetchEntrySheet()
    }
  }, [id])

  const fetchEntrySheet = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/es/${id}`)
      if (!response.ok) {
        throw new Error('Entry sheet not found')
      }
      const data = await response.json()
      setEntrySheet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (updates: Partial<{ title: string; answers: Record<string, string> }>) => {
    try {
      const updated = await updateEntrySheet(id, updates)
      setEntrySheet(updated)
    } catch (error) {
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEntrySheet(id)
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          エラーが発生しました
        </h3>
        <p className="text-gray-500">{error}</p>
      </div>
    )
  }

  if (!entrySheet) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          エントリーシートが見つかりません
        </h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <EsDetail
          entrySheet={entrySheet}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </div>
    </div>
  )
}