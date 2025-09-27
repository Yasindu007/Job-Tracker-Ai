import { NextResponse } from 'next/server'
import { auth } from '@/stack' // Changed from @clerk/nextjs/server to match your upload route
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'
import { ResumeAnalysis } from '@/types'


export async function POST(request: Request) {
  try {
    const user = await auth.getUser() // Changed to match your auth pattern
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // This block is for local testing and will not run in production
    if (process.env.NODE_ENV === 'development') {
      // The following line is for testing purposes only and should not be used in production.
      fs.readFileSync('./test/data/05-versions-space.pdf')
    }

    const body = await request.json()
    const { resumeId, resumeText } = body

    if (!resumeId || !resumeText) {
      return NextResponse.json({ error: 'Resume ID and text are required' }, { status: 400 })
    }

    // Verify the resume belongs to the user
    const existingResume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    })

    if (!existingResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const aiService = createAIService()
    const analysisResult: ResumeAnalysis = await aiService.analyzeResume(resumeText)

    // Update the resume in the database
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId, userId: user.id },
      data: {
        atsScore: analysisResult.atsScore,
        enhancementSuggestions: JSON.stringify(analysisResult),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('[RESUME_ANALYZE_ERROR]', error)
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}