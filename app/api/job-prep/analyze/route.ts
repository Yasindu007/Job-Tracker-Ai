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
    // Note: User might not exist in database yet if they just signed up
    let userProfile = null
    try {
      userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { skills: true, expectedJobRole: true },
      })
    } catch (dbError) {
      console.warn('Could not fetch user profile, proceeding with empty profile:', dbError)
      // Continue with empty profile - AI can still analyze without user context
    }

    // Analyze job posting with AI
    const aiService = createAIService()
    const prepResults = await aiService.analyzeJobPosting(
      jobPostingText,
      userProfile?.skills || [],
      userProfile?.expectedJobRole || undefined
    )

    // Save analysis to database for future reference (optional - don't fail if this fails)
    try {
      await prisma.jobPostingAnalysis.create({
        data: {
          jobPostingText,
          analysisResults: JSON.stringify(prepResults),
          userId: user.id,
        },
      })
    } catch (dbError) {
      console.warn('Could not save analysis to database, but returning results:', dbError)
      // Continue - return results even if database save fails
    }

    return NextResponse.json(prepResults)
  } catch (error) {
    console.error('Error analyzing job posting:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
      const provider = (process.env.AI_PROVIDER || (process.env.AI_BASE_URL ? 'local' : 'gemini')).toLowerCase()
      
      // Check for common issues
      if (error.message.includes('GEMINI_API_KEY')) {
        errorMessage = provider === 'gemini' || provider === 'google'
          ? 'Gemini API key is missing. Please check your environment variables.'
          : 'AI provider key is missing. Please check your environment variables.'
      } else if (error.message.includes('Local AI API error')) {
        errorMessage = 'Local AI API error. Ensure your local model server is running and check AI_BASE_URL/AI_MODEL.'
      } else if (error.message.includes('Gemini API error')) {
        errorMessage = provider === 'gemini' || provider === 'google'
          ? error.message
          : 'AI provider API error. Please check AI_PROVIDER/AI_BASE_URL/AI_MODEL and try again.'
      } else if (error.message.includes('API error')) {
        errorMessage = 'AI provider API error. Please check your provider configuration and try again.'
      } else if (error.message.includes('prisma') || error.message.includes('database')) {
        errorMessage = 'Database error. Please check your database connection.'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
