'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    // 最初の入力欄にフォーカス
    inputRefs[0].current?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // 1文字以上入力されないように
    
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    setError(false)

    // 次の入力欄に自動でフォーカス
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // 4桁入力されたら自動でログイン試行
    if (index === 3 && value) {
      const fullPin = newPin.join('')
      if (fullPin.length === 4) {
        handleLogin(fullPin)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // 現在の欄が空でBackspaceを押したら前の欄に戻る
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleLogin = async (pinCode: string) => {
    setIsLoading(true)
    
    // シンプルな遅延を入れてリアル感を演出
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (pinCode === '0000') {
      // ログイン成功
      localStorage.setItem('isAuthenticated', 'true')
      document.cookie = 'authenticated=true; path=/'
      router.push('/')
    } else {
      // ログイン失敗
      setError(true)
      setPin(['', '', '', ''])
      inputRefs[0].current?.focus()
    }
    
    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fullPin = pin.join('')
    if (fullPin.length === 4) {
      handleLogin(fullPin)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Case Sprint
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            PINコードを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-16 h-16 text-2xl font-bold text-center rounded-lg border-2 transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none`}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="text-center">
              <p className="text-red-500 text-sm">
                PINコードが正しくありません
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={pin.join('').length !== 4 || isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚪</span>
                確認中...
              </span>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            ヒント: 0000
          </p>
        </div>
      </div>
    </div>
  )
}