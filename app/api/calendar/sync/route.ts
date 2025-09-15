import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createGoogleCalendarService } from '@/lib/calendar-service'
import { CalendarEvent } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, action } = await request.json()

    if (!jobId || !action) {
      return NextResponse.json(
        { error: 'Job ID and action are required' },
        { status: 400 }
      )
    }

    // Get job details
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        userId: session.user.id,
      },
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (!job.expectedInterviewDate || !job.expectedInterviewTime) {
      return NextResponse.json(
        { error: 'Interview date and time are required for calendar sync' },
        { status: 400 }
      )
    }

    // Get user's Google Calendar integration
    const calendarIntegration = await prisma.calendarIntegration.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google',
        isActive: true,
      },
    })

    if (!calendarIntegration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      )
    }

    const calendarService = createGoogleCalendarService()
    let accessToken = calendarIntegration.accessToken

    // Check if token needs refresh
    if (calendarIntegration.expiresAt && calendarIntegration.expiresAt < new Date()) {
      if (!calendarIntegration.refreshToken) {
        return NextResponse.json(
          { error: 'Calendar access token expired and no refresh token available' },
          { status: 400 }
        )
      }

      const newTokens = await calendarService.refreshAccessToken(calendarIntegration.refreshToken)
      accessToken = newTokens.accessToken

      // Update tokens in database
      await prisma.calendarIntegration.update({
        where: { id: calendarIntegration.id },
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken || calendarIntegration.refreshToken,
          expiresAt: newTokens.expiresAt,
        },
      })
    }

    // Create calendar event
    const startTime = new Date(job.expectedInterviewDate)
    const [hours, minutes] = job.expectedInterviewTime.split(':').map(Number)
    startTime.setHours(hours, minutes, 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(hours + 1, minutes, 0, 0) // 1 hour duration

    const calendarEvent: CalendarEvent = {
      title: `Interview: ${job.title} at ${job.company}`,
      description: `Job Interview\n\nCompany: ${job.company}\nPosition: ${job.title}\n${job.notes ? `Notes: ${job.notes}` : ''}\n\nJob URL: ${job.jobUrl || 'N/A'}`,
      startTime,
      endTime,
      location: job.location || undefined,
    }

    let eventId: string | undefined

    if (action === 'create') {
      eventId = await calendarService.createEvent(accessToken, calendarEvent)
      
      // Update job with calendar event ID
      await prisma.job.update({
        where: { id: jobId },
        data: {
          calendarEventId: eventId,
          calendarSynced: true,
        },
      })
    } else if (action === 'update' && job.calendarEventId) {
      await calendarService.updateEvent(accessToken, job.calendarEventId, calendarEvent)
    } else if (action === 'delete' && job.calendarEventId) {
      await calendarService.deleteEvent(accessToken, job.calendarEventId)
      
      // Update job to remove calendar sync
      await prisma.job.update({
        where: { id: jobId },
        data: {
          calendarEventId: null,
          calendarSynced: false,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing calendar event ID' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `Calendar event ${action}d successfully`,
      eventId: action === 'create' ? eventId : undefined,
    })
  } catch (error) {
    console.error('Error syncing with calendar:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
