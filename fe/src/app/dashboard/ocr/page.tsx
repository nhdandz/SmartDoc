// src/app/dashboard/ocr/page.tsx
'use client'
import { useState, useCallback } from 'react'
import { Upload, FileImage, Download, Eye, Loader, Edit3, Save, X, Copy, RefreshCw } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface OCRResult {
  id: string
  originalFile: string
  originalSize: string
  extractedText: string
  confidence: number
  processDate: Date
  status: 'processing' | 'completed' | 'failed'
  language: 'vi' | 'en' | 'auto'
  pageCount?: number
}

export default function OCRPage() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<'auto' | 'vi' | 'en'>('auto')
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      setIsProcessing(true)
      
      const newOCR: OCRResult = {
        id: Date.now().toString() + Math.random(),
        originalFile: file.name,
        originalSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        extractedText: '',
        confidence: 0,
        processDate: new Date(),
        status: 'processing',
        language: selectedLanguage,
        pageCount: file.type === 'application/pdf' ? Math.floor(Math.random() * 5) + 1 : 1
      }
      
      setOcrResults(prev => [newOCR, ...prev])
      toast.success(`Đang xử lý OCR cho ${file.name}...`)

      // Simulate OCR processing with realistic delay
      const processingTime = 3000 + Math.random() * 5000 // 3-8 seconds
      setTimeout(() => {
        const mockTexts = [
          `CÔNG TY CỔ PHẦN SMARTDOC
Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
Email: contact@smartdoc.vn | Tel: 028.1234.5678

BÁO CÁO KẾT QUẢ KINH DOANH
Quý IV năm 2023

I. TỔNG QUAN TÌNH HÌNH
Trong quý IV/2023, công ty đã đạt được những kết quả tích cực:
- Doanh thu: 2.5 tỷ VNĐ (tăng 15% so với cùng kỳ)
- Lợi nhuận trước thuế: 700 triệu VNĐ
- Số lượng khách hàng mới: 125 khách hàng

II. CÁC CHỈ SỐ CHÍNH
• Tỷ suất sinh lời: 28%
• Tốc độ tăng trưởng: 15%
• Mức độ hài lòng khách hàng: 92%

III. KẾT LUẬN
Kết quả kinh doanh quý IV/2023 cho thấy sự phát triển ổn định và bền vững của công ty.`,

          `HỢP ĐỒNG LAO ĐỘNG
Số: HD-2024-001

THÔNG TIN BÊN TUYỂN DỤNG:
Công ty: SmartDoc Corporation
Địa chỉ: 456 Nguyễn Văn Cừ, Q1, TP.HCM
Điện thoại: 028.9876.5432

THÔNG TIN NGƯỜI LAO ĐỘNG:
Họ và tên: [Tên nhân viên]
CMND/CCCD: [Số CMND]
Địa chỉ thường trú: [Địa chỉ]

ĐIỀU KHOẢN HỢP ĐỒNG:
1. Thời hạn hợp đồng: 12 tháng
2. Chức vụ: Nhân viên IT
3. Mức lương: 15.000.000 VNĐ/tháng
4. Thời gian làm việc: 8h/ngày, 5 ngày/tuần
5. Chế độ phúc lợi:
   - Bảo hiểm xã hội: 22%
   - Bảo hiểm y tế: 4.5%
   - Nghỉ phép năm: 12 ngày

Ngày ký: [Ngày/tháng/năm]`,

          `QUY TRÌNH VẬN HÀNH HỆ THỐNG

1. KHỞI ĐỘNG HỆ THỐNG
   - Kiểm tra kết nối mạng
   - Đăng nhập hệ thống quản trị
   - Xác thực bảo mật

2. VẬN HÀNH HÀNG NGÀY
   a) Sao lưu dữ liệu:
      • Thực hiện lúc 02:00 AM hàng ngày
      • Lưu trữ tại server backup
      • Kiểm tra tính toàn vẹn dữ liệu
   
   b) Giám sát hệ thống:
      • Theo dõi CPU, RAM, Disk
      • Kiểm tra log lỗi
      • Cảnh báo khi có bất thường

3. BẢO TRÌ ĐỊNH KỲ
   - Cập nhật phần mềm: Thứ 7 hàng tuần
   - Kiểm tra bảo mật: Tháng 1 lần
   - Làm sạch dữ liệu: Quý 1 lần

Liên hệ: admin@smartdoc.vn khi cần hỗ trợ.`
        ]

        const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
        const confidence = 85 + Math.random() * 15 // 85-100%

        setOcrResults(prev => prev.map(item => 
          item.id === newOCR.id 
            ? {
                ...item,
                status: 'completed' as const,
                confidence: parseFloat(confidence.toFixed(1)),
                extractedText: randomText
              }
            : item
        ))
        setIsProcessing(false)
        toast.success(`OCR hoàn thành cho ${file.name} với độ tin cậy ${confidence.toFixed(1)}%`)
      }, processingTime)
    })
  }, [selectedLanguage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  // Edit text functions
  const handleEditStart = (result: OCRResult) => {
    setEditingId(result.id)
    setEditedText(result.extractedText)
  }

  const handleEditSave = (id: string) => {
    setOcrResults(prev => prev.map(item => 
      item.id === id 
        ? { ...item, extractedText: editedText }
        : item
    ))
    setEditingId(null)
    setEditedText('')
    toast.success('Đã lưu thay đổi!')
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditedText('')
  }

  // Other actions
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Đã sao chép văn bản!')
    }).catch(() => {
      toast.error('Không thể sao chép văn bản')
    })
  }

  const handleDownload = (result: OCRResult) => {
    const element = document.createElement('a')
    const file = new Blob([result.extractedText], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = `${result.originalFile.split('.')[0]}_extracted.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Đã tải xuống văn bản!')
  }

  const handleReprocess = (result: OCRResult) => {
    setOcrResults(prev => prev.map(item => 
      item.id === result.id 
        ? { ...item, status: 'processing' as const, confidence: 0, extractedText: '' }
        : item
    ))
    
    toast('Đang xử lý lại...')
    
    // Simulate reprocessing
    setTimeout(() => {
      const newConfidence = 85 + Math.random() * 15
      setOcrResults(prev => prev.map(item => 
        item.id === result.id 
          ? { 
              ...item, 
              status: 'completed' as const,
              confidence: parseFloat(newConfidence.toFixed(1)),
              extractedText: result.extractedText // Keep same text for demo
            }
          : item
      ))
      toast.success(`Xử lý lại hoàn thành với độ tin cậy ${newConfidence.toFixed(1)}%`)
    }, 3000)
  }

  const handleDelete = (id: string) => {
    const result = ocrResults.find(r => r.id === id)
    if (result && confirm(`Bạn có chắc muốn xóa kết quả OCR cho "${result.originalFile}"?`)) {
      setOcrResults(prev => prev.filter(r => r.id !== id))
      toast.success('Đã xóa kết quả OCR!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Số hóa văn bản</h1>
          <p className="text-gray-600">
            Chuyển đổi hình ảnh và PDF scan thành văn bản ({ocrResults.length} kết quả)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as 'auto' | 'vi' | 'en')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">Tự động phát hiện</option>
            <option value="vi">Tiếng Việt</option>
            <option value="en">Tiếng Anh</option>
          </select>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tải lên file cần số hóa</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 text-lg">Thả file vào đây...</p>
          ) : (
            <div>
              <p className="text-gray-600 text-lg mb-2">Kéo thả file hoặc click để chọn</p>
              <p className="text-sm text-gray-500">
                Hỗ trợ JPG, PNG, PDF (scan). Tối đa 50MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="card p-4">
          <div className="flex items-center">
            <Loader className="h-5 w-5 text-blue-600 animate-spin mr-3" />
            <span className="text-gray-700">Đang xử lý OCR...</span>
          </div>
        </div>
      )}

      {/* Statistics */}
      {ocrResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{ocrResults.length}</div>
              <div className="text-sm text-gray-600">Tổng file</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ocrResults.filter(r => r.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {ocrResults.filter(r => r.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Đang xử lý</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {ocrResults.filter(r => r.status === 'completed').length > 0
                  ? (ocrResults
                      .filter(r => r.status === 'completed')
                      .reduce((sum, r) => sum + r.confidence, 0) / 
                     ocrResults.filter(r => r.status === 'completed').length
                    ).toFixed(1)
                  : '0'}%
              </div>
              <div className="text-sm text-gray-600">Độ tin cậy TB</div>
            </div>
          </div>
        </div>
      )}

      {/* OCR Results */}
      <div className="space-y-4">
        {ocrResults.map((result) => (
          <div key={result.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{result.originalFile}</h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>Kích thước: {result.originalSize}</span>
                  <span>Ngày xử lý: {result.processDate.toLocaleDateString('vi-VN')}</span>
                  {result.pageCount && <span>Số trang: {result.pageCount}</span>}
                  {result.status === 'completed' && (
                    <span className="text-green-600 font-medium">
                      Độ tin cậy: {result.confidence}%
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'completed' ? 'bg-green-100 text-green-800' :
                    result.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.status === 'completed' ? 'Hoàn thành' :
                     result.status === 'processing' ? 'Đang xử lý' : 'Thất bại'}
                  </span>
                </div>
              </div>
              
              {result.status === 'completed' && (
                <div className="flex space-x-2 ml-4">
                  <button 
                    onClick={() => handleCopyText(result.extractedText)}
                    className="btn btn-secondary btn-sm"
                    title="Sao chép văn bản"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setShowPreview(result.id)}
                    className="btn btn-secondary btn-sm"
                    title="Xem toàn màn hình"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDownload(result)}
                    className="btn btn-secondary btn-sm"
                    title="Tải xuống"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleReprocess(result)}
                    className="btn btn-secondary btn-sm"
                    title="Xử lý lại"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(result.id)}
                    className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
                    title="Xóa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {result.status === 'processing' && (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Đang trích xuất văn bản...</span>
              </div>
            )}

            {result.status === 'completed' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Văn bản đã trích xuất:</h4>
                  <div className="flex space-x-2">
                    {editingId === result.id ? (
                      <>
                        <button 
                          onClick={() => handleEditSave(result.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Lưu
                        </button>
                        <button 
                          onClick={handleEditCancel}
                          className="btn btn-secondary btn-sm"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEditStart(result)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit3 className="h-3 w-3 mr-1" />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                </div>
                
                {editingId === result.id ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                ) : (
                  <div className="bg-white rounded border p-4 max-h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                      {result.extractedText}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {result.status === 'failed' && (
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-red-600 mb-2">Xử lý OCR thất bại</p>
                <button 
                  onClick={() => handleReprocess(result)}
                  className="btn btn-primary btn-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Thử lại
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {ocrResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có file nào được xử lý OCR</h3>
          <p>Tải lên hình ảnh hoặc PDF để bắt đầu số hóa văn bản</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Xem văn bản - {ocrResults.find(r => r.id === showPreview)?.originalFile}
              </h3>
              <button 
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {ocrResults.find(r => r.id === showPreview)?.extractedText}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button 
                onClick={() => {
                  const result = ocrResults.find(r => r.id === showPreview)
                  if (result) handleCopyText(result.extractedText)
                }}
                className="btn btn-secondary"
              >
                <Copy className="h-4 w-4 mr-2" />
                Sao chép
              </button>
              <button 
                onClick={() => {
                  const result = ocrResults.find(r => r.id === showPreview)
                  if (result) handleDownload(result)
                }}
                className="btn btn-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}