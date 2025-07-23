// src/app/dashboard/ocr/page.tsx
'use client'
import { useState, useCallback } from 'react'
import { Upload, FileImage, Download, Eye, Loader } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface OCRResult {
  id: string
  originalFile: string
  extractedText: string
  confidence: number
  processDate: Date
  status: 'processing' | 'completed' | 'failed'
}

export default function OCRPage() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      setIsProcessing(true)
      
      const newOCR: OCRResult = {
        id: Date.now().toString(),
        originalFile: file.name,
        extractedText: '',
        confidence: 0,
        processDate: new Date(),
        status: 'processing'
      }
      
      setOcrResults(prev => [newOCR, ...prev])

      // Mock OCR processing
      setTimeout(() => {
        setOcrResults(prev => prev.map(item => 
          item.id === newOCR.id 
            ? {
                ...item,
                status: 'completed',
                confidence: 95.5,
                extractedText: `Đây là văn bản đã được trích xuất từ file ${file.name}.

Nội dung mẫu:
- Tiêu đề: Báo cáo kết quả kinh doanh
- Ngày: 15/01/2024
- Người lập: Nguyễn Văn A

Các số liệu chính:
• Doanh thu: 2.5 tỷ VNĐ
• Chi phí: 1.8 tỷ VNĐ  
• Lợi nhuận: 700 triệu VNĐ

Kết luận:
Kết quả kinh doanh trong kỳ đạt được những thành tựu đáng kể, vượt 15% so với kỳ trước.`
              }
            : item
        ))
        setIsProcessing(false)
        toast.success(`OCR hoàn thành cho ${file.name}`)
      }, 3000)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf']
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Số hóa văn bản</h1>
        <p className="text-gray-600">Chuyển đổi hình ảnh và PDF scan thành văn bản</p>
      </div>

      {/* Upload Zone */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tải lên file cần số hóa</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-primary-600 text-lg">Thả file vào đây...</p>
          ) : (
            <div>
              <p className="text-gray-600 text-lg mb-2">Kéo thả file hoặc click để chọn</p>
              <p className="text-sm text-gray-500">Hỗ trợ JPG, PNG, PDF (scan)</p>
            </div>
          )}
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="card p-4">
          <div className="flex items-center">
            <Loader className="h-5 w-5 text-primary-600 animate-spin mr-3" />
            <span className="text-gray-700">Đang xử lý OCR...</span>
          </div>
        </div>
      )}

      {/* OCR Results */}
      <div className="space-y-4">
        {ocrResults.map((result) => (
          <div key={result.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">{result.originalFile}</h3>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>Ngày xử lý: {result.processDate.toLocaleDateString('vi-VN')}</span>
                  {result.status === 'completed' && (
                    <span>Độ tin cậy: {result.confidence}%</span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
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
                <div className="flex space-x-2">
                  <button className="btn btn-secondary btn-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Xem
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống
                  </button>
                </div>
              )}
            </div>

            {result.status === 'processing' && (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-gray-600">Đang trích xuất văn bản...</span>
              </div>
            )}

            {result.status === 'completed' && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Văn bản đã trích xuất:</h4>
                <div className="bg-white rounded border p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {result.extractedText}
                  </pre>
                </div>
                <div className="flex justify-end mt-3">
                  <button className="text-sm text-primary-600 hover:text-primary-700">
                    Chỉnh sửa văn bản →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {ocrResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileImage className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Chưa có file nào được xử lý OCR</p>
        </div>
      )}
    </div>
  )
}