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
  Eye
} from 'lucide-react'

interface Report {
  id: string
  title: string
  description: string
  createdBy: string
  createdDate: Date
  status: 'completed' | 'generating' | 'failed'
  type: string
  downloadUrl?: string
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
      downloadUrl: '/reports/hr-q1-2024.pdf'
    },
    {
      id: '2',
      title: 'Phân tích hiệu suất tài chính 2023',
      description: 'Đánh giá kết quả kinh doanh và đề xuất chiến lược phát triển',
      createdBy: 'Phòng Tài chính',
      createdDate: new Date('2024-01-15'),
      status: 'completed',
      type: 'Finance',
      downloadUrl: '/reports/finance-2023.pdf'
    },
    {
      id: '3',
      title: 'Báo cáo marketing tháng 1',
      description: 'Kết quả các chiến dịch marketing và đề xuất tối ưu hóa',
      createdBy: 'Nguyễn Văn A',
      createdDate: new Date('2024-01-10'),
      status: 'generating',
      type: 'Marketing'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'general',
    sources: [],
    template: 'standard'
  })

  const handleCreateReport = () => {
    const report: Report = {
      id: Date.now().toString(),
      title: newReport.title,
      description: newReport.description,
      createdBy: 'Người dùng hiện tại',
      createdDate: new Date(),
      status: 'generating',
      type: newReport.type
    }
    
    setReports(prev => [report, ...prev])
    setNewReport({ title: '', description: '', type: 'general', sources: [], template: 'standard' })
    setShowCreateModal(false)

    // Mock report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, status: 'completed' as const, downloadUrl: `/reports/${report.id}.pdf` }
          : r
      ))
    }, 5000)
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng báo cáo</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'completed').length}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'generating').length}
              </p>
            </div>
          </div>
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
                placeholder="Tìm kiếm báo cáo..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">Tất cả loại</option>
            <option value="hr">Nhân sự</option>
            <option value="finance">Tài chính</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Vận hành</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="card p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' :
                    report.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status === 'completed' ? 'Hoàn thành' :
                     report.status === 'generating' ? 'Đang tạo' : 'Thất bại'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{report.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {report.createdBy}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {report.createdDate.toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {report.type}
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
            </div>
          </div>
        ))}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo báo cáo mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề báo cáo
                </label>
                <input
                  type="text"
                  value={newReport.title}
                  onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mô tả nội dung và mục đích của báo cáo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại báo cáo
                </label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="general">Tổng hợp</option>
                  <option value="hr">Nhân sự</option>
                  <option value="finance">Tài chính</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Vận hành</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mẫu báo cáo
                </label>
                <select
                  value={newReport.template}
                  onChange={(e) => setNewReport({...newReport, template: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="standard">Chuẩn</option>
                  <option value="detailed">Chi tiết</option>
                  <option value="summary">Tóm tắt</option>
                  <option value="executive">Điều hành</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                Tạo báo cáo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}