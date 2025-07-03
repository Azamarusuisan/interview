import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, casePrompt } = await req.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Evaluate this case interview performance in Japanese.
          Case: ${casePrompt}
          
          Provide:
          1. Detailed feedback on structure, creativity, and business thinking
          2. Score from 0-100 based on:
             - Problem structuring (40%)
             - Analytical thinking (30%)
             - Communication clarity (20%)
             - Creativity (10%)
          
          Return JSON: { feedback: string, score: number }`,
        },
        {
          role: 'user',
          content: `Transcript: ${transcript}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })
    
    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}