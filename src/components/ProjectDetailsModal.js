'use client'

import { useId } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import DetailsDialog from './DetailsDialog'
import RichText from './RichText'
import TechBadge, { parseTechStack } from './TechBadge'
import { parseRichText } from '../utils/richText'
import './ProjectDetailsModal.css'

/**
 * Full project details: complete description (no truncation) and every
 * technology. Behaviour (focus, Escape, backdrop, scroll lock) comes from
 * the shared DetailsDialog.
 *
 * project: { title, stack, description, github } | null
 * Render with key={project id} so every opening starts with fresh state.
 */
export default function ProjectDetailsModal({ project, onClose }) {
  const titleId = useId()

  if (!project) return null

  const technologies = [...new Set(parseTechStack(project.stack))]
  // Same parsing as the cards: rich-text HTML, or legacy lines as bullets.
  const descriptionBlocks = parseRichText(project.description, {
    legacy: 'list',
  })
  const href = String(project.github || '').trim()

  return (
    <DetailsDialog
      variant="project-modal"
      labelledBy={titleId}
      closeLabel="Close project details"
      bodyLabel="Project details"
      onClose={onClose}
      header={
        <>
          <span className="project-modal__eyebrow">PROJECT</span>
          <h2 id={titleId} className="project-modal__title">
            {project.title}
          </h2>
        </>
      }
      footer={
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-button ui-button--primary"
          >
            View Project
            <FiArrowUpRight aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="project-modal__no-link">No project link</span>
        )
      }
    >
      {technologies.length > 0 && (
        <div
          className="project-modal__tech"
          aria-label={`Technologies used in ${project.title}`}
        >
          {technologies.map((technology) => (
            <TechBadge key={technology} technology={technology} />
          ))}
        </div>
      )}

      <div className="project-modal__description rich-text">
        {descriptionBlocks.length > 0 ? (
          <RichText blocks={descriptionBlocks} />
        ) : (
          <p className="project-modal__empty">No description available.</p>
        )}
      </div>
    </DetailsDialog>
  )
}
