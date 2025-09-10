import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'

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
        id: resumeId,
        userId: session.user.id, // Ensure user owns the resume
      },
      data: {
        atsScore: analysis.atsScore,
        enhancementSuggestions: JSON.stringify(analysis),
      },
    })

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
