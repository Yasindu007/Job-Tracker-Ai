import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createGoogleCalendarService } from '@/lib/calendar-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendarService = createGoogleCalendarService()
    const authUrl = calendarService.getAuthUrl(session.user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Google Calendar auth URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
