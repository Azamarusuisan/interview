'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QuestionField from './QuestionField'
import { useAutoSaveDraft } from '@/hooks/useAutoSaveDraft'

interface Question {
  id: string
  label: string
  maxLength: number
}

const defaultQuestions: Question[] = [
  { id: 'self_pr', label: '自己PR', maxLength: 400 },
  { id: 'student_effort', label: '学生時代頑張ったこと', maxLength: 400 },
  { id: 'motivation', label: '志望動機', maxLength: 400 },
]

interface EsFormProps {
  initialData?: {
    id?: string
    title?: string
    answers?: Record<string, string>
  }
  onSubmit: (title: string, answers: Record<string, string>) => Promise<void>
  isEdit?: boolean
}

export default function EsForm({ initialData, onSubmit, isEdit = false }: EsFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialData?.answers || {}
  )
  const [saving, setSaving] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)

  const { saveDraft, loadDraft, clearDraft } = useAutoSaveDraft(
    initialData?.id || 'new',
    title,
    answers
  )

  useEffect(() => {
    if (!isEdit && !draftLoaded) {
      loadDraft().then((draft) => {
        if (draft) {
          setTitle(draft.title)
          setAnswers(draft.answers)
        }
        setDraftLoaded(true)
      })
    }
  }, [isEdit, draftLoaded, loadDraft])

  const handleQuestionChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    setSaving(true)
    try {
      await onSubmit(title, answers)
      if (!isEdit) {
        await clearDraft()
      }
    } catch (error) {
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          タイトル
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="例: ○○株式会社 ES"
          required
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {defaultQuestions.map((question) => (
          <QuestionField
            key={question.id}
            id={question.id}
            label={question.label}
            value={answers[question.id] || ''}
            onChange={handleQuestionChange}
            maxLength={question.maxLength}
          />
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={() => router.push('/es')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? '保存中...' : isEdit ? '更新' : '保存'}
        </button>
      </div>
    </form>
  )
}