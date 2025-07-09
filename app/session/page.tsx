'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
}

const defaultCases = [
  '新しいコーヒーチェーンが日本市場に参入する際の戦略を提案してください。',
  'スマートフォンメーカーの売上が20%減少しました。原因を分析し、改善策を提案してください。',
  '地方都市の人口減少問題を解決するための施策を3つ提案してください。',
  'ECサイトの顧客単価を向上させる方法を構造的に検討してください。',
  '日本の観光業界が外国人観光客を増やすための戦略を立案してください。',
]

export default function SessionPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [casePrompt, setCasePrompt] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const randomCase = defaultCases[Math.floor(Math.random() * defaultCases.length)]
    setCasePrompt(randomCase)
    setMessages([{ 
      role: 'interviewer', 
      content: randomCase,
      timestamp: new Date()
    }])
    setSessionStartTime(new Date())

    // 音声認識の初期化
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ja-JP'
      recognitionRef.current = recognition
    }
  }, [])

  useEffect(() => {
    if (sessionStartTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
        setTimeElapsed(elapsed)
        
        if (elapsed >= 300) {
          finishSession()
        }
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [sessionStartTime])

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true)
      setCurrentTranscript('')
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        setCurrentTranscript(prev => prev + finalTranscript + interimTranscript)
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }
      
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      
      if (currentTranscript.trim()) {
        handleUserAnswer(currentTranscript.trim())
      }
    }
  }

  const handleUserAnswer = async (answer: string) => {
    setMessages(prev => [...prev, { 
      role: 'candidate', 
      content: answer,
      timestamp: new Date()
    }])
    setCurrentTranscript('')
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/sessions/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          casePrompt,
          userAnswer: answer,
          conversationHistory: messages,
        }),
      })
      
      const data = await res.json()
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        content: data.question,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const finishSession = async () => {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n')
    
    try {
      const res = await fetch('/api/sessions/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, casePrompt }),
      })
      
      const data = await res.json()
      
      // LocalStorageに結果を保存
      const results = JSON.parse(localStorage.getItem('caseResults') || '[]')
      results.push({
        score: data.score,
        feedback: data.feedback,
        date: new Date().toISOString(),
      })
      localStorage.setItem('caseResults', JSON.stringify(results))
      
      router.push(`/result?score=${data.score}&feedback=${encodeURIComponent(data.feedback)}`)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ケース面接練習</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-mono bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
              ⏱️ {formatTime(timeElapsed)} / 5:00
            </div>
            <button
              onClick={finishSession}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition"
            >
              セッション終了
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* ケース問題 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 ケース問題</h2>
          <p className="text-lg text-gray-800 dark:text-gray-200">{casePrompt}</p>
        </div>
        
        {/* チャットエリア */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="flex flex-col">
            {/* メッセージ表示エリア */}
            <div className="p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] ${msg.role === 'interviewer' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        msg.role === 'interviewer' 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {msg.role === 'interviewer' ? '👔 面接官' : '🎓 あなた'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      msg.role === 'interviewer'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <div className="animate-bounce">●</div>
                      <div className="animate-bounce delay-100">●</div>
                      <div className="animate-bounce delay-200">●</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* 入力エリア */}
            <div className="border-t dark:border-gray-700 p-4">
              {currentTranscript && (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">録音中の内容:</p>
                  <p className="text-gray-800 dark:text-gray-200">{currentTranscript}</p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? (
                    <>
                      <span className="animate-pulse">●</span>
                      録音を停止して送信
                    </>
                  ) : (
                    <>
                      🎙️ 音声で回答
                    </>
                  )}
                </button>
              </div>
              
              {!recognitionRef.current && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  ※ Chrome または Edge ブラウザで音声入力が利用できます
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}