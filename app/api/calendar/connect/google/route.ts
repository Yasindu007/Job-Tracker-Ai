import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { createGoogleCalendarService } from '@/lib/calendar-service'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendarService = createGoogleCalendarService()
    const authUrl = calendarService.getAuthUrl(user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Google Calendar auth URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}