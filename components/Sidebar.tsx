'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/providers'

interface Tab {
  id: string
  label: string
  icon: string
  path: string
  description: string
}

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'ホーム',
    icon: '🏠',
    path: '/',
    description: 'ダッシュボード',
  },
  {
    id: 'case',
    label: 'ケース面接',
    icon: '🎯',
    path: '/case',
    description: '論理思考・問題解決',
  },
  {
    id: 'general',
    label: '人物面接',
    icon: '👤',
    path: '/general',
    description: 'コミュニケーション・人物評価',
  },
  {
    id: 'history',
    label: '練習履歴',
    icon: '📊',
    path: '/history',
    description: '過去の結果・成長記録',
  },
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  const isActiveTab = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="font-bold text-xl text-primary">
          Case Sprint
        </h1>
        <p className="text-sm text-gray-600 mt-1">ZettAI</p>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => handleTabClick(tab.path)}
                className={`w-full text-left rounded-lg transition-all group ${
                  isActiveTab(tab.path)
                    ? 'bg-accent/10 border-l-4 border-accent'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className={`text-xl mt-0.5 ${
                    isActiveTab(tab.path) ? 'text-accent' : 'text-gray-600'
                  }`}>
                    {tab.icon}
                  </span>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isActiveTab(tab.path) ? 'text-accent' : 'text-gray-700'
                    }`}>
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Practice Stats */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2">今日の練習</div>
          <div className="flex justify-between text-sm">
            <span className="text-accent font-medium">ケース: 0回</span>
            <span className="text-primary font-medium">人物: 0回</span>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <span>🚪</span>
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </div>
  )
}