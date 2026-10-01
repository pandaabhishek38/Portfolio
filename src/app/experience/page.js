'use client'

import { useEffect, useState } from 'react'
import ExperienceCard from '../../components/ExperienceCard'
import { sortByDisplayOrder } from '../../utils/fetchJson'
import PageHeader from '../../components/PageHeader'
import './experience.css'

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/experience`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch experience: ${res.status}`)
        }

        return res.json()
      })
      .then((data) => {
        // Admin-controlled order (displayOrder, then id)
        const sortedExperiences = sortByDisplayOrder(data)

        setExperiences(sortedExperiences)
        setError(false)
      })
      .catch((err) => {
        console.error('API fetch error:', err)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <main className="experience-page">
      <PageHeader
        title="Experience"
        subtitle="Roles, teams, and the work I’ve done along the way."
      />

      {loading && (
        <ol
          className="experience-timeline experience-timeline--loading"
          aria-label="Loading experience"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <li
              key={index}
              className="experience-timeline__item"
              aria-hidden="true"
            >
              <span className="experience-timeline__dot" />

              <div className="experience-skeleton">
                <div className="experience-skeleton__eyebrow" />
                <div className="experience-skeleton__title" />
                <div className="experience-skeleton__org" />

                <div className="experience-skeleton__text">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {!loading && error && (
        <section className="experience-state experience-state--error">
          <h2>Unable to load experience</h2>

          <p>
            Something went wrong while fetching experience. Please try again
            later.
          </p>
        </section>
      )}

      {!loading && !error && experiences.length === 0 && (
        <section className="experience-state experience-state--empty">
          <h2>No experience yet</h2>

          <p>Experience will appear here once it has been added.</p>
        </section>
      )}

      {!loading && !error && experiences.length > 0 && (
        <ol className="experience-timeline">
          {experiences.map((exp) => (
            <li key={exp.id} className="experience-timeline__item">
              <span className="experience-timeline__dot" aria-hidden="true" />

              <ExperienceCard
                role={exp.role}
                company={exp.company}
                location={exp.location}
                period={exp.period}
                description={exp.description}
                logoUrl={exp.logoUrl}
                logoShape={exp.logoShape}
                logoZoom={exp.logoZoom}
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  )
}
