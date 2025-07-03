import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, duration, industry } = await req.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Evaluate this personal interview performance for the ${industry || 'general'} industry in Japanese.
          Duration: ${duration} seconds
          
          Provide:
          1. Detailed feedback on communication skills, self-awareness, and overall presentation
          2. Score from 0-100 based on:
             - Communication clarity and structure (30%)
             - Self-awareness and reflection ability (25%)
             - Motivation and enthusiasm (20%)
             - Professional presence and confidence (15%)
             - Learning mindset and growth potential (10%)
          
          ${industry ? `Consider industry-specific expectations and qualities valued in the ${industry} sector.` : 'Focus on general personal qualities applicable to any industry.'}
          Provide constructive feedback for improvement with specific suggestions.
          Return JSON: { feedback: string, score: number }`,
        },
        {
          role: 'user',
          content: `Interview Transcript: ${transcript}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })
    
    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return NextResponse.json({ ...result, duration })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    )
  }
}