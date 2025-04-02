'use client'
import { useEffect, useState } from 'react'
import ProjectCard from '@/components/ProjectCard'
import './ProjectsPage.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('http://localhost:5001/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error('API fetch error:', err))
  }, [])

  return (
    <main className="projects-page">
      <h1 className="projects-page__title">Projects</h1>
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
    </main>
  )
}
