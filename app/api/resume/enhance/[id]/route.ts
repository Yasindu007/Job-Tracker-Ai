import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'
import { readFile } from 'fs/promises'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!resume || !resume.extractedText) {
      return NextResponse.json(
        { error: 'Resume not found or no text available' },
        { status: 404 }
      )
    }

    // Get user's target job role for enhancement
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { expectedJobRole: true },
    })

    // Generate enhanced resume
    const aiService = createAIService()
    const enhancedText = await aiService.generateResumeEnhancement(
      resume.extractedText,
      user?.expectedJobRole || 'Software Engineer' // Default fallback
    )

    // Return enhanced resume as text file
    const response = new NextResponse(enhancedText, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="enhanced_${resume.originalFileName}.txt"`,
      },
    })

    return response
  } catch (error) {
    console.error('Error enhancing resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
