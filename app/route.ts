import { NextResponse } from 'next/server'
import { extractTextFromFile, FileUploadResult } from '@/lib/file-utils'
import { formatFileSize } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760') // 10MB
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']

    if (file.size > maxSize) {
      return NextResponse.json({ error: `File size exceeds limit of ${formatFileSize(maxSize)}` }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 })
    }

    const result: FileUploadResult = await extractTextFromFile(file)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ text: result.text })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Error processing file: ${errorMessage}` }, { status: 500 })
  }
}
