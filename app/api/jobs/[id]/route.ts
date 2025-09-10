import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { JobStatus } from '@/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if job belongs to user
    const existingJob = await prisma.job.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const job = await prisma.job.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        company,
        status,
        notes,
        jobUrl,
        location,
        salary,
        expectedInterviewDate: expectedInterviewDate ? new Date(expectedInterviewDate) : null,
        expectedInterviewTime,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if job belongs to user
    const existingJob = await prisma.job.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    await prisma.job.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
