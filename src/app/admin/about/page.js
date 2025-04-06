'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './AboutPage.css'

export default function AdminAboutPage() {
  const router = useRouter()
  const [summary, setSummary] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [education, setEducation] = useState([])
  const [skills, setSkills] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/admin/login')

    fetch('http://localhost:5001/api/about/summary')
      .then((res) => res.json())
      .then((data) => {
        setSummary(data[0]?.content || '')
        setEditSummary(data[0]?.content || '')
      })

    fetch('http://localhost:5001/api/about/education')
      .then((res) => res.json())
      .then((data) => setEducation(data))

    fetch('http://localhost:5001/api/about/skills')
      .then((res) => res.json())
      .then((data) => setSkills(data))
  }, [])

  const handleSummarySave = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(
        'http://localhost:5001/api/admin/about/summary/1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editSummary }),
        }
      )

      if (!res.ok) throw new Error('Failed to update summary')

      const updated = await res.json()
      setSummary(updated.content)
      setEditMode(false)
    } catch (err) {
      console.error('❌ Failed to update summary:', err)
      alert('Update failed')
    }
  }

  return (
    <main className="admin-about">
      <h1>📝 Manage About Me</h1>

      <section className="admin-section">
        <h2>Summary</h2>
        {editMode ? (
          <>
            <textarea
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              rows={6}
              style={{ width: '100%' }}
            />
            <button onClick={handleSummarySave} className="save">
              ✅ Save
            </button>
            <button onClick={() => setEditMode(false)} className="cancel">
              ❌ Cancel
            </button>
          </>
        ) : (
          <>
            <p>{summary}</p>
            <button onClick={() => setEditMode(true)} className="edit">
              ✏️ Edit
            </button>
          </>
        )}
      </section>

      <section className="admin-section">
        <h2>Education</h2>
        {education.map((edu) => (
          <div key={edu.id} className="admin-card">
            <p>
              <strong>{edu.degree}</strong> in {edu.major}
            </p>
            <p>
              {edu.university} ({edu.fromYear} - {edu.toYear})
            </p>
            <p>
              <em>{edu.courses}</em>
            </p>
            <div className="button-row">
              <button className="edit">✏️ Edit</button>
              <button className="delete">🗑️ Delete</button>
            </div>
          </div>
        ))}
        <button className="add">➕ Add Education</button>
      </section>

      <section className="admin-section">
        <h2>Skills</h2>
        {skills.map((skill) => (
          <div key={skill.id} className="admin-card">
            <p>
              <strong>{skill.name}</strong> ({skill.type})
            </p>
            <div className="button-row">
              <button className="edit">✏️ Edit</button>
              <button className="delete">🗑️ Delete</button>
            </div>
          </div>
        ))}
        <button className="add">➕ Add Skill</button>
      </section>
    </main>
  )
}
