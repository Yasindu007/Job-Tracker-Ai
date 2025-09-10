import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { JobStatus } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await prisma.job.findMany({
      where: {
        userId: session.user.id,
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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      company,
      status,
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

    const job = await prisma.job.create({
      data: {
        title,
        company,
        status: status || JobStatus.APPLIED,
        notes,
        jobUrl,
        location,
        salary,
        expectedInterviewDate: expectedInterviewDate ? new Date(expectedInterviewDate) : null,
        expectedInterviewTime,
        userId: session.user.id,
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
