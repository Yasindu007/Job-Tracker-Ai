import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all calendar integrations for the user
    const integrations = await prisma.calendarIntegration.findMany({
      where: {
        userId: session.user.id,
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
