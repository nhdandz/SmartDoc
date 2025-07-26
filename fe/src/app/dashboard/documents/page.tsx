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
  Share2,
  X,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { apiService } from '@/lib/api'
import { Document as DocumentType, DocumentsResponse } from '@/types'
import { formatDateSafe, handleApiResponse } from '@/lib/apiUtils'

interface Folder {
  id: string
  name: string
  documentCount: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('Tất cả')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})

  // Load documents from API
  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getDocuments({
        page: 1,
        limit: 100,
        search: searchTerm || undefined
      })

      handleApiResponse(
        response,
        (data) => {
          console.log('Documents loaded:', data)
          const documentsData = data.documents || []
          setDocuments(documentsData)
          
          // Create folder list from documents with proper typing
          const folderCounts = documentsData.reduce((acc: Record<string, number>, doc: DocumentType) => {
            const folder = doc.folder || 'Tài liệu chung'
            acc[folder] = (acc[folder] || 0) + 1
            return acc
          }, {})

          const dynamicFolders = Object.entries(folderCounts).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            documentCount: count
          }))

          setFolders([
            { id: 'all', name: 'Tất cả', documentCount: documentsData.length },
            ...dynamicFolders
          ])
        },
        (error) => {
          console.error('Failed to load documents:', error)
          toast.error(error || 'Không thể tải danh sách tài liệu')
        }
      )
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Lỗi khi tải danh sách tài liệu')
    } finally {
      setIsLoading(false)
    }
  }

  // Search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        loadDocuments()
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    setIsUploading(true)
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        console.log('Uploading file:', file.name)
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const response = await apiService.uploadDocument(file)
        
        if (response.success) {
          console.log('Upload successful:', response.data)
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
          toast.success(`Tải lên ${file.name} thành công!`)
          return response.data
        } else {
          console.error('Upload failed:', response.error)
          toast.error(`Lỗi tải lên ${file.name}: ${response.error}`)
          return null
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error(`Lỗi tải lên ${file.name}`)
        return null
      } finally {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[file.name]
          return newProgress
        })
      }
    })

    try {
      await Promise.all(uploadPromises)
      // Reload documents after upload
      await loadDocuments()
    } finally {
      setIsUploading(false)
      setShowUploadModal(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png'],
      'text/plain': ['.txt']
    },
    disabled: isUploading
  })

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Vui lòng nhập tên thư mục')
      return
    }
    
    if (folders.some(f => f.name.toLowerCase() === newFolderName.toLowerCase())) {
      toast.error('Thư mục này đã tồn tại')
      return
    }

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      documentCount: 0
    }
    
    setFolders(prev => [...prev, newFolder])
    setNewFolderName('')
    setShowCreateFolderModal(false)
    toast.success(`Tạo thư mục "${newFolderName}" thành công!`)
  }

  // Document actions
  const handleViewDocument = (doc: DocumentType) => {
    toast(`Đang mở ${doc.name}...`)
    // TODO: Implement document viewer
  }

  const handleDownloadDocument = (doc: DocumentType) => {
    toast.success(`Đang tải xuống ${doc.name}...`)
    // TODO: Implement download
  }

  const handleDeleteDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    if (!confirm(`Bạn có chắc muốn xóa "${doc.name}"?`)) return

    try {
      const response = await apiService.deleteDocument(docId)
      
      if (response.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId))
        toast.success(`Đã xóa ${doc.name}`)
      } else {
        toast.error(response.error || 'Không thể xóa tài liệu')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Lỗi khi xóa tài liệu')
    }
  }

  const handleShareDocument = async (doc: DocumentType) => {
    // Mock share for now
    setDocuments(prev => prev.map(d => 
      d.id === doc.id ? { ...d, shared: !d.shared } : d
    ))
    toast.success(`${doc.shared ? 'Hủy chia sẻ' : 'Chia sẻ'} ${doc.name}`)
  }

  const handleBulkAction = async (action: 'delete' | 'move' | 'share') => {
    if (selectedDocuments.length === 0) {
      toast.error('Vui lòng chọn ít nhất một tài liệu')
      return
    }

    switch (action) {
      case 'delete':
        if (!confirm(`Bạn có chắc muốn xóa ${selectedDocuments.length} tài liệu?`)) return
        
        try {
          const deletePromises = selectedDocuments.map(id => apiService.deleteDocument(id))
          await Promise.all(deletePromises)
          
          setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)))
          toast.success(`Đã xóa ${selectedDocuments.length} tài liệu`)
        } catch (error) {
          toast.error('Lỗi khi xóa tài liệu')
        }
        break
      case 'share':
        setDocuments(prev => prev.map(doc => 
          selectedDocuments.includes(doc.id) ? { ...doc, shared: true } : doc
        ))
        toast.success(`Đã chia sẻ ${selectedDocuments.length} tài liệu`)
        break
      case 'move':
        toast('Tính năng di chuyển sẽ sớm có!')
        break
    }
    setSelectedDocuments([])
  }

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === 'Tất cả' || doc.folder === selectedFolder
    return matchesSearch && matchesFolder
  })

  const formatDate = (dateString: string | undefined) => {
    return formatDateSafe(dateString)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý văn bản</h1>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý văn bản</h1>
          <p className="text-gray-600">
            Lưu trữ và quản lý tài liệu ({documents.length} tài liệu)
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCreateFolderModal(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Tạo thư mục
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Tải lên
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Đang tải lên</h3>
          <div className="space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span className="truncate">{filename}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Folders */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thư mục</h3>
        <div className="flex flex-wrap gap-2">
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFolder === folder.name
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {folder.name} ({folder.documentCount})
            </button>
          ))}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn btn-secondary"
            >
              <Filter className="h-4 w-4 mr-2" />
              {viewMode === 'grid' ? 'Dạng danh sách' : 'Dạng lưới'}
            </button>
            <button 
              onClick={loadDocuments}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Làm mới'
              )}
            </button>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedDocuments.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
            <span className="text-sm text-blue-700">
              Đã chọn {selectedDocuments.length} tài liệu
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkAction('share')}
                className="btn btn-secondary btn-sm"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Chia sẻ
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Xóa
              </button>
            </div>
            <button 
              onClick={() => setSelectedDocuments([])}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className={`card hover:shadow-md transition-shadow ${
              viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center gap-4'
            }`}>
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDocuments(prev => [...prev, doc.id])
                          } else {
                            setSelectedDocuments(prev => prev.filter(id => id !== doc.id))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="flex">
                      {doc.shared && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-1" title="Đã chia sẻ" />
                      )}
                      {doc.is_processed && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1" title="Đã xử lý" />
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{doc.name}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{doc.size} • {doc.type}</p>
                    <p>Thư mục: {doc.folder || 'Tài liệu chung'}</p>
                    <p>Ngày: {formatDate(doc.upload_date)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Xem"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Tải xuống"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleShareDocument(doc)}
                        className={`p-1 hover:text-purple-600 ${
                          doc.shared ? 'text-purple-600' : 'text-gray-400'
                        }`}
                        title="Chia sẻ"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => toast('Tính năng chỉnh sửa sẽ sớm có!')}
                        className="p-1 text-gray-400 hover:text-yellow-600"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(prev => [...prev, doc.id])
                      } else {
                        setSelectedDocuments(prev => prev.filter(id => id !== doc.id))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                      {doc.shared && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Đã chia sẻ" />
                      )}
                      {doc.is_processed && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Đã xử lý" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{doc.size}</span>
                      <span>{doc.type}</span>
                      <span>{doc.folder || 'Tài liệu chung'}</span>
                      <span>{formatDate(doc.upload_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="Xem"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleShareDocument(doc)}
                      className={`p-2 hover:text-purple-600 ${
                        doc.shared ? 'text-purple-600' : 'text-gray-400'
                      }`}
                      title="Chia sẻ"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Thử tìm kiếm với từ khóa khác' 
              : 'Tải lên tài liệu đầu tiên của bạn'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Tải lên tài liệu
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tải lên tài liệu</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 
                isUploading ? 'border-gray-200 bg-gray-50' :
                'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
              ) : (
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              )}
              {isDragActive ? (
                <p className="text-blue-600">Thả tài liệu vào đây...</p>
              ) : isUploading ? (
                <p className="text-gray-600">Đang tải lên...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">Kéo thả tài liệu hoặc click để chọn</p>
                  <p className="text-sm text-gray-500">Hỗ trợ PDF, DOC, DOCX, TXT, JPG, PNG</p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="btn btn-secondary"
                disabled={isUploading}
              >
                {isUploading ? 'Đang tải lên...' : 'Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Tạo thư mục mới</h3>
              <button 
                onClick={() => setShowCreateFolderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên thư mục
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Nhập tên thư mục..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowCreateFolderModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo thư mục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}