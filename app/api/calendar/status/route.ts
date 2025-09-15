import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all calendar integrations for the user
    const integrations = await prisma.calendarIntegration.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: {
        provider: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    // Check which providers are connected
    const status = {
      google: integrations.some(i => i.provider === 'google'),
      apple: integrations.some(i => i.provider === 'apple'),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting calendar status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}