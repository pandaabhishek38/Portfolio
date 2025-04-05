'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Fetch projects with token (we’ll protect backend later)
    fetch('http://localhost:5001/api/projects', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or error fetching projects')
        return res.json()
      })
      .then((data) => setProjects(data))
      .catch((err) => {
        console.error('❌ Project fetch error:', err)
        setError('You are not authorized or something went wrong.')
      })
  }, [])

  const handleDelete = async (projectId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project?'
    )
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:5001/api/admin/projects/${projectId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error('Failed to delete project')
      }

      // Refresh the list after deletion
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      console.error('❌ Delete failed:', err)
      alert('Something went wrong while deleting.')
    }
  }

  const [editProjectId, setEditProjectId] = useState(null)
  const [editData, setEditData] = useState({
    title: '',
    stack: '',
    description: '',
    github: '',
  })

  const handleEditClick = (project) => {
    setEditProjectId(project.id)
    setEditData({
      title: project.title,
      stack: project.stack,
      description: project.description,
      github: project.github,
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSubmit = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(
        `http://localhost:5001/api/admin/projects/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      )

      if (!res.ok) throw new Error('Failed to update project')

      const updated = await res.json()
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? updated : proj))
      )
      setEditProjectId(null)
    } catch (err) {
      console.error('❌ Update failed:', err)
      alert('Failed to update project.')
    }
  }

  const [newProject, setNewProject] = useState({
    title: '',
    stack: '',
    description: '',
    github: '',
  })

  const handleNewChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5001/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProject),
      })

      if (!res.ok) throw new Error('Failed to add project')

      const created = await res.json()
      setProjects((prev) => [...prev, created])
      setNewProject({ title: '', stack: '', description: '', github: '' })
    } catch (err) {
      console.error('❌ Failed to add project:', err)
      alert('Something went wrong.')
    }
  }

  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        🛠️ Manage Projects
      </h1>

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      <button
        onClick={() => setShowNewForm((prev) => !prev)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          marginBottom: '1rem',
          cursor: 'pointer',
        }}
      >
        {showNewForm ? 'Hide Form' : '➕ Add New Project'}
      </button>

      {showNewForm && (
        <>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            ➕ Add New Project
          </h2>
          <form onSubmit={handleNewSubmit} style={{ marginBottom: '2rem' }}>
            <input
              type="text"
              name="title"
              value={newProject.title}
              onChange={handleNewChange}
              placeholder="Project Title"
              required
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '0.5rem',
              }}
            />
            <input
              type="text"
              name="stack"
              value={newProject.stack}
              onChange={handleNewChange}
              placeholder="Tech Stack"
              required
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '0.5rem',
              }}
            />
            <textarea
              name="description"
              value={newProject.description}
              onChange={handleNewChange}
              placeholder="Description"
              rows="3"
              required
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '0.5rem',
              }}
            />
            <input
              type="text"
              name="github"
              value={newProject.github}
              onChange={handleNewChange}
              placeholder="GitHub Link"
              required
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '0.5rem',
              }}
            />
            <button type="submit">➕ Add Project</button>
          </form>
        </>
      )}

      {projects.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projects.map((project) => (
            <li
              key={project.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                padding: '1rem',
                background: '#f9f9f9',
                color: '#222',
              }}
            >
              {editProjectId === project.id ? (
                <>
                  <input
                    type="text"
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    placeholder="Project Title"
                    style={{ marginBottom: '0.5rem', width: '100%' }}
                  />
                  <input
                    type="text"
                    name="stack"
                    value={editData.stack}
                    onChange={handleEditChange}
                    placeholder="Tech Stack"
                    style={{ marginBottom: '0.5rem', width: '100%' }}
                  />
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    placeholder="Description"
                    rows="3"
                    style={{ marginBottom: '0.5rem', width: '100%' }}
                  />
                  <input
                    type="text"
                    name="github"
                    value={editData.github}
                    onChange={handleEditChange}
                    placeholder="GitHub Link"
                    style={{ marginBottom: '0.5rem', width: '100%' }}
                  />
                  <div>
                    <button
                      onClick={() => handleEditSubmit(project.id)}
                      style={{ marginRight: '1rem' }}
                    >
                      ✅ Save
                    </button>
                    <button onClick={() => setEditProjectId(null)}>
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong style={{ fontSize: '1.2rem', color: '#111' }}>
                    {project.title}
                  </strong>
                  <p style={{ margin: '0.5rem 0', color: '#444' }}>
                    {project.stack}
                  </p>
                  <p style={{ color: '#555' }}>{project.description}</p>
                  <a href={project.github} target="_blank" rel="noreferrer">
                    View on GitHub →
                  </a>

                  <div style={{ marginTop: '1rem' }}>
                    <button
                      style={{ marginRight: '1rem' }}
                      onClick={() => handleEditClick(project)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={{ color: 'red' }}
                      onClick={() => handleDelete(project.id)}
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
        !error && <p>Loading projects...</p>
      )}
    </main>
  )
}
