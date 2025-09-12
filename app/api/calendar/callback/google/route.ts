import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createGoogleCalendarService } from '@/lib/calendar-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?calendar_error=${error}`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?calendar_error=no_code`)
    }

    if (state !== session.user.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?calendar_error=invalid_state`)
    }

    const calendarService = createGoogleCalendarService()
    const tokens = await calendarService.exchangeCodeForTokens(code)

    // Save calendar integration to database
    await prisma.calendarIntegration.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: 'google',
        },
      },
      update: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        provider: 'google',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        isActive: true,
      },
    })

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?calendar_connected=google`)
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?calendar_error=callback_failed`)
  }
}
