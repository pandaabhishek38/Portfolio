'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminContactInfoPage() {
  const router = useRouter()
  const [contact, setContact] = useState(null)
  const [editData, setEditData] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/admin/contactinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or fetch error')
        return res.json()
      })
      .then((data) => {
        // Convert the array of items to a single object with keys like phone, email, etc.
        const parsed = {
          id: data[0]?.id || 1, // assuming all share the same ID
          phone: data.find((item) => item.label === 'Phone')?.value || '',
          email: data.find((item) => item.label === 'Email')?.value || '',
          address: data.find((item) => item.label === 'Address')?.value || '',
          linkedin: data.find((item) => item.label === 'LinkedIn')?.value || '',
          github: data.find((item) => item.label === 'GitHub')?.value || '',
        }

        setContact(parsed)
        setEditData(parsed)
      })
      .catch((err) => {
        console.error('❌ Fetch error:', err)
        setError('Failed to load contact info.')
      })
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(
        `${baseURL}/api/admin/contactinfo/${contact.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      )

      if (!res.ok) throw new Error('Update failed')

      // 🔄 RE-FETCH full contact info here after update
      const updatedRes = await fetch(`${baseURL}/api/admin/contactinfo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const updatedData = await updatedRes.json()

      const parsed = {
        id: updatedData[0]?.id || 1,
        phone: updatedData.find((item) => item.label === 'Phone')?.value || '',
        email: updatedData.find((item) => item.label === 'Email')?.value || '',
        address:
          updatedData.find((item) => item.label === 'Address')?.value || '',
        linkedin:
          updatedData.find((item) => item.label === 'LinkedIn')?.value || '',
        github:
          updatedData.find((item) => item.label === 'GitHub')?.value || '',
      }

      setContact(parsed)
      setEditMode(false)
    } catch (err) {
      console.error('❌ Update failed:', err)
      alert('Failed to update contact info.')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        📇 Contact Info
      </h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {contact && !editMode && (
        <div style={{ lineHeight: '1.8' }}>
          <p>
            <strong>Phone:</strong> {contact.phone}
          </p>
          <p>
            <strong>Email:</strong> {contact.email}
          </p>
          <p>
            <strong>Address:</strong> {contact.address}
          </p>
          <p>
            <strong>LinkedIn:</strong> {contact.linkedin}
          </p>
          <p>
            <strong>GitHub:</strong> {contact.github}
          </p>

          <button
            onClick={() => setEditMode(true)}
            style={{
              marginTop: '1rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ✏️ Edit
          </button>
        </div>
      )}

      {editMode && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '500px',
          }}
        >
          <input
            name="phone"
            value={editData.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          <input
            name="email"
            value={editData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            name="address"
            value={editData.address}
            onChange={handleChange}
            placeholder="Address"
          />
          <input
            name="linkedin"
            value={editData.linkedin}
            onChange={handleChange}
            placeholder="LinkedIn"
          />
          <input
            name="github"
            value={editData.github}
            onChange={handleChange}
            placeholder="GitHub"
          />

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" style={{ marginRight: '1rem' }}>
              ✅ Save
            </button>
            <button type="button" onClick={() => setEditMode(false)}>
              ❌ Cancel
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
