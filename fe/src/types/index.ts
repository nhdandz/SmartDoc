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
  original_name?: string
  type: string
  size: string
  upload_date: string // ISO string from backend
  uploadDate?: Date // For backwards compatibility
  author?: string
  folder?: string
  file_path?: string
  url?: string
  shared?: boolean
  is_processed?: boolean
  is_owner?: boolean
  doc_metadata?: Record<string, any>
  permissions?: Array<{
    userId: string
    permission: 'read' | 'write' | 'admin'
  }>
}

export interface OCRResult {
  id: string
  document_id?: string
  user_id?: string
  original_file: string
  originalFile?: string
  extracted_text: string
  extractedText?: string
  confidence: number
  process_date: string
  processDate?: Date
  status: 'processing' | 'completed' | 'failed'
  engine_used?: string
  language?: string
  ocr_metadata?: Record<string, any>
}

export interface SearchResult {
  id: string
  title: string
  content: string
  author: string
  department?: string
  date: Date
  type: string
  highlights: string[]
  score?: number
}

export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date | string
  sources?: Array<{
    title: string
    page?: number
    excerpt: string
    document_id?: string
  }>
  rating?: 'up' | 'down' | null
  session_id?: string
}

export interface Report {
  id: string
  title: string
  description?: string
  created_by?: string
  createdBy?: string
  created_date: string
  createdDate?: Date
  status: 'completed' | 'generating' | 'failed'
  type: string
  content?: string
  file_path?: string
  downloadUrl?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Dashboard specific types
export interface DashboardStats {
  total_documents: number
  total_ocr_processed: number
  total_questions: number
  total_reports: number
  recent_documents: Document[]
  recent_questions: ChatMessage[]
}

// Document pagination response
export interface DocumentsResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
  pages: number
}

// Search response
export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
  query: string
  took: number
}

// Chat session types
export interface ChatSession {
  id: string
  user_id?: string
  title: string
  created_at: string
  updated_at: string
  message_count?: number
}

// Utility type for converting backend dates
export type BackendDocument = Omit<Document, 'uploadDate'> & {
  upload_date: string
}

export type BackendOCRResult = Omit<OCRResult, 'processDate'> & {
  process_date: string
}