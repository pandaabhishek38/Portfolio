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

  // New function to format bullet points
  const formatDescription = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('-->')) {
        return (
          <li
            key={index}
            style={{ marginLeft: '20px', listStyleType: 'circle' }}
          >
            {line.replace('-->', '').trim()}
          </li>
        )
      }
      if (line.startsWith('-')) {
        return (
          <li key={index} style={{ marginLeft: '0px', listStyleType: 'disc' }}>
            {line.replace('-', '').trim()}
          </li>
        )
      }
      return (
        <p key={index} style={{ marginLeft: '0px' }}>
          {line}
        </p>
      )
    })
  }

  return (
    <div className="project-card">
      <h2 className="project-card__title">{title}</h2>
      <p className="project-card__tech">{techStack}</p>
      <ul className="project-card__desc">{formatDescription(visibleText)}</ul>

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
