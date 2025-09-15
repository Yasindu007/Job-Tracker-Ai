import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getUser()
    
    if (!user?.id) {
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
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { skills: true, expectedJobRole: true },
    })

    // Analyze job posting with AI
    const aiService = createAIService()
    const prepResults = await aiService.analyzeJobPosting(
      jobPostingText,
      userProfile?.skills || [],
      userProfile?.expectedJobRole || undefined
    )

    // Save analysis to database for future reference
    await prisma.jobPostingAnalysis.create({
      data: {
        jobPostingText,
        analysisResults: JSON.stringify(prepResults),
        resumeSuggestions: JSON.stringify(prepResults.resumeSuggestions),
        interviewQuestions: JSON.stringify(prepResults.interviewQuestions),
        skillGaps: JSON.stringify(prepResults.skillGaps),
        userId: user.id,
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