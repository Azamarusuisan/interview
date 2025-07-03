'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'

interface Message {
  role: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
}

interface Industry {
  id: string
  name: string
  icon: string
  questions: string[]
}

const industries: Industry[] = [
  {
    id: 'consulting',
    name: 'コンサルティング',
    icon: '💼',
    questions: [
      '自己紹介をお願いします。',
      'なぜコンサルティング業界を志望しているのですか？',
      'あなたの強みと弱みを教えてください。',
      '論理的思考力をアピールできる経験を教えてください。',
      'チームで困難な問題を解決した経験を教えてください。',
      'クライアントと向き合う上で大切にしたいことは何ですか？',
      'ストレス耐性をアピールできるエピソードを教えてください。',
      '5年後のキャリアビジョンを聞かせてください。',
    ]
  },
  {
    id: 'it',
    name: 'IT・テック',
    icon: '💻',
    questions: [
      '自己紹介をお願いします。',
      'なぜIT業界を志望しているのですか？',
      'あなたの強みと弱みを教えてください。',
      '技術的な課題を解決した経験を教えてください。',
      'チーム開発での経験や役割を教えてください。',
      '新しい技術に対してどのようにキャッチアップしていますか？',
      'ユーザー目線で物事を考えた経験を教えてください。',
      'IT業界のトレンドについてどう思いますか？',
    ]
  },
  {
    id: 'advertising',
    name: '広告・マーケティング',
    icon: '📢',
    questions: [
      '自己紹介をお願いします。',
      'なぜ広告業界を志望しているのですか？',
      'あなたの強みと弱みを教えてください。',
      'クリエイティブな発想力をアピールできる経験を教えてください。',
      'チームでアイデアを形にした経験を教えてください。',
      '消費者のニーズを捉えた経験を教えてください。',
      'プレゼンテーションで成功した経験を教えてください。',
      '最近注目している広告やキャンペーンはありますか？',
    ]
  },
  {
    id: 'securities',
    name: '証券・金融',
    icon: '📈',
    questions: [
      '自己紹介をお願いします。',
      'なぜ証券・金融業界を志望しているのですか？',
      'あなたの強みと弱みを教えてください。',
      '数字に対する分析力をアピールできる経験を教えてください。',
      'プレッシャーの中で成果を出した経験を教えてください。',
      '顧客との信頼関係を築いた経験を教えてください。',
      'リスク管理について意識した経験を教えてください。',
      '金融市場の動向についてどう考えていますか？',
    ]
  },
]

export default function GeneralPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(industries[0])
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
        
        if (elapsed >= 600) {
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

  const startGeneralInterview = () => {
    const questions = selectedIndustry.questions
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQuestion(randomQuestion)
    setMessages([{ 
      role: 'interviewer', 
      content: randomQuestion,
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
    
    if (questionCount >= 4) {
      finishSession()
      return
    }
    
    try {
      const res = await fetch('/api/sessions/next-general-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestion,
          userAnswer: answer,
          conversationHistory: messages,
          industry: selectedIndustry.name,
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
        setCurrentQuestion(data.question)
        setQuestionCount(prev => prev + 1)
      } else {
        // フォールバック質問
        const fallbackQuestions = [
          'その経験から何を学びましたか？',
          'もう少し具体的に教えてください。',
          'どのような気持ちでしたか？'
        ]
        const fallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
        setMessages(prev => [...prev, { 
          role: 'interviewer', 
          content: fallback,
          timestamp: new Date()
        }])
        setCurrentQuestion(fallback)
        setQuestionCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error:', error)
      // フォールバック質問
      const fallback = 'その経験から何を学びましたか？'
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        content: fallback,
        timestamp: new Date()
      }])
      setCurrentQuestion(fallback)
      setQuestionCount(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  const finishSession = async () => {
    const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n')
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000) : 0
    
    try {
      const res = await fetch('/api/sessions/finish-general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, duration, industry: selectedIndustry.name }),
      })
      
      const data = await res.json()
      
      const results = JSON.parse(localStorage.getItem('caseResults') || '[]')
      results.push({
        type: 'general',
        score: data.score,
        feedback: data.feedback,
        duration,
        date: new Date().toISOString(),
      })
      localStorage.setItem('caseResults', JSON.stringify(results))
      
      router.push(`/result?score=${data.score}&feedback=${encodeURIComponent(data.feedback)}&type=general`)
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
            <h1 className="text-2xl font-bold text-primary">人物面接練習</h1>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 業界選択タブ */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-primary mb-4">業界を選択してください</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedIndustry.id === industry.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-2xl mb-2">{industry.icon}</div>
                    <div className="text-sm font-medium">{industry.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 選択された業界の説明 */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{selectedIndustry.icon}</div>
                <h2 className="text-2xl font-bold text-primary">
                  {selectedIndustry.name}の人物面接
                </h2>
              </div>
              
              <div className="space-y-4 text-gray-600 mb-8">
                <p>
                  {selectedIndustry.name}業界に特化した人物面接の練習をします。
                  業界特有の質問や求められる人物像に合わせて準備しましょう。
                </p>
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="font-semibold text-primary mb-2">想定される質問例</div>
                  <ul className="text-sm space-y-1 text-left">
                    {selectedIndustry.questions.slice(0, 4).map((question, idx) => (
                      <li key={idx}>• {question}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <Button 
                onClick={startGeneralInterview} 
                variant="success"
                className="w-full"
              >
                🚀 {selectedIndustry.name}面接を開始
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
          <h1 className="text-2xl font-bold text-primary">人物面接練習</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-mono bg-neutral px-4 py-2 rounded-lg">
              ⏱️ {formatTime(timeElapsed)} / 10:00
            </div>
            <div className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
              質問 {questionCount + 1} / 5
            </div>
            <Button onClick={finishSession} variant="secondary">
              セッション終了
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
          <h2 className="text-sm font-semibold text-primary mb-2">💬 人物面接質問</h2>
          <p className="text-lg text-text">{currentQuestion}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                        : 'bg-primary text-white'
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