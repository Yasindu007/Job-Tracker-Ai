import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'
import { createAIService } from '@/lib/ai-service'
import { jsPDF } from 'jspdf'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth.getUser()
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resume
    const resume = await prisma.resume.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!resume || !resume.extractedText) {
      return NextResponse.json(
        { error: 'Resume not found or no text available' },
        { status: 404 }
      )
    }

    // Get user's target job role for enhancement
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { expectedJobRole: true },
    })

    // Generate enhanced resume
    const aiService = createAIService()
    const enhancedText = await aiService.generateResumeEnhancement(
      resume.extractedText,
      userProfile?.expectedJobRole || 'Software Engineer' // Default fallback
    )

    // Create PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const maxWidth = pageWidth - (margin * 2)
    
    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(enhancedText, maxWidth)
    
    let y = margin
    const lineHeight = 7
    
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        pdf.addPage()
        y = margin
      }
      pdf.text(line, margin, y)
      y += lineHeight
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Return enhanced resume as PDF file
    const response = new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="enhanced_${resume.originalFileName.replace(/\.[^/.]+$/, '')}.pdf"`,
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