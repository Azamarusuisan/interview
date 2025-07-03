import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { casePrompt, userAnswer, conversationHistory } = await req.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a strict case interview coach for Japanese consulting firms. 
          Current case: ${casePrompt}
          
          Your role:
          - Ask ONE follow-up question to push the candidate's thinking
          - Be demanding but encouraging
          - Focus on structure, creativity, and business sense
          - Respond in Japanese`,
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
      max_tokens: 200,
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