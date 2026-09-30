'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import RichText from '../../../components/RichText'
import RichTextEditor from '../../../components/admin/RichTextEditor'
import ReorderButtons from '../../../components/admin/ReorderButtons'
import useOrderSaver, {
  OrderStatus,
  moveItem,
} from '../../../components/admin/useOrderSaver'
import { sortByDisplayOrder } from '../../../utils/fetchJson'
import '../../../components/admin/AdminUI.css'

export default function AdminExperiencePage() {
  const router = useRouter()
  const [experiences, setExperiences] = useState([])
  const [error, setError] = useState(null)

  const [editExperienceId, setEditExperienceId] = useState(null)
  const [editData, setEditData] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    description: '',
  })

  const [showNewForm, setShowNewForm] = useState(false)
  const [newExperience, setNewExperience] = useState({
    company: '',
    role: '',
    period: '',
    location: '',
    description: '',
  })

  const { saving, status, saveOrder } = useOrderSaver()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    fetch(`${baseURL}/api/experience`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error('Unauthorized or error fetching experiences')
        return res.json()
      })
      .then((data) => setExperiences(sortByDisplayOrder(data)))
      .catch((err) => {
        console.error('Experience fetch error:', err)
        setError('You are not authorized or something went wrong.')
      })
  }, [router])

  const handleEditClick = (exp) => {
    setEditExperienceId(exp.id)
    setEditData({
      company: exp.company,
      role: exp.role,
      period: exp.period,
      location: exp.location,
      description: exp.description,
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/experience/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })

      if (!res.ok) throw new Error('Failed to update experience')

      const updated = await res.json()
      setExperiences((prev) =>
        prev.map((exp) => (exp.id === id ? updated : exp))
      )
      setEditExperienceId(null)
    } catch (err) {
      console.error('Update failed:', err)
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
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/experience/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete')
      setExperiences((prev) => prev.filter((exp) => exp.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete experience.')
    }
  }

  const handleNewChange = (e) => {
    const { name, value } = e.target
    setNewExperience((prev) => ({ ...prev, [name]: value }))
  }

  const handleMove = (from, to) => {
    const previous = experiences
    const next = moveItem(experiences, from, to)
    if (next === previous) return

    saveOrder({
      path: '/api/admin/experience/order',
      body: { orderedIds: next.map((exp) => exp.id) },
      apply: () => setExperiences(next),
      revert: () => setExperiences(previous),
      successMessage: 'Experience order saved.',
    }).then((saved) => {
      if (Array.isArray(saved)) setExperiences(sortByDisplayOrder(saved))
    })
  }

  const handleNewSubmit = async (e) => {
    e.preventDefault()
    if (!newExperience.description) {
      alert('Please add an experience description.')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/experience`, {
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
        description: '',
      })
    } catch (err) {
      console.error('Failed to add experience:', err)
      alert('Something went wrong.')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        Manage Experience
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
        {showNewForm ? 'Cancel' : 'Add New Experience'}
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
          <label
            className="admin-field-label"
            htmlFor="new-experience-description"
          >
            Description
          </label>
          <RichTextEditor
            id="new-experience-description"
            label="Experience description"
            legacy="list"
            value={newExperience.description}
            onChange={(html) =>
              setNewExperience((prev) => ({ ...prev, description: html }))
            }
          />

          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              fontWeight: 'bold',
              padding: '0.6rem 1.2rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Experience
          </button>
        </form>
      )}

      <OrderStatus status={status} saving={saving} />

      {experiences.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {experiences.map((exp, index) => (
            <li
              key={exp.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                padding: '1rem',
                background: '#f9f9f9',
                color: '#222',
              }}
            >
              <div className="admin-item-head">
                <ReorderButtons
                  index={index}
                  count={experiences.length}
                  label={`${exp.role} at ${exp.company}`}
                  onMove={handleMove}
                  disabled={saving}
                />
              </div>

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
                  <RichTextEditor
                    key={`edit-experience-${exp.id}`}
                    id={`experience-${exp.id}-description`}
                    label="Experience description"
                    legacy="list"
                    value={editData.description}
                    onChange={(html) =>
                      setEditData((prev) => ({ ...prev, description: html }))
                    }
                  />

                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleEditSubmit(exp.id)}
                      style={{ marginRight: '1rem' }}
                    >
                      Save
                    </button>
                    <button onClick={() => setEditExperienceId(null)}>
                      Cancel
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
                  <div className="admin-rich-preview rich-text">
                    <RichText value={exp.description} legacy="list" />
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      onClick={() => handleEditClick(exp)}
                      style={{ marginRight: '1rem' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      style={{ color: 'red' }}
                    >
                      Delete
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
