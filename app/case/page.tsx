'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'

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

export default function CasePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [casePrompt, setCasePrompt] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  useEffect(() => {
    // クリーンアップ関数でメモリリークを防ぐ
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const startCaseInterview = () => {
    const randomCase = defaultCases[Math.floor(Math.random() * defaultCases.length)]
    setCasePrompt(randomCase)
    setMessages([{ 
      role: 'interviewer', 
      content: randomCase,
      timestamp: new Date()
    }])
    setSessionStartTime(new Date())
    setIsStarted(true)

    // 音声認識を遅延初期化
    setTimeout(() => {
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'ja-JP'
        recognitionRef.current = recognition
      }
    }, 100)
  }

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
        
        // リアルタイムで表示を更新
        setCurrentTranscript(finalTranscript + interimTranscript)
      }
      
      recognitionRef.current.onend = () => {
        setIsRecording(false)
        // 録音終了時に最終的なテキストを送信
        if (currentTranscript.trim()) {
          handleUserAnswer(currentTranscript.trim())
        }
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }
      
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        setIsRecording(false)
      }
    } else {
      alert('音声認識がサポートされていません。Chrome または Edge ブラウザをお使いください。')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }

  // 手動でテキストを送信する関数を追加
  const sendCurrentTranscript = () => {
    if (currentTranscript.trim()) {
      if (isRecording) {
        stopRecording()
      }
      handleUserAnswer(currentTranscript.trim())
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.question) {
        setMessages(prev => [...prev, { 
          role: 'interviewer', 
          content: data.question,
          timestamp: new Date()
        }])
      } else {
        // フォールバック質問
        const fallbackQuestions = [
          'その点についてもう少し詳しく説明していただけますか？',
          'なぜそのような判断をされたのでしょうか？',
          '他の選択肢は検討されましたか？'
        ]
        const fallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
        setMessages(prev => [...prev, { 
          role: 'interviewer', 
          content: fallback,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Error:', error)
      // フォールバック質問
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        content: 'その点についてもう少し詳しく説明していただけますか？',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const finishSession = async () => {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n')
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 0
    
    try {
      const res = await fetch('/api/sessions/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, casePrompt, duration }),
      })
      
      const data = await res.json()
      
      const results = JSON.parse(localStorage.getItem('caseResults') || '[]')
      results.push({
        type: 'case',
        score: data.score,
        feedback: data.feedback,
        duration,
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

  if (!isStarted) {
    return (
      <div className="min-h-screen">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-primary">ケース面接練習</h1>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold text-primary mb-4">
                ケース面接について
              </h2>
              <div className="space-y-4 text-gray-600 mb-8">
                <p>
                  ビジネス戦略やマーケティングに関する実践的な問題を通じて、
                  論理的思考力と問題解決能力を鍛えます。
                </p>
                <div className="bg-accent/10 rounded-lg p-4">
                  <div className="font-semibold text-accent mb-2">練習のポイント</div>
                  <ul className="text-sm space-y-1 text-left">
                    <li>• 構造化して考える</li>
                    <li>• 仮説を立てて検証する</li>
                    <li>• 数字で論理を支える</li>
                    <li>• 創造的な解決策を提案する</li>
                  </ul>
                </div>
              </div>
              <Button onClick={startCaseInterview} variant="success" className="w-full">
                🚀 ケース面接を開始
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ケース面接練習</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-mono bg-neutral px-4 py-2 rounded-lg">
              ⏱️ {formatTime(timeElapsed)} / 5:00
            </div>
            <Button onClick={finishSession} variant="secondary">
              セッション終了
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-accent mb-2">📋 ケース問題</h2>
          <p className="text-lg text-text">{casePrompt}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg">
          <div className="flex flex-col">
            <div className="p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%]`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        msg.role === 'interviewer' 
                          ? 'text-primary' 
                          : 'text-accent'
                      }`}>
                        {msg.role === 'interviewer' ? '👔 面接官' : '🎓 あなた'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      msg.role === 'interviewer'
                        ? 'bg-gray-100 text-text'
                        : 'bg-accent text-white'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
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
            
            <div className="border-t border-gray-200 p-4">
              {currentTranscript && (
                <div className="mb-4 p-3 bg-neutral rounded-lg">
                  <p className="text-sm text-gray-600">認識された内容:</p>
                  <p className="text-text">{currentTranscript}</p>
                  <Button
                    onClick={sendCurrentTranscript}
                    size="sm"
                    variant="success"
                    className="mt-2"
                    disabled={isLoading}
                  >
                    ✓ この内容を送信
                  </Button>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  variant={isRecording ? 'danger' : 'primary'}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isRecording ? (
                    <>
                      <span className="animate-pulse">●</span>
                      録音を停止
                    </>
                  ) : (
                    <>
                      🎙️ 音声で回答
                    </>
                  )}
                </Button>
              </div>
              
              {!recognitionRef.current && (
                <p className="text-xs text-gray-500 mt-2 text-center">
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