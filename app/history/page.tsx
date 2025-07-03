'use client'

import { useState, useEffect } from 'react'

interface HistoryItem {
  score: number
  feedback: string
  date: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    // LocalStorageから履歴を取得
    const savedResults = localStorage.getItem('caseResults')
    if (savedResults) {
      const results = JSON.parse(savedResults)
      setHistory(results.sort((a: HistoryItem, b: HistoryItem) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">練習履歴</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        {history.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              まだ練習履歴がありません
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              練習を始めて、あなたの成長を記録しましょう！
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.date)}
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${getScoreColor(item.score)}`}>
                      {item.score}点
                    </p>
                  </div>
                  <div className="text-4xl">
                    {item.score >= 80 ? '🏆' : item.score >= 60 ? '👍' : '💪'}
                  </div>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    フィードバック
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                    {item.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}