'use client'

import { useState } from 'react'
import './ProjectCard.css'

/*
 * Small, dependency-free technology marks.
 * These are intentionally simple so adding an unmapped technology
 * never breaks the build.
 */
const TECH_META = {
  HTML: { mark: '</>', className: 'html' },
  HTML5: { mark: '</>', className: 'html' },

  CSS: { mark: '#', className: 'css' },
  CSS3: { mark: '#', className: 'css' },

  JavaScript: { mark: 'JS', className: 'javascript' },
  TypeScript: { mark: 'TS', className: 'typescript' },

  'Node.js': { mark: 'N', className: 'node' },
  'Express.js': { mark: 'E', className: 'express' },

  React: { mark: '⚛', className: 'react' },
  'Next.js': { mark: 'N', className: 'next' },

  Python: { mark: 'Py', className: 'python' },
  Java: { mark: 'J', className: 'java' },
  'C++': { mark: 'C++', className: 'cpp' },
  C: { mark: 'C', className: 'c' },
  'C#': { mark: 'C#', className: 'csharp' },
  Go: { mark: 'Go', className: 'go' },
  PHP: { mark: 'PHP', className: 'php' },

  MySQL: { mark: 'SQL', className: 'mysql' },
  PostgreSQL: { mark: 'PG', className: 'postgresql' },
  MongoDB: { mark: 'M', className: 'mongodb' },
  Oracle: { mark: 'DB', className: 'oracle' },

  Docker: { mark: '◇', className: 'docker' },
  Kubernetes: { mark: 'K8s', className: 'kubernetes' },

  AWS: { mark: 'AWS', className: 'aws' },
  Azure: { mark: 'AZ', className: 'azure' },
  Vercel: { mark: '▲', className: 'vercel' },

  TensorFlow: { mark: 'TF', className: 'tensorflow' },
  PyTorch: { mark: 'PT', className: 'pytorch' },
  Keras: { mark: 'K', className: 'keras' },
  'scikit-learn': { mark: 'sk', className: 'sklearn' },

  Django: { mark: 'D', className: 'django' },
  Flask: { mark: 'F', className: 'flask' },

  Prisma: { mark: 'P', className: 'prisma' },
  Supabase: { mark: 'S', className: 'supabase' },

  Git: { mark: '◆', className: 'git' },
  GitHub: { mark: 'GH', className: 'github' },

  OpenAI: { mark: 'AI', className: 'openai' },
  LangChain: { mark: 'LC', className: 'langchain' },

  Twilio: { mark: 'T', className: 'twilio' },
}

/**
 * Gets metadata for a technology without ever throwing an error.
 * Unknown technologies simply receive a generic text mark.
 */
function getTechMeta(technology) {
  const normalized = String(technology || '').trim()

  return (
    TECH_META[normalized] || {
      mark: normalized.slice(0, 2).toUpperCase() || '?',
      className: 'generic',
    }
  )
}

/**
 * Convert the stack into individual technologies.
 * Supports the existing comma-separated database format.
 */
function parseTechStack(stack) {
  if (!stack) return []

  if (Array.isArray(stack)) {
    return stack.map((tech) => String(tech).trim()).filter(Boolean)
  }

  return String(stack)
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean)
}

/**
 * Convert the existing description into bullet items.
 *
 * We do not introduce highlights/metrics/category fields.
 * Existing admin-entered description remains the source of truth.
 */
function parseDescription(description) {
  if (!description) return []

  if (Array.isArray(description)) {
    return description.filter(Boolean)
  }

  return String(description)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•*-]+/, '').trim())
    .filter(Boolean)
}

export default function ProjectCard({
  title,
  techStack,
  description,
  githubLink,
}) {
  const [expanded, setExpanded] = useState(false)

  const technologies = parseTechStack(techStack)
  const descriptionItems = parseDescription(description)

  const visibleTechnologies = technologies.slice(0, 9)
  const remainingTechnologies = Math.max(
    technologies.length - visibleTechnologies.length,
    0
  )

  const visibleDescription = expanded
    ? descriptionItems
    : descriptionItems.slice(0, 2)

  const hasMoreDescription = descriptionItems.length > 2

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
            {visibleTechnologies.map((technology) => {
              const meta = getTechMeta(technology)

              return (
                <span
                  key={technology}
                  className={`project-tech-badge project-tech-badge--${meta.className}`}
                  title={technology}
                >
                  <span className="project-tech-badge__mark" aria-hidden="true">
                    {meta.mark}
                  </span>

                  <span className="project-tech-badge__name">{technology}</span>
                </span>
              )
            })}

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
        <div className="project-card__description">
          {visibleDescription.length > 0 ? (
            <ul>
              {visibleDescription.map((item, index) => (
                <li key={`${title}-description-${index}`}>{item}</li>
              ))}
            </ul>
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
