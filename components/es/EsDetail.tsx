'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EntrySheet } from '@/hooks/useEntrySheets'
import QuestionField from './QuestionField'

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

interface EsDetailProps {
  entrySheet: EntrySheet
  onUpdate: (updates: Partial<{ title: string; answers: Record<string, string> }>) => Promise<void>
  onDelete: (id: string) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
}

export default function EsDetail({
  entrySheet,
  onUpdate,
  onDelete,
  isEditing,
  setIsEditing,
}: EsDetailProps) {
  const router = useRouter()
  const [title, setTitle] = useState(entrySheet.title)
  const [answers, setAnswers] = useState(entrySheet.answers)
  const [saving, setSaving] = useState(false)

  const handleQuestionChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate({ title, answers })
      setIsEditing(false)
    } catch (error) {
      alert('更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTitle(entrySheet.title)
    setAnswers(entrySheet.answers)
    setIsEditing(false)
  }

  const handleDownloadPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default
      
      const content = `
        <div style="font-family: 'Noto Sans JP', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 30px;">
            ${entrySheet.title}
          </h1>
          
          <div style="margin-bottom: 20px; color: #666; font-size: 14px;">
            作成日: ${formatDate(entrySheet.createdAt)}<br>
            更新日: ${formatDate(entrySheet.updatedAt)}
          </div>

          ${defaultQuestions.map(question => `
            <div style="margin-bottom: 40px; page-break-inside: avoid;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px; padding: 10px; background-color: #f3f4f6; border-radius: 8px;">
                ${question.label}
              </h2>
              <div style="line-height: 1.8; font-size: 14px; white-space: pre-wrap; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #fafafa;">
                ${answers[question.id] || '未入力'}
              </div>
              <div style="text-align: right; font-size: 12px; color: #9ca3af; margin-top: 5px;">
                ${(answers[question.id] || '').length} / ${question.maxLength} 文字
              </div>
            </div>
          `).join('')}
        </div>
      `

      const opt = {
        margin: 1,
        filename: `${entrySheet.title.replace(/[^\w\s]/gi, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      }

      await html2pdf().set(opt).from(content).save()
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDF の生成に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-primary focus:outline-none"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{entrySheet.title}</h1>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span>作成: {formatDate(entrySheet.createdAt)}</span>
            <span>更新: {formatDate(entrySheet.updatedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                📥 PDF
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
              >
                編集
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {defaultQuestions.map((question) => (
          <QuestionField
            key={question.id}
            id={question.id}
            label={question.label}
            value={answers[question.id] || ''}
            onChange={handleQuestionChange}
            maxLength={question.maxLength}
            disabled={!isEditing}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => router.push('/es')}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← 一覧に戻る
        </button>
        <button
          onClick={() => {
            if (confirm('このエントリーシートを削除しますか？')) {
              onDelete(entrySheet.id)
              router.push('/es')
            }
          }}
          className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          削除
        </button>
      </div>
    </div>
  )
}