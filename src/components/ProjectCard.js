'use client'

import { useState } from 'react'
import RichText from './RichText'
import {
  countUnits,
  parseRichText,
  truncateBlocks,
} from '../utils/richText'
import TechBadge, { parseTechStack } from './TechBadge'
import './ProjectCard.css'

export default function ProjectCard({
  title,
  techStack,
  description,
  githubLink,
}) {
  const [expanded, setExpanded] = useState(false)

  const technologies = parseTechStack(techStack)
  // Rich-text HTML, or legacy newline-separated text shown as bullets
  const descriptionBlocks = parseRichText(description, { legacy: 'list' })
  const descriptionUnits = countUnits(descriptionBlocks)

  const visibleTechnologies = technologies.slice(0, 9)
  const remainingTechnologies = Math.max(
    technologies.length - visibleTechnologies.length,
    0
  )

  const visibleDescription = expanded
    ? descriptionBlocks
    : truncateBlocks(descriptionBlocks, 2)

  const hasMoreDescription = descriptionUnits > 2

  return (
    <article
      className={`project-card${expanded ? ' project-card--expanded' : ''}`}
    >
      <div className="project-card__content">
        {/* Header */}
        <div className="project-card__header">
          <span className="project-card__eyebrow">PROJECT</span>

          <h2 className="project-card__title">{title}</h2>
        </div>

        {/* Technology badges */}
        {technologies.length > 0 && (
          <div
            className="project-card__tech"
            aria-label={`Technologies used in ${title}`}
          >
            {visibleTechnologies.map((technology) => (
              <TechBadge key={technology} technology={technology} />
            ))}

            {remainingTechnologies > 0 && (
              <span
                className="project-tech-badge project-tech-badge--more"
                title={`${remainingTechnologies} more technologies`}
              >
                +{remainingTechnologies}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <div className="project-card__description rich-text">
          {visibleDescription.length > 0 ? (
            <RichText blocks={visibleDescription} />
          ) : (
            <p className="project-card__no-description">
              No description available.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="project-card__footer">
          <div className="project-card__footer-left">
            {hasMoreDescription && (
              <button
                type="button"
                className="project-card__toggle"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
              >
                {expanded ? 'View Less' : 'View More'}
              </button>
            )}
          </div>

          <div className="project-card__actions">
            {githubLink ? (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__view"
                aria-label={`View ${title} project`}
              >
                <span>View Project</span>
              </a>
            ) : (
              <span className="project-card__view project-card__view--disabled">
                <span>View Project</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
