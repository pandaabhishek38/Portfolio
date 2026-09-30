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
import { sortSkills } from '../../../utils/fetchJson'
import '../../../components/admin/AdminUI.css'
import './AboutPage.css'

/* Skills in saved order (category order, then order within category). */
async function fetchSkills() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
  const res = await fetch(`${baseURL}/api/about/skills`)
  if (!res.ok) throw new Error(`Failed to fetch skills: ${res.status}`)

  const data = await res.json()
  return Array.isArray(data) ? sortSkills(data) : []
}

/* [{ type, skills }] in the order the skills are already sorted. */
function groupByType(skills) {
  const groups = new Map()

  for (const skill of skills) {
    if (!groups.has(skill.type)) groups.set(skill.type, [])
    groups.get(skill.type).push(skill)
  }

  return [...groups.entries()].map(([type, items]) => ({ type, skills: items }))
}

export default function AdminAboutPage() {
  const router = useRouter()
  const [summaryId, setSummaryId] = useState(null) // NEW: Track actual summary ID
  const [summary, setSummary] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [education, setEducation] = useState([])
  const [skills, setSkills] = useState([])
  const [editMode, setEditMode] = useState(false)
  const { saving, status, saveOrder } = useOrderSaver()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/admin/login')
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    // Fetch Summary
    fetch(`${baseURL}/api/about/summary`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setSummary(data[0].content)
          setEditSummary(data[0].content)
          setSummaryId(data[0].id) // Capture the ID here
        } else {
          setSummary('')
          setEditSummary('')
          setSummaryId(null)
        }
      })

    // Fetch Education
    fetch(`${baseURL}/api/about/education`)
      .then((res) => res.json())
      .then((data) => setEducation(data))

    // Fetch Skills
    fetchSkills()
      .then(setSkills)
      .catch((err) => console.error('Skills fetch error:', err))
  }, [router])

  const [editEducationId, setEditEducationId] = useState(null)
  const [educationForm, setEducationForm] = useState({
    university: '',
    degree: '',
    major: '',
    fromYear: '',
    toYear: '',
    courses: '',
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [newEducation, setNewEducation] = useState({
    university: '',
    degree: '',
    major: '',
    fromYear: '',
    toYear: '',
    courses: '',
  })

  const handleSummarySave = async () => {
    const token = localStorage.getItem('token')
    // 0 is a valid id; only a missing summary row has no id
    if (summaryId === null || summaryId === undefined) {
      alert('Summary ID is not available. Cannot update.')
      return
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(
        `${baseURL}/api/admin/about/summary/${summaryId}`, // Dynamic ID
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
      setEditSummary(updated.content)
      setEditMode(false)
    } catch (err) {
      console.error('Failed to update summary:', err)
      alert('Update failed')
    }
  }

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const handleEditClick = (edu) => {
    setEditEducationId(edu.id)
    setEducationForm({ ...edu })
  }

  const handleCancelEdit = () => {
    setEditEducationId(null)
    setEducationForm({
      university: '',
      degree: '',
      major: '',
      fromYear: '',
      toYear: '',
      courses: '',
    })
  }

  const handleInputChange = (e) => {
    setEducationForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleEducationUpdate = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(
        `${baseURL}/api/admin/about/education/${editEducationId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(educationForm),
        }
      )

      if (!res.ok) throw new Error('Failed to update education')

      const updated = await res.json()
      setEducation((prev) =>
        prev.map((e) => (e.id === editEducationId ? updated : e))
      )
      handleCancelEdit()
    } catch (err) {
      console.error('Education update failed:', err)
      alert('Failed to update education')
    }
  }

  const handleDeleteEducation = async (id) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this entry?'
    )
    if (!confirm) return

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/about/education/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to delete education')

      setEducation((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Education delete failed:', err)
      alert('Failed to delete education')
    }
  }

  const handleNewEducationChange = (e) => {
    setNewEducation((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleAddEducation = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/about/education`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEducation),
      })

      if (!res.ok) throw new Error('Failed to add education')

      const added = await res.json()
      setEducation((prev) => [...prev, added])
      setNewEducation({
        university: '',
        degree: '',
        major: '',
        fromYear: '',
        toYear: '',
        courses: '',
      })
      setShowAddForm(false)
    } catch (err) {
      console.error('Add education failed:', err)
      alert('Failed to add education')
    }
  }

  const [editSkillId, setEditSkillId] = useState(null)
  const [skillForm, setSkillForm] = useState({ name: '', type: '' })
  const [showSkillAddForm, setShowSkillAddForm] = useState(false)
  const [newSkill, setNewSkill] = useState({ name: '', type: '' })

  const handleSkillFormChange = (e) => {
    setSkillForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNewSkillChange = (e) => {
    setNewSkill((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const startSkillEdit = (skill) => {
    setEditSkillId(skill.id)
    setSkillForm({ name: skill.name, type: skill.type })
  }

  const cancelSkillEdit = () => {
    setEditSkillId(null)
    setSkillForm({ name: '', type: '' })
  }

  const handleUpdateSkill = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(
        `${baseURL}/api/admin/about/skills/${editSkillId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(skillForm),
        }
      )

      if (!res.ok) throw new Error('Failed to update skill')

      // Reload so a category change is reflected in the saved order
      setSkills(await fetchSkills())
      cancelSkillEdit()
    } catch (err) {
      console.error('Skill update failed:', err)
      alert('Failed to update skill')
    }
  }

  const deleteSkill = async (id) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this skill?'
    )
    if (!confirm) return

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/about/skills/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to delete skill')

      setSkills((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('Delete skill failed:', err)
      alert('Failed to delete skill')
    }
  }

  const addSkill = async () => {
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/about/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSkill),
      })

      if (!res.ok) throw new Error('Failed to add skill')

      // Reload so the new skill appears at the end of its category
      setSkills(await fetchSkills())
      setNewSkill({ name: '', type: '' })
      setShowSkillAddForm(false)
    } catch (err) {
      console.error('Add skill failed:', err)
      alert('Failed to add skill')
    }
  }

  const skillGroups = groupByType(skills)

  const handleMoveGroup = (from, to) => {
    const previous = skills
    const orderedTypes = moveItem(
      skillGroups.map((group) => group.type),
      from,
      to
    )

    saveOrder({
      path: '/api/admin/about/skill-types/order',
      body: { orderedTypes },
      apply: () =>
        setSkills((prev) =>
          sortSkills(
            prev.map((s) => ({ ...s, typeOrder: orderedTypes.indexOf(s.type) }))
          )
        ),
      revert: () => setSkills(previous),
      successMessage: 'Category order saved.',
    }).then((saved) => {
      if (Array.isArray(saved)) setSkills(sortSkills(saved))
    })
  }

  const handleMoveSkill = (group, from, to) => {
    const previous = skills
    const orderedIds = moveItem(
      group.skills.map((skill) => skill.id),
      from,
      to
    )

    saveOrder({
      path: '/api/admin/about/skills/order',
      body: { type: group.type, orderedIds },
      apply: () =>
        setSkills((prev) =>
          sortSkills(
            prev.map((s) =>
              orderedIds.includes(s.id)
                ? { ...s, displayOrder: orderedIds.indexOf(s.id) }
                : s
            )
          )
        ),
      revert: () => setSkills(previous),
      successMessage: `Skill order saved for ${group.type}.`,
    }).then((saved) => {
      if (Array.isArray(saved)) setSkills(sortSkills(saved))
    })
  }

  return (
    <main className="admin-about">
      <h1>Manage About Me</h1>

      <section className="admin-section">
        <h2>Summary</h2>
        {editMode ? (
          <>
            <RichTextEditor
              id="about-summary"
              label="Summary"
              legacy="paragraphs"
              value={editSummary}
              onChange={setEditSummary}
            />
            <button onClick={handleSummarySave} className="save">
              Save
            </button>
            <button
              onClick={() => {
                setEditSummary(summary)
                setEditMode(false)
              }}
              className="cancel"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="admin-rich-preview rich-text">
              <RichText value={summary} legacy="paragraphs" />
            </div>
            <button onClick={() => setEditMode(true)} className="edit">
              Edit
            </button>
          </>
        )}
      </section>

      <section className="admin-section">
        <h2>Education</h2>
        {education.map((edu) =>
          editEducationId === edu.id ? (
            <div key={edu.id} className="admin-card">
              <input
                type="text"
                name="university"
                value={educationForm.university}
                onChange={handleInputChange}
                placeholder="University"
              />
              <input
                type="text"
                name="degree"
                value={educationForm.degree}
                onChange={handleInputChange}
                placeholder="Degree"
              />
              <input
                type="text"
                name="major"
                value={educationForm.major}
                onChange={handleInputChange}
                placeholder="Major"
              />
              <input
                type="number"
                name="fromYear"
                value={educationForm.fromYear}
                onChange={handleInputChange}
                placeholder="From Year"
              />
              <input
                type="number"
                name="toYear"
                value={educationForm.toYear}
                onChange={handleInputChange}
                placeholder="To Year"
              />
              <textarea
                name="courses"
                value={educationForm.courses}
                onChange={handleInputChange}
                placeholder="Relevant Courses"
                rows={2}
              />
              <div className="button-row">
                <button className="save" onClick={handleEducationUpdate}>
                  Save
                </button>
                <button className="cancel" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
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
                <button className="edit" onClick={() => handleEditClick(edu)}>
                  Edit
                </button>
                <button
                  className="delete"
                  onClick={() => handleDeleteEducation(edu.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}

        {showAddForm ? (
          <div className="admin-card">
            <input
              type="text"
              name="university"
              value={newEducation.university}
              onChange={handleNewEducationChange}
              placeholder="University"
            />
            <input
              type="text"
              name="degree"
              value={newEducation.degree}
              onChange={handleNewEducationChange}
              placeholder="Degree"
            />
            <input
              type="text"
              name="major"
              value={newEducation.major}
              onChange={handleNewEducationChange}
              placeholder="Major"
            />
            <input
              type="number"
              name="fromYear"
              value={newEducation.fromYear}
              onChange={handleNewEducationChange}
              placeholder="From Year"
            />
            <input
              type="number"
              name="toYear"
              value={newEducation.toYear}
              onChange={handleNewEducationChange}
              placeholder="To Year"
            />
            <textarea
              name="courses"
              value={newEducation.courses}
              onChange={handleNewEducationChange}
              placeholder="Relevant Courses"
              rows={2}
            />
            <div className="button-row">
              <button className="save" onClick={handleAddEducation}>
                Add
              </button>
              <button className="cancel" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add" onClick={() => setShowAddForm(true)}>
            Add Education
          </button>
        )}
      </section>

      <section className="admin-section">
        <h2>Skills</h2>
        <p className="admin-hint">
          Categories and the skills inside them appear on the About page in
          this order.
        </p>

        <OrderStatus status={status} saving={saving} />

        <datalist id="skill-type-options">
          {skillGroups.map((group) => (
            <option key={group.type} value={group.type} />
          ))}
        </datalist>

        {skillGroups.map((group, groupIndex) => (
          <div key={group.type} className="admin-skill-group">
            <div className="admin-item-head">
              <h3 className="admin-skill-group__title">{group.type}</h3>
              <ReorderButtons
                index={groupIndex}
                count={skillGroups.length}
                label={`category ${group.type}`}
                onMove={handleMoveGroup}
                disabled={saving}
              />
            </div>

            <ul className="admin-skill-list">
              {group.skills.map((skill, skillIndex) => (
                <li key={skill.id} className="admin-card">
                  {skill.id === editSkillId ? (
                    <>
                      <input
                        type="text"
                        name="name"
                        value={skillForm.name}
                        onChange={handleSkillFormChange}
                        placeholder="Skill Name"
                        aria-label="Skill name"
                      />
                      <input
                        type="text"
                        name="type"
                        list="skill-type-options"
                        value={skillForm.type}
                        onChange={handleSkillFormChange}
                        placeholder="Skill Category"
                        aria-label="Skill category"
                      />
                      <div className="button-row">
                        <button className="save" onClick={handleUpdateSkill}>
                          Save
                        </button>
                        <button className="cancel" onClick={cancelSkillEdit}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="admin-skill-row">
                      <strong>{skill.name}</strong>

                      <ReorderButtons
                        index={skillIndex}
                        count={group.skills.length}
                        label={skill.name}
                        onMove={(from, to) =>
                          handleMoveSkill(group, from, to)
                        }
                        disabled={saving}
                      />

                      <div className="button-row">
                        <button
                          className="edit"
                          onClick={() => startSkillEdit(skill)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() => deleteSkill(skill.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {showSkillAddForm ? (
          <div className="admin-card">
            <input
              type="text"
              name="name"
              value={newSkill.name}
              onChange={handleNewSkillChange}
              placeholder="Skill Name"
              aria-label="Skill name"
            />
            <input
              type="text"
              name="type"
              list="skill-type-options"
              value={newSkill.type}
              onChange={handleNewSkillChange}
              placeholder="Skill Category"
              aria-label="Skill category"
            />
            <div className="button-row">
              <button className="save" onClick={addSkill}>
                Add
              </button>
              <button
                className="cancel"
                onClick={() => setShowSkillAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button className="add" onClick={() => setShowSkillAddForm(true)}>
            Add Skill
          </button>
        )}
      </section>
    </main>
  )
}
