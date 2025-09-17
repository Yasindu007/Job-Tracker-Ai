import { NextResponse } from 'next/server'
import { auth } from '@/stack'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const user = await auth.getUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const extractedText: string | null = data.get('extractedText') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // In a real application, you'd want to upload this to a cloud storage provider
    // For this example, we'll save it to the local filesystem
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    const filePath = path.join(uploadsDir, `${Date.now()}_${file.name}`)
    
    // Ensure the uploads directory exists
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`) // A bit of a hack for local dev
    await require('fs').promises.mkdir(uploadsDir, { recursive: true });

    await writeFile(filePath, buffer)

    const newResume = await prisma.resume.create({
      data: {
        userId: user.id,
        originalFileName: file.name,
        filePath: `/uploads/${path.basename(filePath)}`,
        fileSize: file.size,
        extractedText: extractedText || '',
      },
    })

    return NextResponse.json(newResume)
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}