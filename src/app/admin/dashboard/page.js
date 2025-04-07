'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './dashboard.css'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  const sections = [
    {
      title: '📁 Projects',
      path: '/admin/projects',
      description: 'View and edit projects',
    },
    {
      title: '💼 Experience',
      path: '/admin/experience',
      description: 'Manage work history',
    },
    {
      title: '📇 Contact Info',
      path: '/admin/contact-info',
      description: 'Edit your contact details',
    },
    {
      title: '📬 Messages',
      path: '/admin/messages',
      description: 'Read form submissions',
    },
    {
      title: '📝 About',
      path: '/admin/about',
      description: 'Edit About Me section',
    },
  ]

  return (
    <main className="admin-dashboard">
      <div className="admin-header">
        <h1>🛠️ Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="admin-grid">
        {sections.map((section) => (
          <div
            key={section.path}
            className="admin-card"
            onClick={() => router.push(section.path)}
          >
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
