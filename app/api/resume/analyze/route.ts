import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resumeId, resumeText } = await request.json()

    if (!resumeId || !resumeText) {
      return NextResponse.json(
        { error: 'Resume ID and text are required' },
        { status: 400 }
      )
    }

    // First, find the resume and verify ownership
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: 'Resume not found or permission denied' }, { status: 404 });
    }

    // Get user profile for job role context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { expectedJobRole: true },
    })

    // Analyze resume with AI
    const aiService = createAIService()
    const analysis = await aiService.analyzeResume(resumeText, user?.expectedJobRole || undefined)

    // Update resume with analysis results
    const updatedResume = await prisma.resume.update({
      where: {
        id: resumeId, // Prisma v4 requires a single unique identifier for updates
      },

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
