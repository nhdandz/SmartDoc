// src/app/dashboard/settings/page.tsx
'use client'
import { useState } from 'react'
import { 
  User, 
  Shield, 
  Bell, 
  Palette,
  Database,
  Bot,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Profile
    name: 'Nguyễn Văn A',
    email: 'nguyen.a@company.com',
    department: 'Công nghệ thông tin',
    phone: '0123456789',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Notifications
    emailNotifications: true,
    systemNotifications: true,
    reportNotifications: false,
    
    // AI Settings
    aiModel: 'gpt-3.5-turbo',
    ocrAccuracy: 'high',
    summaryLength: 'medium',
    
    // System
    language: 'vi',
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'daily'
  })

  const tabs = [
    { id: 'profile', name: 'Hồ sơ cá nhân', icon: User },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'ai', name: 'AI & OCR', icon: Bot },
    { id: 'system', name: 'Hệ thống', icon: Database },
  ]

  const handleSave = () => {
    // Mock save
    toast.success('Cài đặt đã được lưu!')
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({...settings, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng ban
            </label>
            <input
              type="text"
              value={settings.department}
              onChange={(e) => setSettings({...settings, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({...settings, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thay đổi mật khẩu</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings.currentPassword}
                onChange={(e) => setSettings({...settings, currentPassword: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={settings.newPassword}
              onChange={(e) => setSettings({...settings, newPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={settings.confirmPassword}
              onChange={(e) => setSettings({...settings, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt thông báo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Thông báo email</div>
              <div className="text-sm text-gray-500">Nhận thông báo qua email</div>
            </div>
            <button
              onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Thông báo hệ thống</div>
              <div className="text-sm text-gray-500">Thông báo trong ứng dụng</div>
            </div>
            <button
              onClick={() => setSettings({...settings, systemNotifications: !settings.systemNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.systemNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Thông báo báo cáo</div>
              <div className="text-sm text-gray-500">Khi báo cáo được hoàn thành</div>
            </div>
            <button
              onClick={() => setSettings({...settings, reportNotifications: !settings.reportNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.reportNotifications ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.reportNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt AI</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model AI
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({...settings, aiModel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Nhanh)</option>
              <option value="gpt-4">GPT-4 (Chính xác cao)</option>
              <option value="claude-3">Claude-3 (Cân bằng)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ chính xác OCR
            </label>
            <select
              value={settings.ocrAccuracy}
              onChange={(e) => setSettings({...settings, ocrAccuracy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="fast">Nhanh (Ít chính xác)</option>
              <option value="balanced">Cân bằng</option>
              <option value="high">Cao (Chậm hơn)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ dài tóm tắt
            </label>
            <select
              value={settings.summaryLength}
              onChange={(e) => setSettings({...settings, summaryLength: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="short">Ngắn (1-2 đoạn)</option>
              <option value="medium">Trung bình (3-5 đoạn)</option>
              <option value="long">Dài (Chi tiết)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt hệ thống</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giao diện
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({...settings, theme: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
              <option value="auto">Tự động</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sao lưu tự động</div>
              <div className="text-sm text-gray-500">Tự động sao lưu dữ liệu</div>
            </div>
            <button
              onClick={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBackup ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {settings.autoBackup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tần suất sao lưu
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-600">Quản lý cài đặt tài khoản và hệ thống</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'ai' && renderAITab()}
            {activeTab === 'system' && renderSystemTab()}

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
              <button onClick={handleSave} className="btn btn-primary">
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}