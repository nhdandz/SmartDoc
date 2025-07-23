// src/app/dashboard/reports/page.tsx
'use client'
import { useState } from 'react'
import { 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Calendar,
  BarChart3,
  Users,
  Building,
  Loader,
  Eye,
  Edit3,
  Copy,
  Share2,
  Filter,
  X,
  Settings,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Report {
  id: string
  title: string
  description: string
  createdBy: string
  createdDate: Date
  status: 'completed' | 'generating' | 'failed'
  type: string
  downloadUrl?: string
  progress?: number
  wordCount?: number
  pageCount?: number
  sources?: string[]
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: string
  estimatedTime: string
  fields: string[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Báo cáo tổng hợp nhân sự Q1 2024',
      description: 'Tổng hợp thông tin tuyển dụng, đào tạo và phát triển nhân lực trong quý 1',
      createdBy: 'Phòng Nhân sự',
      createdDate: new Date('2024-01-20'),
      status: 'completed',
      type: 'HR',
      downloadUrl: '/reports/hr-q1-2024.pdf',
      wordCount: 2450,
      pageCount: 12,
      sources: ['Hợp đồng lao động', 'Báo cáo tuyển dụng', 'Kế hoạch đào tạo']
    },
    {
      id: '2',
      title: 'Phân tích hiệu suất tài chính 2023',
      description: 'Đánh giá kết quả kinh doanh và đề xuất chiến lược phát triển',
      createdBy: 'Phòng Tài chính',
      createdDate: new Date('2024-01-15'),
      status: 'completed',
      type: 'Finance',
      downloadUrl: '/reports/finance-2023.pdf',
      wordCount: 3200,
      pageCount: 18,
      sources: ['Báo cáo tài chính', 'Bảng cân đối kế toán', 'Kế hoạch ngân sách']
    },
    {
      id: '3',
      title: 'Báo cáo marketing tháng 1',
      description: 'Kết quả các chiến dịch marketing và đề xuất tối ưu hóa',
      createdBy: 'Nguyễn Văn A',
      createdDate: new Date('2024-01-10'),
      status: 'generating',
      type: 'Marketing',
      progress: 65
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'general',
    template: 'standard',
    sources: [] as string[],
    includeCharts: false,
    includeAnalysis: true,
    language: 'vi'
  })

  const [templates] = useState<ReportTemplate[]>([
    {
      id: 'standard',
      name: 'Báo cáo chuẩn',
      description: 'Định dạng báo cáo truyền thống với mục lục, nội dung chính và kết luận',
      category: 'Tổng hợp',
      estimatedTime: '5-10 phút',
      fields: ['Tóm tắt điều hành', 'Nội dung chính', 'Phân tích', 'Kết luận', 'Khuyến nghị']
    },
    {
      id: 'detailed',
      name: 'Báo cáo chi tiết',
      description: 'Báo cáo toàn diện với phân tích sâu và nhiều biểu đồ',
      category: 'Phân tích',
      estimatedTime: '10-15 phút',
      fields: ['Tóm tắt', 'Phương pháp', 'Dữ liệu', 'Phân tích', 'Biểu đồ', 'Kết luận']
    },
    {
      id: 'summary',
      name: 'Báo cáo tóm tắt',
      description: 'Báo cáo ngắn gọn, tập trung vào các điểm chính',
      category: 'Tóm tắt',
      estimatedTime: '3-5 phút',
      fields: ['Điểm chính', 'Số liệu quan trọng', 'Khuyến nghị']
    },
    {
      id: 'executive',
      name: 'Báo cáo điều hành',
      description: 'Báo cáo dành cho ban lãnh đạo, ngắn gọn và có tính quyết định cao',
      category: 'Điều hành',
      estimatedTime: '5-8 phút',
      fields: ['Tóm tắt điều hành', 'Các chỉ số KPI', 'Vấn đề cần quyết định', 'Khuyến nghị']
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReports, setSelectedReports] = useState<string[]>([])

  const reportTypes = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'HR', label: 'Nhân sự' },
    { value: 'Finance', label: 'Tài chính' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Operations', label: 'Vận hành' },
    { value: 'IT', label: 'Công nghệ' }
  ]

  const handleCreateReport = () => {
    if (!newReport.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề báo cáo')
      return
    }

    const report: Report = {
      id: Date.now().toString(),
      title: newReport.title,
      description: newReport.description,
      createdBy: 'Người dùng hiện tại',
      createdDate: new Date(),
      status: 'generating',
      type: newReport.type,
      progress: 0
    }
    
    setReports(prev => [report, ...prev])
    setNewReport({ 
      title: '', 
      description: '', 
      type: 'general', 
      template: 'standard', 
      sources: [],
      includeCharts: false,
      includeAnalysis: true,
      language: 'vi'
    })
    setShowCreateModal(false)
    toast.success('Đang tạo báo cáo...')

    // Simulate report generation with progress
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15 + 5 // 5-20% each step
      if (progress >= 100) {
        progress = 100
        clearInterval(progressInterval)
        
        // Complete the report
        setTimeout(() => {
          setReports(prev => prev.map(r => 
            r.id === report.id 
              ? { 
                  ...r, 
                  status: 'completed' as const, 
                  downloadUrl: `/reports/${report.id}.pdf`,
                  wordCount: 1500 + Math.floor(Math.random() * 2000),
                  pageCount: 8 + Math.floor(Math.random() * 15),
                  sources: ['Tài liệu 1', 'Tài liệu 2', 'Tài liệu 3'],
                  progress: undefined
                }
              : r
          ))
          toast.success('Báo cáo đã được tạo thành công!')
        }, 1000)
      } else {
        setReports(prev => prev.map(r => 
          r.id === report.id ? { ...r, progress } : r
        ))
      }
    }, 1000)
  }

  const handleDownloadReport = (report: Report) => {
    if (report.status !== 'completed') {
      toast.error('Báo cáo chưa hoàn thành')
      return
    }
    toast.success(`Đang tải xuống "${report.title}"...`)
  }

  const handleViewReport = (report: Report) => {
    if (report.status !== 'completed') {
      toast.error('Báo cáo chưa hoàn thành')
      return
    }
    toast(`Đang mở "${report.title}"...`)
  }

  const handleEditReport = (report: Report) => {
    if (report.status !== 'completed') {
      toast.error('Chỉ có thể chỉnh sửa báo cáo đã hoàn thành')
      return
    }
    toast('Tính năng chỉnh sửa sẽ sớm có!')
  }

  const handleCopyReport = (report: Report) => {
    setNewReport({
      title: `Bản sao - ${report.title}`,
      description: report.description,
      type: report.type,
      template: 'standard',
      sources: [],
      includeCharts: false,
      includeAnalysis: true,
      language: 'vi'
    })
    setShowCreateModal(true)
    toast('Đã sao chép cấu hình báo cáo')
  }

  const handleShareReport = (report: Report) => {
    if (report.status !== 'completed') {
      toast.error('Chỉ có thể chia sẻ báo cáo đã hoàn thành')
      return
    }
    navigator.clipboard.writeText(`${report.title} - ${window.location.origin}/reports/${report.id}`)
    toast.success('Đã sao chép liên kết chia sẻ!')
  }

  const handleDeleteReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId)
    if (report && confirm(`Bạn có chắc muốn xóa báo cáo "${report.title}"?`)) {
      setReports(prev => prev.filter(r => r.id !== reportId))
      toast.success('Đã xóa báo cáo!')
    }
  }

  const handleBulkAction = (action: 'download' | 'delete') => {
    if (selectedReports.length === 0) {
      toast.error('Vui lòng chọn ít nhất một báo cáo')
      return
    }

    switch (action) {
      case 'download':
        const completedReports = reports.filter(r => 
          selectedReports.includes(r.id) && r.status === 'completed'
        )
        if (completedReports.length === 0) {
          toast.error('Không có báo cáo hoàn thành nào được chọn')
          return
        }
        toast.success(`Đang tải xuống ${completedReports.length} báo cáo...`)
        break
      case 'delete':
        setReports(prev => prev.filter(r => !selectedReports.includes(r.id)))
        toast.success(`Đã xóa ${selectedReports.length} báo cáo`)
        break
    }
    setSelectedReports([])
  }

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    generating: reports.filter(r => r.status === 'generating').length,
    failed: reports.filter(r => r.status === 'failed').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="text-gray-600">Tạo và quản lý các báo cáo từ hệ thống tài liệu</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo báo cáo mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Loader className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang tạo</p>
              <p className="text-2xl font-bold text-gray-900">{stats.generating}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tuần này</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return r.createdDate > weekAgo
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm báo cáo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Hoàn thành</option>
              <option value="generating">Đang tạo</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedReports.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              Đã chọn {selectedReports.length} báo cáo
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkAction('download')}
                className="btn btn-secondary btn-sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Tải xuống
              </button>
              <button 
                onClick={() => handleBulkAction('delete')}
                className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Xóa
              </button>
            </div>
            <button 
              onClick={() => setSelectedReports([])}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedReports.includes(report.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedReports(prev => [...prev, report.id])
                    } else {
                      setSelectedReports(prev => prev.filter(id => id !== report.id))
                    }
                  }}
                  className="mt-1 rounded border-gray-300"
                />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status === 'completed' ? 'Hoàn thành' :
                       report.status === 'generating' ? 'Đang tạo' : 'Thất bại'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      {report.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{report.description}</p>
                  
                  {/* Progress bar for generating reports */}
                  {report.status === 'generating' && report.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Tiến độ tạo báo cáo</span>
                        <span className="text-gray-600">{Math.round(report.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${report.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {report.createdBy}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {report.createdDate.toLocaleDateString('vi-VN')}
                    </div>
                    {report.wordCount && (
                      <div>{report.wordCount.toLocaleString()} từ</div>
                    )}
                    {report.pageCount && (
                      <div>{report.pageCount} trang</div>
                    )}
                    {report.sources && (
                      <div>{report.sources.length} nguồn</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {report.status === 'generating' && (
                  <div className="flex items-center text-yellow-600">
                    <Loader className="h-4 w-4 animate-spin mr-1" />
                    <span className="text-sm">Đang tạo...</span>
                  </div>
                )}
                {report.status === 'completed' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewReport(report)}
                      className="btn btn-secondary btn-sm"
                      title="Xem báo cáo"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDownloadReport(report)}
                      className="btn btn-secondary btn-sm"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditReport(report)}
                      className="btn btn-secondary btn-sm"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleShareReport(report)}
                      className="btn btn-secondary btn-sm"
                      title="Chia sẻ"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleCopyReport(report)}
                      className="btn btn-secondary btn-sm"
                      title="Sao chép"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => handleDeleteReport(report.id)}
                  className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
                  title="Xóa"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
              ? 'Không tìm thấy báo cáo' 
              : 'Chưa có báo cáo nào'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Tạo báo cáo đầu tiên từ hệ thống tài liệu'
            }
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tạo báo cáo đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Tạo báo cáo mới</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề báo cáo *
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề báo cáo..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mô tả nội dung và mục đích của báo cáo..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại báo cáo
                    </label>
                    <select
                      value={newReport.type}
                      onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">Tổng hợp</option>
                      <option value="HR">Nhân sự</option>
                      <option value="Finance">Tài chính</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operations">Vận hành</option>
                      <option value="IT">Công nghệ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngôn ngữ
                    </label>
                    <select
                      value={newReport.language}
                      onChange={(e) => setNewReport({...newReport, language: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn mẫu báo cáo
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        newReport.template === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setNewReport({...newReport, template: template.id})}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tùy chọn nâng cao
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReport.includeAnalysis}
                      onChange={(e) => setNewReport({...newReport, includeAnalysis: e.target.checked})}
                      className="rounded border-gray-300 mr-3"
                    />
                    <span className="text-sm text-gray-700">Bao gồm phân tích chi tiết</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newReport.includeCharts}
                      onChange={(e) => setNewReport({...newReport, includeCharts: e.target.checked})}
                      className="rounded border-gray-300 mr-3"
                    />
                    <span className="text-sm text-gray-700">Tạo biểu đồ và hình ảnh minh họa</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateReport}
                disabled={!newReport.title.trim()}
                className="btn btn-primary disabled:opacity-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}