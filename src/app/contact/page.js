'use client'

import { useEffect, useState } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import {
  FiArrowUpRight,
  FiLink,
  FiMail,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'
import ContactForm from '../../components/ContactForm'
import PageHeader from '../../components/PageHeader'
import './contact.css'

const CHANNEL_ICONS = {
  email: FiMail,
  phone: FiPhone,
  address: FiMapPin,
  location: FiMapPin,
  github: FaGithub,
  linkedin: FaLinkedin,
}

function withProtocol(link) {
  return /^[a-z][a-z0-9+.-]*:/i.test(link) ? link : `https://${link}`
}

/**
 * Work out how a ContactItem should be linked.
 * Uses item.url when present, otherwise the visible value.
 */
function getChannelLink(item) {
  const label = item.label.trim().toLowerCase()
  const value = item.value.trim()
  const target = (item.url || '').trim() || value

  if (label === 'email') {
    return {
      href: target.startsWith('mailto:') ? target : `mailto:${target}`,
      external: false,
    }
  }

  if (label === 'phone') {
    return {
      href: target.startsWith('tel:')
        ? target
        : `tel:${target.replace(/[^\d+]/g, '')}`,
      external: false,
    }
  }

  if (label === 'github' || label === 'linkedin') {
    return { href: withProtocol(target), external: true }
  }

  // Other items (e.g. Address) only link when an explicit URL is provided.
  if ((item.url || '').trim()) {
    return { href: withProtocol(target), external: true }
  }

  return null
}

function ContactChannel({ item }) {
  const Icon = CHANNEL_ICONS[item.label.trim().toLowerCase()] || FiLink
  const link = getChannelLink(item)

  const content = (
    <>
      <span className="contact-channel__icon" aria-hidden="true">
        <Icon />
      </span>

      <span className="contact-channel__text">
        <span className="contact-channel__label">{item.label}</span>
        <span className="contact-channel__value">{item.value}</span>
      </span>

      {link?.external && (
        <>
          <FiArrowUpRight
            className="contact-channel__external"
            aria-hidden="true"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </>
  )

  if (!link) {
    return <div className="contact-channel">{content}</div>
  }

  return (
    <a
      className="contact-channel contact-channel--link"
      href={link.href}
      {...(link.external
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {content}
    </a>
  )
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/contact-info`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch contact info: ${res.status}`)
        }

        return res.json()
      })
      .then((data) => {
        const visibleItems = (Array.isArray(data) ? data : [])
          .filter(
            (item) =>
              typeof item?.label === 'string' &&
              typeof item?.value === 'string' &&
              item.value.trim() !== ''
          )
          .sort((a, b) => a.id - b.id)

        setContactInfo(visibleItems)
        setError(false)
      })
      .catch((err) => {
        console.error('Contact info fetch error:', err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="contact-page">
      <PageHeader
        title="Let’s talk"
        subtitle="Open to new roles, collaborations, and questions. Reach out directly or send a message."
      />

      <div className="contact-layout">
        <section
          className="contact-channels"
          aria-labelledby="contact-channels-title"
        >
          <h2 id="contact-channels-title" className="contact-section-title">
            Reach me directly
          </h2>

          {loading && (
            <div
              className="contact-channels__list"
              aria-label="Loading contact details"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="contact-channel contact-channel--skeleton"
                  aria-hidden="true"
                >
                  <span className="contact-skeleton__icon" />

                  <span className="contact-skeleton__text">
                    <span />
                    <span />
                  </span>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="contact-channels__note">
              Contact details couldn&apos;t be loaded right now. You can still
              send a message using the form.
            </p>
          )}

          {!loading && !error && contactInfo.length === 0 && (
            <p className="contact-channels__note">
              The quickest way to reach me is the message form.
            </p>
          )}

          {!loading && !error && contactInfo.length > 0 && (
            <ul className="contact-channels__list">
              {contactInfo.map((item) => (
                <li key={item.id}>
                  <ContactChannel item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <ContactForm />
      </div>
    </main>
  )
}
