import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    // Deactivate calendar integration
    await prisma.calendarIntegration.updateMany({
      where: {
        userId: user.id,
        provider,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    })

    // Remove calendar sync from all jobs
    await prisma.job.updateMany({
      where: {
        userId: user.id,
        calendarSynced: true,
      },
      data: {
        calendarEventId: null,
        calendarSynced: false,
      },
    })

    return NextResponse.json({
      message: `${provider} calendar disconnected successfully`,
    })
  } catch (error) {
    console.error('Error disconnecting calendar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}