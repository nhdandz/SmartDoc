// src/types/index.ts
export interface User {
  id?: string
  name: string
  email: string
  role: 'admin' | 'user' | 'manager'
  avatar?: string
  department?: string
  phone?: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: Date
  author: string
  folder: string
  url?: string
  shared?: boolean
  permissions?: Array<{
    userId: string
    permission: 'read' | 'write' | 'admin'
  }>
}

export interface OCRResult {
  id: string
  originalFile: string
  extractedText: string
  confidence: number
  processDate: Date
  status: 'processing' | 'completed' | 'failed'
}

export interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  department: string
  date: Date
  type: string
  highlights: string[]
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    title: string
    page?: number
    excerpt: string
  }>
  rating?: 'up' | 'down' | null
}

export interface Report {
  id: string
  title: string
  description: string
  createdBy: string
  createdDate: Date
  status: 'completed' | 'generating' | 'failed'
  type: string
  downloadUrl?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
