'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminExperiencePage() {
  const router = useRouter()
  const [experiences, setExperiences] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetch('http://localhost:5001/api/experience', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error('Unauthorized or error fetching experiences')
        return res.json()
      })
      .then((data) => setExperiences(data))
      .catch((err) => {
        console.error('❌ Experience fetch error:', err)
        setError('You are not authorized or something went wrong.')
      })
  }, [])

  const [editExperienceId, setEditExperienceId] = useState(null)
  const [editData, setEditData] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    bullets: [],
  })

  const [showNewForm, setShowNewForm] = useState(false)

  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    bullets: ['', '', ''], // Start with 3 bullets
  })

  const handleEditClick = (exp) => {
    setEditExperienceId(exp.id)
    setEditData({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      location: exp.location,
      bullets: exp.bullets,
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditBulletsChange = (index, value) => {
    const updatedBullets = [...editData.bullets]
    updatedBullets[index] = value
    setEditData((prev) => ({ ...prev, bullets: updatedBullets }))
  }

  const handleEditSubmit = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:5001/api/admin/experience/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      )

      if (!res.ok) throw new Error('Failed to update experience')

      const updated = await res.json()
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === id ? updated : exp))
      )
      setEditExperienceId(null)
    } catch (err) {
      console.error('❌ Update failed:', err)
      alert('Failed to update experience.')
    }
  }

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this entry?'
    )
    if (!confirm) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:5001/api/admin/experience/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error('Failed to delete')

      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
    } catch (err) {
      console.error('❌ Delete failed:', err)
      alert('Failed to delete experience.')
    }
  }

  const handleNewChange = (e) => {
    const { name, value } = e.target
    setNewExperience((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewBulletsChange = (index, value) => {
    const updated = [...newExperience.bullets]
    updated[index] = value
    setNewExperience((prev) => ({ ...prev, bullets: updated }))
  }

  const handleNewSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/admin/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExperience),
      })

      if (!res.ok) throw new Error('Failed to add experience')

      const created = await res.json()
      setExperiences((prev) => [...prev, created])
      setShowNewForm(false)
      setNewExperience({
        company: '',
        role: '',
        period: '',
        location: '',
        bullets: ['', '', ''],
      })
    } catch (err) {
      console.error('❌ Failed to add experience:', err)
      alert('Something went wrong.')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        💼 Manage Experience
      </h1>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
      <button
        onClick={() => setShowNewForm((prev) => !prev)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          marginBottom: '1rem',
          cursor: 'pointer',
        }}
      >
        {showNewForm ? 'Cancel' : '➕ Add New Experience'}
      </button>

      {showNewForm && (
        <form onSubmit={handleNewSubmit} style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            name="company"
            value={newExperience.company}
            onChange={handleNewChange}
            placeholder="Company"
            required
            style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
          />
          <input
            type="text"
            name="role"
            value={newExperience.role}
            onChange={handleNewChange}
            placeholder="Role"
            required
            style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
          />
          <input
            type="text"
            name="period"
            value={newExperience.period}
            onChange={handleNewChange}
            placeholder="Period"
            required
            style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
          />
          <input
            type="text"
            name="location"
            value={newExperience.location}
            onChange={handleNewChange}
            placeholder="Location"
            required
            style={{ display: 'block', marginBottom: '0.5rem', width: '100%' }}
          />

          <p style={{ margin: '0.5rem 0 0.25rem' }}>Bullets:</p>
          {newExperience.bullets.map((point, i) => (
            <textarea
              key={i}
              rows="2"
              value={point}
              onChange={(e) => handleNewBulletsChange(i, e.target.value)}
              placeholder={`Bullet ${i + 1}`}
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '0.5rem',
              }}
              required
            />
          ))}

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Experience
          </button>
        </form>
      )}

      {experiences.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {experiences.map((exp, index) => (
            <li
              key={index}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                padding: '1rem',
                background: '#f9f9f9',
                color: '#222',
              }}
            >
              {editExperienceId === exp.id ? (
                <>
                  <input
                    type="text"
                    name="company"
                    value={editData.company}
                    onChange={handleEditChange}
                    placeholder="Company"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <input
                    type="text"
                    name="role"
                    value={editData.role}
                    onChange={handleEditChange}
                    placeholder="Role"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <input
                    type="text"
                    name="period"
                    value={editData.period}
                    onChange={handleEditChange}
                    placeholder="Period"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <input
                    type="text"
                    name="location"
                    value={editData.location}
                    onChange={handleEditChange}
                    placeholder="Location"
                    style={{
                      display: 'block',
                      width: '100%',
                      marginBottom: '0.5rem',
                    }}
                  />

                  <p style={{ margin: '0.5rem 0 0.25rem' }}>Bullets:</p>
                  {editData.bullets.map((point, i) => (
                    <textarea
                      key={i}
                      rows="2"
                      value={point}
                      onChange={(e) =>
                        handleEditBulletsChange(i, e.target.value)
                      }
                      placeholder={`Bullet ${i + 1}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        marginBottom: '0.5rem',
                      }}
                    />
                  ))}

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleEditSubmit(exp.id)}
                      style={{ marginRight: '1rem' }}
                    >
                      ✅ Save
                    </button>
                    <button onClick={() => setEditExperienceId(null)}>
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong style={{ fontSize: '1.2rem', color: '#111' }}>
                    {exp.company}
                  </strong>
                  <p style={{ color: '#444' }}>
                    <strong>{exp.role}</strong> | {exp.period} | {exp.location}
                  </p>
                  <ul>
                    {exp.bullets.map((point, i) => (
                      <li key={i} style={{ color: '#555', lineHeight: '1.5' }}>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleEditClick(exp)}
                      style={{ marginRight: '1rem' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{ color: 'red' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !error && <p>Loading experiences...</p>
      )}
    </main>
  )
}
