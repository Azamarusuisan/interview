'use client'

import { useRouter } from 'next/navigation'
import { EntrySheet } from '@/hooks/useEntrySheets'

interface EsListProps {
  entrySheets: EntrySheet[]
  onDelete: (id: string) => void
  loading: boolean
}

export default function EsList({ entrySheets, onDelete, loading }: EsListProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  if (entrySheets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📄</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          エントリーシートがありません
        </h3>
        <p className="text-gray-500 mb-6">
          新しいエントリーシートを作成してみましょう
        </p>
        <button
          onClick={() => router.push('/es/new')}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all"
        >
          新規作成
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entrySheets.map((es) => (
        <div
          key={es.id}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {es.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>作成: {formatDate(es.createdAt)}</span>
                <span>更新: {formatDate(es.updatedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => router.push(`/es/${es.id}`)}
                className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                詳細
              </button>
              <button
                onClick={() => router.push(`/es/${es.id}?edit=true`)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                編集
              </button>
              <button
                onClick={() => {
                  if (confirm('このエントリーシートを削除しますか？')) {
                    onDelete(es.id)
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}