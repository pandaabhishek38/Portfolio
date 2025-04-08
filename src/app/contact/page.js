'use client'

import { useEffect, useState } from 'react'
import './contact.css'

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/contact-info`)
      .then((res) => res.json())
      .then((data) => setContactInfo(data))
      .catch((err) => console.error('Contact info fetch error:', err))
  }, [])

  const toggleForm = () => {
    setShowForm((prev) => !prev)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setStatus('All fields are required ❌')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setStatus('Please enter a valid email address ❌')
      return
    }

    if (formData.message.trim().length < 10) {
      setStatus('Message should be at least 10 characters long ❌')
      return
    }

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('Message sent successfully ✅')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setStatus(data.error || 'Failed to send message ❌')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setStatus('Something went wrong ❌')
    }
  }

  return (
    <main className="contact-page">
      <h1 className="contact-title">Contact Me</h1>
      <p>You can reach me through any of the following ways:</p>

      <ul className="contact-info">
        {contactInfo.map((item) => (
          <li key={item.id}>
            <strong>{item.label}:</strong>{' '}
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </li>
        ))}
      </ul>

      <button className="toggle-form-btn" onClick={toggleForm}>
        {showForm ? 'Hide Message Form' : 'Send Me a Message'}
      </button>

      {showForm && (
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            Your Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Your Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Your Message:
            <textarea
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="submit-btn">
            Send
          </button>
        </form>
      )}

      {status && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>
      )}
    </main>
  )
}
