// src/app/dashboard/settings/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { 
  User, 
  Shield, 
  Bell, 
  Palette,
  Database,
  Bot,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Key,
  Globe,
  Monitor,
  Smartphone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Settings {
  // Profile
  name: string
  email: string
  department: string
  phone: string
  avatar?: string
  
  // Security
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
  sessionTimeout: number
  
  // Notifications
  emailNotifications: boolean
  systemNotifications: boolean
  reportNotifications: boolean
  qaNotifications: boolean
  securityAlerts: boolean
  
  // AI Settings
  aiModel: string
  ocrAccuracy: string
  summaryLength: string
  autoProcessOCR: boolean
  aiLanguage: string
  
  // System
  language: string
  theme: string
  autoBackup: boolean
  backupFrequency: string
  timezone: string
  dateFormat: string
  
  // Privacy
  dataRetention: number
  shareAnalytics: boolean
  cookiePreferences: string
}

interface BackupInfo {
  lastBackup: Date
  backupSize: string
  status: 'success' | 'failed' | 'inprogress'
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    // Profile
    name: 'Nguyễn Văn A',
    email: 'nguyen.a@company.com',
    department: 'Công nghệ thông tin',
    phone: '0123456789',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    sessionTimeout: 30,
    
    // Notifications
    emailNotifications: true,
    systemNotifications: true,
    reportNotifications: false,
    qaNotifications: true,
    securityAlerts: true,
    
    // AI Settings
    aiModel: 'gpt-3.5-turbo',
    ocrAccuracy: 'high',
    summaryLength: 'medium',
    autoProcessOCR: true,
    aiLanguage: 'vi',
    
    // System
    language: 'vi',
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'daily',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    
    // Privacy
    dataRetention: 365,
    shareAnalytics: false,
    cookiePreferences: 'essential'
  })

  const [backupInfo, setBackupInfo] = useState<BackupInfo>({
    lastBackup: new Date(Date.now() - 86400000), // 1 day ago
    backupSize: '2.3 GB',
    status: 'success'
  })

  const [systemStats, setSystemStats] = useState({
    totalDocuments: 1247,
    totalUsers: 23,
    storageUsed: '15.6 GB',
    storageLimit: '100 GB'
  })

  const tabs = [
    { id: 'profile', name: 'Hồ sơ cá nhân', icon: User },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'ai', name: 'AI & OCR', icon: Bot },
    { id: 'system', name: 'Hệ thống', icon: Database },
    { id: 'privacy', name: 'Quyền riêng tư', icon: Key },
  ]

  const aiModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Nhanh, tiết kiệm)', description: 'Phù hợp cho hầu hết tác vụ' },
    { value: 'gpt-4', label: 'GPT-4 (Chính xác cao)', description: 'Tốt nhất cho phân tích phức tạp' },
    { value: 'claude-3', label: 'Claude-3 (Cân bằng)', description: 'Cân bằng giữa tốc độ và chất lượng' },
  ]

  const themes = [
    { value: 'light', label: 'Sáng', icon: '☀️' },
    { value: 'dark', label: 'Tối', icon: '🌙' },
    { value: 'auto', label: 'Tự động', icon: '🔄' }
  ]

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('smartdoc_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    
    // Validate password if changing
    if (settings.newPassword) {
      if (settings.newPassword !== settings.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp')
        setIsLoading(false)
        return
      }
      if (settings.newPassword.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự')
        setIsLoading(false)
        return
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      // Save to localStorage
      const settingsToSave = {
        ...settings,
        currentPassword: '', // Don't save passwords
        newPassword: '',
        confirmPassword: ''
      }
      localStorage.setItem('smartdoc_settings', JSON.stringify(settingsToSave))
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      
      toast.success('Cài đặt đã được lưu!')
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportSettings = () => {
    const exportData = {
      settings: {
        ...settings,
        currentPassword: '', // Don't export passwords
        newPassword: '',
        confirmPassword: ''
      },
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `smartdoc_settings_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Đã xuất cài đặt!')
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        if (importData.settings) {
          setSettings(prev => ({ ...prev, ...importData.settings }))
          toast.success('Đã nhập cài đặt!')
        } else {
          toast.error('File cài đặt không hợp lệ')
        }
      } catch (error) {
        toast.error('Lỗi khi đọc file cài đặt')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const handleResetSettings = () => {
    if (confirm('Bạn có chắc muốn khôi phục cài đặt mặc định? Tất cả cài đặt hiện tại sẽ bị mất.')) {
      localStorage.removeItem('smartdoc_settings')
      window.location.reload()
    }
  }

  const handleManualBackup = () => {
    setBackupInfo(prev => ({ ...prev, status: 'inprogress' }))
    toast('Đang sao lưu dữ liệu...')
    
    setTimeout(() => {
      setBackupInfo({
        lastBackup: new Date(),
        backupSize: '2.4 GB',
        status: 'success'
      })
      toast.success('Sao lưu hoàn thành!')
    }, 3000)
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
        
        {/* Avatar */}
        <div className="flex items-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {settings.name.charAt(0)}
          </div>
          <div className="ml-4">
            <button className="btn btn-secondary btn-sm mr-2">
              Thay đổi ảnh
            </button>
            <button className="btn btn-secondary btn-sm">
              Xóa
            </button>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG hoặc GIF (tối đa 5MB)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({...settings, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({...settings, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn hiển thị</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Múi giờ
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
              <option value="UTC">UTC (GMT+0)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Định dạng ngày
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
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
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Xác thực hai yếu tố</h3>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">Bảo mật bằng 2FA</div>
            <div className="text-sm text-gray-500">Tăng cường bảo mật tài khoản bằng mã xác thực</div>
          </div>
          <button
            onClick={() => setSettings({...settings, twoFactorEnabled: !settings.twoFactorEnabled})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Phiên đăng nhập</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian hết hạn phiên (phút)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 phút</option>
              <option value={30}>30 phút</option>
              <option value={60}>1 giờ</option>
              <option value={240}>4 giờ</option>
              <option value={480}>8 giờ</option>
            </select>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Phiên đăng nhập hiện tại</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Bạn đang đăng nhập từ: Chrome trên Windows • IP: 192.168.1.100 • Việt Nam
                </p>
                <button className="text-sm text-yellow-800 underline mt-2">
                  Xem tất cả phiên đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo email</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Thông báo chung</div>
              <div className="text-sm text-gray-500">Nhận thông báo về hoạt động hệ thống</div>
            </div>
            <button
              onClick={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Báo cáo hoàn thành</div>
              <div className="text-sm text-gray-500">Khi quá trình tạo báo cáo hoàn tất</div>
            </div>
            <button
              onClick={() => setSettings({...settings, reportNotifications: !settings.reportNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.reportNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.reportNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Hỏi đáp mới</div>
              <div className="text-sm text-gray-500">Khi có câu hỏi hoặc phản hồi mới</div>
            </div>
            <button
              onClick={() => setSettings({...settings, qaNotifications: !settings.qaNotifications})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.qaNotifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.qaNotifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Cảnh báo bảo mật</div>
              <div className="text-sm text-gray-500">Thông báo về hoạt động bảo mật</div>
            </div>
            <button
              onClick={() => setSettings({...settings, securityAlerts: !settings.securityAlerts})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông báo trong ứng dụng</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900">Thông báo hệ thống</div>
            <div className="text-sm text-gray-500">Hiển thị thông báo trong giao diện</div>
          </div>
          <button
            onClick={() => setSettings({...settings, systemNotifications: !settings.systemNotifications})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.systemNotifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>
    </div>
  )

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mô hình AI</h3>
        <div className="space-y-3">
          {aiModels.map((model) => (
            <div
              key={model.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                settings.aiModel === model.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSettings({...settings, aiModel: model.value})}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{model.label}</div>
                  <div className="text-sm text-gray-500">{model.description}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  settings.aiModel === model.value
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt OCR</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ chính xác OCR
            </label>
            <select
              value={settings.ocrAccuracy}
              onChange={(e) => setSettings({...settings, ocrAccuracy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="fast">Nhanh (Ít chính xác)</option>
              <option value="balanced">Cân bằng</option>
              <option value="high">Cao (Chậm hơn)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ AI
            </label>
            <select
              value={settings.aiLanguage}
              onChange={(e) => setSettings({...settings, aiLanguage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="auto">Tự động</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Tự động xử lý OCR</div>
              <div className="text-sm text-gray-500">Tự động chuyển đổi ảnh thành văn bản khi upload</div>
            </div>
            <button
              onClick={() => setSettings({...settings, autoProcessOCR: !settings.autoProcessOCR})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoProcessOCR ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.autoProcessOCR ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt văn bản</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ dài tóm tắt mặc định
          </label>
          <select
            value={settings.summaryLength}
            onChange={(e) => setSettings({...settings, summaryLength: e.target.value})}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="short">Ngắn (1-2 đoạn)</option>
            <option value="medium">Trung bình (3-5 đoạn)</option>
            <option value="long">Dài (Chi tiết)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Giao diện</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({...settings, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chế độ hiển thị
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setSettings({...settings, theme: theme.value})}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    settings.theme === theme.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{theme.icon}</div>
                  <div className="text-sm font-medium">{theme.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sao lưu dữ liệu</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sao lưu tự động</div>
              <div className="text-sm text-gray-500">Tự động sao lưu dữ liệu định kỳ</div>
            </div>
            <button
              onClick={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
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
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Sao lưu gần nhất</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                backupInfo.status === 'success' ? 'bg-green-100 text-green-800' :
                backupInfo.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {backupInfo.status === 'success' ? 'Thành công' :
                 backupInfo.status === 'failed' ? 'Thất bại' : 'Đang xử lý'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Thời gian: {backupInfo.lastBackup.toLocaleString('vi-VN')}</p>
              <p>Kích thước: {backupInfo.backupSize}</p>
            </div>
            <button 
              onClick={handleManualBackup}
              disabled={backupInfo.status === 'inprogress'}
              className="btn btn-secondary btn-sm mt-3"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${backupInfo.status === 'inprogress' ? 'animate-spin' : ''}`} />
              Sao lưu ngay
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê hệ thống</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{systemStats.totalDocuments}</div>
            <div className="text-sm text-gray-600">Tài liệu</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{systemStats.totalUsers}</div>
            <div className="text-sm text-gray-600">Người dùng</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{systemStats.storageUsed}</div>
            <div className="text-sm text-gray-600">Đã sử dụng</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{systemStats.storageLimit}</div>
            <div className="text-sm text-gray-600">Giới hạn</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lưu trữ dữ liệu</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian lưu trữ dữ liệu (ngày)
            </label>
            <select
              value={settings.dataRetention}
              onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 ngày</option>
              <option value={90}>90 ngày</option>
              <option value={365}>1 năm</option>
              <option value={730}>2 năm</option>
              <option value={-1}>Vĩnh viễn</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Dữ liệu sẽ được tự động xóa sau thời gian này
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Chia sẻ dữ liệu phân tích</div>
              <div className="text-sm text-gray-500">Giúp cải thiện sản phẩm bằng dữ liệu ẩn danh</div>
            </div>
            <button
              onClick={() => setSettings({...settings, shareAnalytics: !settings.shareAnalytics})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.shareAnalytics ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.shareAnalytics ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cookie và theo dõi</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tùy chọn cookie
          </label>
          <select
            value={settings.cookiePreferences}
            onChange={(e) => setSettings({...settings, cookiePreferences: e.target.value})}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="essential">Chỉ cần thiết</option>
            <option value="functional">Cần thiết + Chức năng</option>
            <option value="all">Tất cả cookie</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quản lý dữ liệu</h3>
        <div className="space-y-3">
          <button 
            onClick={handleExportSettings}
            className="btn btn-secondary w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            Xuất dữ liệu cá nhân
          </button>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="import-settings"
            />
            <button className="btn btn-secondary w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Nhập dữ liệu
            </button>
          </div>
          
          <button 
            onClick={handleResetSettings}
            className="btn btn-secondary w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa tất cả dữ liệu
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <Info className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Lưu ý về quyền riêng tư</p>
              <p>Dữ liệu của bạn được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba mà không có sự đồng ý của bạn.</p>
            </div>
          </div>
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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
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
            {activeTab === 'privacy' && renderPrivacyTab()}

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}