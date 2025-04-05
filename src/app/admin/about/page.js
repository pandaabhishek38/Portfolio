'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
    }
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        🔧 [Section Title]
      </h1>
      <p>
        This page will allow you to view, edit, and manage [section] content.
      </p>
    </main>
  )
}
