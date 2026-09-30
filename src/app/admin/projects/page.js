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

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null)

  const [editProjectId, setEditProjectId] = useState(null)
  const [editData, setEditData] = useState({
    title: '',
    stack: '',
    description: '',
    github: '',
  })

  const [newProject, setNewProject] = useState({
    title: '',
    stack: '',
    description: '',
    github: '',
  })

  const [showNewForm, setShowNewForm] = useState(false)
  const { saving, status, saveOrder } = useOrderSaver()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or error fetching projects')
        return res.json()
      })
      .then((data) => setProjects(sortByDisplayOrder(data)))
      .catch((err) => {
        console.error('Project fetch error:', err)
        setError('You are not authorized or something went wrong.')
      })
  }, [router])

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
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      })

      if (!res.ok) throw new Error('Failed to update project')

      const updated = await res.json()
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? updated : proj))
      )
      setEditProjectId(null)
    } catch (err) {
      console.error('Update failed:', err)
      alert('Failed to update project.')
    }
  }

  const handleNewChange = (e) => {
    const { name, value } = e.target
    setNewProject((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewSubmit = async (e) => {
    e.preventDefault()
    if (!newProject.description) {
      alert('Please add a project description.')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/projects`, {
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
      setShowNewForm(false)
      setNewProject({ title: '', stack: '', description: '', github: '' })
    } catch (err) {
      console.error('Failed to add project:', err)
      alert('Something went wrong.')
    }
  }

  const handleMove = (from, to) => {
    const previous = projects
    const next = moveItem(projects, from, to)
    if (next === previous) return

    saveOrder({
      path: '/api/admin/projects/order',
      body: { orderedIds: next.map((project) => project.id) },
      apply: () => setProjects(next),
      revert: () => setProjects(previous),
      successMessage: 'Project order saved.',
    }).then((saved) => {
      if (Array.isArray(saved)) setProjects(sortByDisplayOrder(saved))
    })
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project?'
    )
    if (!confirmDelete) return

    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to delete')
      setProjects((prev) => prev.filter((proj) => proj.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete project.')
    }
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
        Manage Projects
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
        {showNewForm ? 'Hide Form' : 'Add New Project'}
      </button>

      {showNewForm && (
        <form onSubmit={handleNewSubmit} style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            name="title"
            value={newProject.title}
            onChange={handleNewChange}
            placeholder="Project Title"
            required
            style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
          />
          <input
            type="text"
            name="stack"
            value={newProject.stack}
            onChange={handleNewChange}
            placeholder="Tech Stack"
            required
            style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
          />
          <label className="admin-field-label" htmlFor="new-project-description">
            Description
          </label>
          <RichTextEditor
            id="new-project-description"
            label="Project description"
            legacy="list"
            value={newProject.description}
            onChange={(html) =>
              setNewProject((prev) => ({ ...prev, description: html }))
            }
          />
          <input
            type="text"
            name="github"
            value={newProject.github}
            onChange={handleNewChange}
            placeholder="GitHub Link"
            required
            style={{ display: 'block', width: '100%', marginBottom: '0.5rem' }}
          />
          <button type="submit">Add Project</button>
        </form>
      )}

      <OrderStatus status={status} saving={saving} />

      {projects.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {projects.map((project, index) => (
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
              <div className="admin-item-head">
                <ReorderButtons
                  index={index}
                  count={projects.length}
                  label={project.title}
                  onMove={handleMove}
                  disabled={saving}
                />
              </div>

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
                  <RichTextEditor
                    key={`edit-project-${project.id}`}
                    id={`project-${project.id}-description`}
                    label="Project description"
                    legacy="list"
                    value={editData.description}
                    onChange={(html) =>
                      setEditData((prev) => ({ ...prev, description: html }))
                    }
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
                      Save
                    </button>
                    <button onClick={() => setEditProjectId(null)}>
                      Cancel
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
                  <div className="admin-rich-preview rich-text">
                    <RichText value={project.description} legacy="list" />
                  </div>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </a>
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      style={{ marginRight: '1rem' }}
                      onClick={() => handleEditClick(project)}
                    >
                      Edit
                    </button>
                    <button
                      style={{ color: 'red' }}
                      onClick={() => handleDelete(project.id)}
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
        !error && <p>Loading projects...</p>
      )}
    </main>
  )
}
