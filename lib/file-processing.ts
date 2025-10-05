import { sanitizeFileName, formatFileSize } from '@/lib/utils'

export interface FileUploadResult {
  text: string
}

export async function extractTextFromFile(file: File): Promise<FileUploadResult> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (file.type === 'application/pdf') {
    const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default
    const parsed = await pdf(buffer)
    return { text: parsed.text }
  }

  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value }
  }

  throw new Error('Unsupported file type')
}