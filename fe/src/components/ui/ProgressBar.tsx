// src/components/ui/ProgressBar.tsx
interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'green' | 'yellow' | 'red'
  showLabel?: boolean
}

export default function ProgressBar({ 
  progress, 
  size = 'md', 
  color = 'primary', 
  showLabel = false 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  const colorClasses = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  }

  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Tiến độ</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
