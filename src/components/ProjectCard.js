import { useState } from 'react'
import './ProjectCard.css'

export default function ProjectCard({
  title,
  techStack,
  description,
  githubLink,
}) {
  const [expanded, setExpanded] = useState(false)

  const previewLength = 250
  const shouldTruncate = description.length > previewLength
  const visibleText = expanded
    ? description
    : description.slice(0, previewLength) + (shouldTruncate ? '...' : '')

  return (
    <div className="project-card">
      <h2 className="project-card__title">{title}</h2>
      <p className="project-card__tech">{techStack}</p>
      <p
        className="project-card__desc"
        dangerouslySetInnerHTML={{
          __html: visibleText.replace(/\n/g, '<br />'),
        }}
      ></p>

      <div className="project-card__footer">
        {shouldTruncate && (
          <span
            className="project-card__toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? 'View Less ▲' : 'View More ▼'}
          </span>
        )}

        {githubLink && (
          <a
            className="project-card__github"
            href={githubLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            View →
          </a>
        )}
      </div>
    </div>
  )
}
