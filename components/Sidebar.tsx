'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/providers'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  icon: React.ComponentType<any>
  path: string
  description: string
}

const tabSections = [
  {
    id: 'main',
    label: 'メインメニュー',
    tabs: [
      {
        id: 'home',
        label: 'ホーム',
        icon: HomeIcon,
        path: '/',
        description: 'ダッシュボード',
      },
    ]
  },
  {
    id: 'interview',
    label: '面接練習',
    tabs: [
      {
        id: 'case',
        label: 'ケース面接',
        icon: DocumentTextIcon,
        path: '/case',
        description: '論理思考・問題解決',
      },
      {
        id: 'general',
        label: '人物面接',
        icon: DocumentTextIcon,
        path: '/general',
        description: 'コミュニケーション・人物評価',
      },
    ]
  },
  {
    id: 'documents',
    label: '書類・履歴',
    tabs: [
      {
        id: 'es',
        label: 'エントリーシート',
        icon: DocumentTextIcon,
        path: '/es',
        description: 'ES作成・管理',
      },
      {
        id: 'history',
        label: '練習履歴',
        icon: DocumentTextIcon,
        path: '/history',
        description: '過去の結果・成長記録',
      },
    ]
  }
]

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // State persistence
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) {
      setCollapsed(JSON.parse(saved))
    } else {
      // Check if mobile on client side
      const checkMobile = () => window.innerWidth < 768
      if (checkMobile()) {
        setCollapsed(true)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed))
    }
  }, [collapsed, mounted])

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  const isActiveTab = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className={cn(
        "h-screen bg-white border-r border-gray-200 flex flex-col relative transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
        "md:static fixed inset-y-0 z-40"
      )}>
        {/* Toggle button */}
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white shadow-md
                     flex items-center justify-center text-gray-500 hover:bg-gray-100
                     transition-colors duration-200 z-50"
        >
          {collapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
        </button>

        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          {!collapsed ? (
            <>
              <h1 className="font-bold text-xl text-primary">
                Case Sprint
              </h1>
              <p className="text-sm text-gray-600 mt-1">ZettAI</p>
            </>
          ) : (
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">C</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4">
          {!collapsed ? (
            <Accordion type="multiple" defaultValue={['main', 'interview', 'documents']} className="space-y-2">
              {tabSections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-none">
                  <AccordionTrigger className="text-sm font-semibold text-gray-700 hover:text-gray-900 py-2 px-2 hover:no-underline">
                    {section.label}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="space-y-1 ml-2">
                      {section.tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
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
                                <Icon className={`w-5 h-5 mt-0.5 ${
                                  isActiveTab(tab.path) ? 'text-accent' : 'text-gray-600'
                                }`} />
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
                        )
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <ul className="space-y-2">
              {tabSections.flatMap(section => section.tabs).map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => handleTabClick(tab.path)}
                      title={tab.label}
                      className={`w-full flex items-center justify-center p-3 rounded-lg transition-all group ${
                        isActiveTab(tab.path)
                          ? 'bg-accent/10 text-accent'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </nav>

        {/* Practice Stats */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-2">今日の練習</div>
              <div className="flex justify-between text-sm">
                <span className="text-accent font-medium">ケース: 0回</span>
                <span className="text-primary font-medium">人物: 0回</span>
              </div>
            </div>
          </div>
        )}

        {/* Official Website Link */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-gray-200">
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all border border-blue-200 hover:border-blue-300"
            >
              🌐 公式サイトはこちら
            </a>
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={logout}
            title={collapsed ? "ログアウト" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-100 transition-all border border-red-200 hover:border-red-300",
              collapsed ? "justify-center" : "justify-center"
            )}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {!collapsed && <span className="font-medium">ログアウト</span>}
          </button>
        </div>
      </div>
    </>
  )
}