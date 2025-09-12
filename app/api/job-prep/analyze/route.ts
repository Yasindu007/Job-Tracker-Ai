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

    const { jobPostingText } = await request.json()

    if (!jobPostingText) {
      return NextResponse.json(
        { error: 'Job posting text is required' },
        { status: 400 }
      )
    }

    // Get user's skills and job role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { skills: true, expectedJobRole: true },
    })

    // Analyze job posting with AI
    const aiService = createAIService()
    const prepResults = await aiService.analyzeJobPosting(
      jobPostingText,
      user?.skills || [],
      user?.expectedJobRole || undefined
    )

    // Save analysis to database for future reference
    await prisma.jobPostingAnalysis.create({
      data: {
        jobPostingText,
        analysisResults: JSON.stringify(prepResults),
        resumeSuggestions: JSON.stringify(prepResults.resumeSuggestions),
        interviewQuestions: JSON.stringify(prepResults.interviewQuestions),
        skillGaps: JSON.stringify(prepResults.skillGaps),
        userId: session.user.id,
      },
    })

    return NextResponse.json(prepResults)
  } catch (error) {
    console.error('Error analyzing job posting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
