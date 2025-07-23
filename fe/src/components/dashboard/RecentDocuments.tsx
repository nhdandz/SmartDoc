// src/components/dashboard/RecentDocuments.tsx
'use client'
import { useState, useEffect } from 'react'
import { FileText, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Document {
  id: string
  name: string
  size: string
  uploadDate: Date
  type: string
}

export default function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    // Mock data
    setDocuments([
      {
        id: '1',
        name: 'Báo cáo tài chính Q4 2023.pdf',
        size: '2.4 MB',
        uploadDate: new Date('2024-01-15'),
        type: 'PDF'
      },
      {
        id: '2', 
        name: 'Hợp đồng lao động mẫu.docx',
        size: '156 KB',
        uploadDate: new Date('2024-01-14'),
        type: 'DOCX'
      },
      {
        id: '3',
        name: 'Quy trình vận hành.pdf',
        size: '1.8 MB', 
        uploadDate: new Date('2024-01-13'),
        type: 'PDF'
      },
    ])
  }, [])

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Tài liệu gần đây</h3>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center min-w-0">
              <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                <p className="text-xs text-gray-500">
                  {doc.size} • {format(doc.uploadDate, 'dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Xem tất cả tài liệu →
        </button>
      </div>
    </div>
  )
}