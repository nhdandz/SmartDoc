// src/app/dashboard/documents/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  FolderPlus,
  FileText,
  Download,
  Eye,
  Trash2,
  Edit3,
  Share2
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadDate: Date
  author: string
  folder: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('Tất cả')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      // Mock upload
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 'DOCX',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date(),
        author: 'Người dùng hiện tại',
        folder: selectedFolder === 'Tất cả' ? 'Tài liệu chung' : selectedFolder
      }
      setDocuments(prev => [newDoc, ...prev])
      toast.success(`Tải lên ${file.name} thành công!`)
    })
    setShowUploadModal(false)
  }, [selectedFolder])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png']
    }
  })

  useEffect(() => {
    // Mock data
    setDocuments([
      {
        id: '1',
        name: 'Báo cáo tài chính Q4 2023.pdf',
        type: 'PDF',
        size: '2.4 MB',
        uploadDate: new Date('2024-01-15'),
        author: 'Nguyễn Văn A',
        folder: 'Tài chính'
      },
      {
        id: '2',
        name: 'Hợp đồng lao động mẫu.docx',
        type: 'DOCX',
        size: '156 KB',
        uploadDate: new Date('2024-01-14'),
        author: 'Trần Thị B',
        folder: 'Nhân sự'
      },
      {
        id: '3',
        name: 'Quy trình vận hành.pdf',
        type: 'PDF',
        size: '1.8 MB',
        uploadDate: new Date('2024-01-13'),
        author: 'Lê Văn C',
        folder: 'Vận hành'
      }
    ])
  }, [])

  const folders = ['Tất cả', 'Tài chính', 'Nhân sự', 'Vận hành', 'Marketing']

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'Tất cả' || doc.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý văn bản</h1>
          <p className="text-gray-600">Lưu trữ và quản lý tài liệu</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowUploadModal(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Tạo thư mục
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Tải lên
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
            <button className="btn btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{doc.name}</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <p>{doc.size} • {doc.type}</p>
              <p>Tác giả: {doc.author}</p>
              <p>Thư mục: {doc.folder}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-blue-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-purple-600">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-yellow-600">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tải lên tài liệu</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary-600">Thả tài liệu vào đây...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Kéo thả tài liệu hoặc click để chọn</p>
                  <p className="text-sm text-gray-500">Hỗ trợ PDF, DOC, DOCX, JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}