'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-primary mb-4">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">
          申し訳ございません。予期しないエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          再試行
        </button>
      </div>
    </div>
  )
}