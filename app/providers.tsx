'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 初回読み込み時に認証状態をチェック
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true'
      setIsAuthenticated(auth)
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  useEffect(() => {
    // 認証状態に応じてリダイレクト
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login')
      }
    }
  }, [isAuthenticated, pathname, router, isLoading])

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    document.cookie = 'authenticated=true; path=/'
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
    document.cookie = 'authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⚪</div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}