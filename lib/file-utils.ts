import { sanitizeFileName, formatFileSize } from '@/lib/utils'

export interface FileUploadResult {
  success: boolean
}

export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File): boolean {
  const maxSize = 10485760 // 10MB
  return file.size <= maxSize
}

export function getFileTypeIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    default:
      return '📁'
  }
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const sanitizedName = sanitizeFileName(originalName)
  const extension = sanitizedName.split('.').pop()
  const nameWithoutExt = sanitizedName.replace(/\.[^/.]+$/, '')
  
  return `${nameWithoutExt}_${timestamp}.${extension}`
}
