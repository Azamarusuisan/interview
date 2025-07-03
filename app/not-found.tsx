export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-primary mb-4">ページが見つかりません</h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <a
          href="/"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-block"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  )
}