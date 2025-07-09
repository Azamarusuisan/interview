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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params

    const entrySheet = await prisma.entrySheet.findUnique({
      where: { id, userId },
    })

    if (!entrySheet) {
      return NextResponse.json({ error: 'Entry sheet not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...entrySheet,
      answers: JSON.parse(entrySheet.answers)
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.entrySheet.findUnique({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Entry sheet not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.answers !== undefined) updateData.answers = JSON.stringify(body.answers)

    const updated = await prisma.entrySheet.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      ...updated,
      answers: JSON.parse(updated.answers)
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId()
    const { id } = await params

    const existing = await prisma.entrySheet.findUnique({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Entry sheet not found' }, { status: 404 })
    }

    await prisma.entrySheet.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Entry sheet deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}