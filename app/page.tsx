'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './providers'
import Button from '@/components/Button'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="animate-spin text-4xl text-primary">⚪</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-primary">ダッシュボード</h1>
          <p className="text-gray-600 mt-1">練習したい面接タイプを選択してください</p>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 面接タイプ選択 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* ケース面接カード */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <div className="bg-gradient-to-br from-accent/20 to-accent/10 p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-primary mb-2">ケース面接</h2>
                <p className="text-gray-600">
                  論理的思考力と問題解決能力を鍛える
                </p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-accent">✓</span>
                    <span>ビジネス戦略問題</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-accent">✓</span>
                    <span>構造化思考の訓練</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-accent">✓</span>
                    <span>AIとのインタラクティブな対話</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-accent">✓</span>
                    <span>時間制限: 5分</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/case')}
                  variant="success"
                  className="w-full mt-auto"
                >
                  🚀 ケース面接を開始
                </Button>
              </div>
            </div>

            {/* 人物面接カード */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-6">
                <div className="text-4xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-primary mb-2">人物面接</h2>
                <p className="text-gray-600">
                  コミュニケーション力と人間性をアピール（全業界対応）
                </p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>自己分析・価値観</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>経験談の深掘り</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>コミュニケーション評価</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>時間制限: 10分</span>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/general')}
                  variant="success"
                  className="w-full mt-auto"
                >
                  🚀 人物面接を開始
                </Button>
              </div>
            </div>
          </div>

          {/* 最近の結果 */}
          <RecentResults />
        </div>
      </div>
    </div>
  )
}

function RecentResults() {
  const router = useRouter()
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">最近の練習結果</h3>
        <Button 
          onClick={() => router.push('/history')}
          variant="secondary"
          size="sm"
        >
          すべて見る
        </Button>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>練習を開始すると、ここに結果が表示されます</p>
      </div>
    </div>
  )
}