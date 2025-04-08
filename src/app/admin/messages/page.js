'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminMessagesPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetch('http://localhost:5001/api/admin/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or error fetching messages')
        return res.json()
      })
      .then((data) => setMessages(data))
      .catch((err) => {
        console.error('❌ Fetch error:', err)
        setError('Failed to load messages.')
      })
  }, [])

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this message?'
    )
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to delete message')

      // Refresh the list after deletion
      setMessages((prev) => prev.filter((msg) => msg.id !== id))
    } catch (err) {
      console.error('❌ Delete failed:', err)
      alert('Something went wrong while deleting.')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        📬 Manage Messages
      </h1>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {messages.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((msg) => (
            <li
              key={msg.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                padding: '1rem',
                background: '#f9f9f9',
                color: '#222',
              }}
            >
              <strong style={{ fontSize: '1.2rem', color: '#111' }}>
                {msg.name}
              </strong>
              <p style={{ margin: '0.5rem 0', color: '#444' }}>
                <strong>Email:</strong> {msg.email}
              </p>
              <p style={{ color: '#555' }}>
                <strong>Message:</strong> {msg.message}
              </p>

              <div style={{ marginTop: '1rem' }}>
                <button
                  style={{ marginRight: '1rem', color: 'red' }}
                  onClick={() => handleDelete(msg.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>No messages to display.</p>
      )}
    </main>
  )
}
