import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const followUpQuestions = [
  'その経験から何を学びましたか？',
  'もう少し詳しく教えてください。',
  'その時の気持ちはどうでしたか？',
  '他の選択肢も考えましたか？',
  '今振り返ってどう思いますか？',
  'その経験が今にどう活かされていますか？',
]

export async function POST(req: NextRequest) {
  try {
    const { currentQuestion, userAnswer, conversationHistory, industry } = await req.json()
    
    // 時々フォローアップ質問、時々新しい質問
    const shouldFollowUp = Math.random() < 0.6 // 60%の確率でフォローアップ
    
    if (shouldFollowUp) {
      const followUp = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)]
      return NextResponse.json({ question: followUp })
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are conducting a personal interview for job candidates in the ${industry || 'general'} industry. 
          Current question: ${currentQuestion}
          
          Based on the candidate's answer, ask ONE follow-up question that:
          - Digs deeper into their experience and thought process
          - Tests their self-awareness and reflection ability
          - Evaluates their problem-solving and communication skills
          - Assesses their values and motivation
          - Explores their learning and growth mindset
          ${industry ? `- Is relevant to the ${industry} industry context and expectations` : ''}
          
          ${industry ? `Consider the specific qualities and skills valued in the ${industry} industry.` : 'Keep the questions general and applicable to any industry.'}
          Respond in Japanese and keep it conversational but professional.`,
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === 'interviewer' ? 'assistant' : 'user',
          content: msg.content,
        })),
        {
          role: 'user',
          content: userAnswer,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })
    
    return NextResponse.json({ question: completion.choices[0].message.content })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate question' },
      { status: 500 }
    )
  }
}