export default function Loading() {
  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin text-4xl text-primary mb-4">⚪</div>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}