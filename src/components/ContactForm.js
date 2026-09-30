'use client'

import { useRef, useState } from 'react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import './ContactForm.css'

const MESSAGE_MIN_LENGTH = 10
const MESSAGE_MAX_LENGTH = 2000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY_VALUES = { name: '', email: '', message: '', website: '' }
const FIELDS = ['name', 'email', 'message']

const GENERIC_ERROR =
  'Something went wrong while sending your message. Please try again.'
const NETWORK_ERROR =
  "Couldn't reach the server. Check your connection and try again."

/*
 * Same rules as the backend (/api/contact) validation.
 */
function validateField(field, values) {
  const value = values[field] || ''

  if (field === 'name') {
    if (!value.trim()) return 'Please enter your name.'
  }

  if (field === 'email') {
    if (!value.trim()) return 'Please enter your email address.'
    if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address.'
  }

  if (field === 'message') {
    if (!value.trim()) return 'Please enter a message.'
    if (value.trim().length < MESSAGE_MIN_LENGTH) {
      return `Your message should be at least ${MESSAGE_MIN_LENGTH} characters long.`
    }
  }

  return ''
}

function validateAll(values) {
  const errors = {}

  for (const field of FIELDS) {
    const error = validateField(field, values)
    if (error) errors[field] = error
  }

  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [submitError, setSubmitError] = useState('')

  const submittingRef = useRef(false)
  const fieldRefs = {
    name: useRef(null),
    email: useRef(null),
    message: useRef(null),
  }
  const successHeadingRef = useRef(null)

  const isSubmitting = status === 'submitting'

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValues = { ...values, [name]: value }

    setValues(nextValues)

    // Once a field is showing an error, re-check it as the user fixes it.
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValues),
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    if (!FIELDS.includes(name)) return

    setErrors((prev) => ({ ...prev, [name]: validateField(name, values) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submittingRef.current) return

    const nextErrors = validateAll(values)
    setErrors(nextErrors)

    const firstInvalid = FIELDS.find((field) => nextErrors[field])
    if (firstInvalid) {
      fieldRefs[firstInvalid].current?.focus()
      return
    }

    // Honeypot: real visitors never see or fill this field.
    if (values.website.trim()) {
      setValues(EMPTY_VALUES)
      setStatus('success')
      return
    }

    submittingRef.current = true
    setStatus('submitting')
    setSubmitError('')

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (res.ok) {
        setValues(EMPTY_VALUES)
        setErrors({})
        setStatus('success')
        requestAnimationFrame(() => successHeadingRef.current?.focus())
      } else {
        const serverError =
          typeof data?.error === 'string' &&
          data.error.trim() &&
          data.error.length <= 200
            ? data.error
            : GENERIC_ERROR

        setSubmitError(serverError)
        setStatus('error')
      }
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError(NETWORK_ERROR)
      setStatus('error')
    } finally {
      submittingRef.current = false
    }
  }

  const handleReset = () => {
    setValues(EMPTY_VALUES)
    setErrors({})
    setSubmitError('')
    setStatus('idle')
    requestAnimationFrame(() => fieldRefs.name.current?.focus())
  }

  const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined

  const messageLength = values.message.length
  const nearLimit = messageLength >= MESSAGE_MAX_LENGTH * 0.9

  return (
    <section className="contact-panel" aria-labelledby="contact-form-title">
      {status === 'success' ? (
        <div className="contact-success">
          <FiCheckCircle className="contact-success__icon" aria-hidden="true" />

          <h2
            id="contact-form-title"
            className="contact-success__title"
            ref={successHeadingRef}
            tabIndex={-1}
          >
            Message sent
          </h2>

          <p className="contact-success__text">
            Thanks — I&apos;ll get back to you soon.
          </p>

          <button
            type="button"
            className="contact-success__again"
            onClick={handleReset}
          >
            Send another message
          </button>
        </div>
      ) : (
        <>
          <h2 id="contact-form-title" className="contact-panel__title">
            Send a message
          </h2>

          <p className="contact-panel__subtitle">
            All fields are required.
          </p>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSubmitting}
          >
            {/* Name */}
            <div className="contact-field">
              <label htmlFor="contact-name" className="contact-field__label">
                Name
              </label>

              <input
                ref={fieldRefs.name}
                id="contact-name"
                type="text"
                name="name"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy(
                  errors.name && 'contact-name-error'
                )}
                className="contact-field__input"
              />

              {errors.name && (
                <p id="contact-name-error" className="contact-field__error">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="contact-field">
              <label htmlFor="contact-email" className="contact-field__label">
                Email
              </label>

              <input
                ref={fieldRefs.email}
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy(
                  errors.email && 'contact-email-error'
                )}
                className="contact-field__input"
              />

              {errors.email && (
                <p id="contact-email-error" className="contact-field__error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="contact-field">
              <label
                htmlFor="contact-message"
                className="contact-field__label"
              >
                Message
              </label>

              <textarea
                ref={fieldRefs.message}
                id="contact-message"
                name="message"
                rows={6}
                maxLength={MESSAGE_MAX_LENGTH}
                value={values.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={describedBy(
                  'contact-message-hint',
                  errors.message && 'contact-message-error'
                )}
                className="contact-field__input contact-field__input--textarea"
              />

              <div className="contact-field__meta">
                <span id="contact-message-hint">
                  At least {MESSAGE_MIN_LENGTH} characters.
                </span>

                <span
                  className={`contact-field__count${
                    nearLimit ? ' contact-field__count--near' : ''
                  }`}
                >
                  {messageLength} / {MESSAGE_MAX_LENGTH}
                </span>
              </div>

              {errors.message && (
                <p id="contact-message-error" className="contact-field__error">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Honeypot: hidden from people and assistive tech */}
            <div className="contact-form__hp" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={values.website}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="contact-form__submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </>
      )}

      {/* Status announcements */}
      <div className="contact-form__status" aria-live="polite">
        {status === 'error' && submitError && (
          <p className="contact-form__alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{submitError}</span>
          </p>
        )}

        {status === 'success' && (
          <p className="sr-only">
            Your message has been sent. Thanks — I&apos;ll get back to you soon.
          </p>
        )}
      </div>
    </section>
  )
}
