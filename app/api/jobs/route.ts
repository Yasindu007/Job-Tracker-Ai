import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'
import { JobStatus } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        dateApplied: 'desc',
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      company,
      status,
      dateApplied,
      notes,
      jobUrl,
      location,
      salary,
      expectedInterviewDate,
      expectedInterviewTime,
    } = body

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Title and company are required' },
        { status: 400 }
      )
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        company,
        status: status || JobStatus.APPLIED,
        dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
        notes,
        jobUrl,
        location,
        salary,
        expectedInterviewDate: expectedInterviewDate ? new Date(expectedInterviewDate) : null,
        expectedInterviewTime: expectedInterviewTime || null,
        // Atomically ensure user exists to satisfy FK
        user: {
          connectOrCreate: {
            where: { id: user.id },
            create: {
              id: user.id,
              email: `${user.id}@placeholder.local`,
            },
          },
        },
      },
    })

    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}