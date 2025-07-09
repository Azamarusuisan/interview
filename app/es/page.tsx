'use client'

import { useRouter } from 'next/navigation'
import { useEntrySheets } from '@/hooks/useEntrySheets'
import EsList from '@/components/es/EsList'

export default function EntrySheetListPage() {
  const router = useRouter()
  const { entrySheets, loading, deleteEntrySheet } = useEntrySheets()

  const handleDelete = async (id: string) => {
    try {
      await deleteEntrySheet(id)
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">エントリーシート</h1>
          <p className="text-gray-600 mt-1">ES の作成・管理</p>
        </div>
        <button
          onClick={() => router.push('/es/new')}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all"
        >
          ➕ 新規作成
        </button>
      </div>

      {/* List */}
      <EsList
        entrySheets={entrySheets}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Floating Action Button */}
      {entrySheets.length > 0 && (
        <button
          onClick={() => router.push('/es/new')}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title="新規作成"
        >
          ➕
        </button>
      )}
    </div>
  )
}