import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const authenticated = cookieStore.get('authenticated')?.value === 'true'
  if (!authenticated) {
    throw new Error('Unauthorized')
  }
  return 'default-user'
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    
    const entrySheets = await prisma.entrySheet.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(entrySheets)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId()
    const body = await request.json()
    
    const { title, answers } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const entrySheet = await prisma.entrySheet.create({
      data: {
        userId,
        title,
        answers: JSON.stringify(answers || {}),
      }
    })

    return NextResponse.json(entrySheet, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}