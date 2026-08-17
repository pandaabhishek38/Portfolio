'use client'

import { useEffect, useState } from 'react'
import ProjectCard from '../../components/ProjectCard'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

    fetch(`${baseURL}/api/projects`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch projects: ${res.status}`)
        }

        return res.json()
      })
      .then((data) => {
        const sortedProjects = [...data].sort((a, b) => a.id - b.id)

        setProjects(sortedProjects)
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
    <main className="projects-page">
      <header className="projects-page__header">
        <span className="projects-page__eyebrow">SELECTED WORK</span>

        <h1 className="projects-page__title">Projects</h1>

        <p className="projects-page__subtitle">
          A collection of software, data, and machine learning projects.
        </p>
      </header>

      {loading && (
        <div
          className="projects-grid projects-grid--loading"
          aria-label="Loading projects"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="project-skeleton" aria-hidden="true">
              <div className="project-skeleton__eyebrow" />
              <div className="project-skeleton__title" />

              <div className="project-skeleton__tech">
                <span />
                <span />
                <span />
              </div>

              <div className="project-skeleton__text">
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className="project-skeleton__footer" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <section className="projects-state projects-state--error">
          <h2>Unable to load projects</h2>

          <p>
            Something went wrong while fetching the projects. Please try again
            later.
          </p>
        </section>
      )}

      {!loading && !error && projects.length === 0 && (
        <section className="projects-state projects-state--empty">
          <h2>No projects yet</h2>

          <p>Projects will appear here once they have been added.</p>
        </section>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              techStack={project.stack}
              description={project.description}
              githubLink={project.github}
            />
          ))}
        </div>
      )}
    </main>
  )
}
