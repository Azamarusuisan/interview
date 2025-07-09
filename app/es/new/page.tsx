'use client'

import { useRouter } from 'next/navigation'
import { useEntrySheets } from '@/hooks/useEntrySheets'
import EsForm from '@/components/es/EsForm'

export default function NewEntrySheetPage() {
  const router = useRouter()
  const { createEntrySheet } = useEntrySheets()

  const handleSubmit = async (title: string, answers: Record<string, string>) => {
    try {
      const newEntrySheet = await createEntrySheet(title, answers)
      router.push(`/es/${newEntrySheet.id}`)
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">新規エントリーシート作成</h1>
        <p className="text-gray-600 mt-1">ES の質問項目を入力して保存してください</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
        <EsForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}