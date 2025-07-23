'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
    // Mock user data
    setUser({
      name: 'Nguyễn Văn A',
      email: 'nguyen.a@company.com',
      role: 'user'
    })
  }, [router])

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: '#edeffa' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}