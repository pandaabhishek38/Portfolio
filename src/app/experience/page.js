'use client'
import './experience.css'
import { useEffect, useState } from 'react'

export default function ExperiencePage() {
  const [experiences, setExperiences] = useState([])

  useEffect(() => {
    fetch('http://localhost:5001/api/experience')
      .then((res) => res.json())
      .then((data) => setExperiences(data))
      .catch((err) => console.error('API fetch error:', err))
  }, [])

  return (
    <main className="experience-page">
      <h1 className="experience-heading">Experience</h1>

      {experiences.map((exp, idx) => (
        <section className="experience-entry" key={idx}>
          <h2>{exp.company}</h2>
          <p>
            <strong>{exp.role}</strong> | {exp.period} | {exp.location}
          </p>
          <ul>
            {exp.bullets.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
