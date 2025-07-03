'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function ResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = searchParams.get('score')
  const feedback = searchParams.get('feedback')

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Session Complete!</h1>
        
        <div className="text-center mb-8">
          <p className="text-6xl font-bold text-blue-600 dark:text-blue-400">
            {score}
          </p>
          <p className="text-xl text-gray-600 dark:text-gray-400">/ 100</p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feedback</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {decodeURIComponent(feedback || '')}
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/session')}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700"
          >
            Try Another Case
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}