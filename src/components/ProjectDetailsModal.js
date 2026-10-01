'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiArrowUpRight, FiX } from 'react-icons/fi'
import RichText from './RichText'
import TechBadge, { parseTechStack } from './TechBadge'
import { parseRichText } from '../utils/richText'
import './ProjectDetailsModal.css'

const EXIT_MS = 160

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Full project details in an accessible modal dialog.
 *
 * Shows the complete description (no truncation) and every technology.
 * Renders into document.body so card transforms/overflow never affect it.
 * Closes on the X / Close buttons, Escape, or a click on the backdrop.
 * Focus moves into the dialog, stays inside while open, and returns to the
 * element that opened it.
 *
 * project: { title, stack, description, github } | null
 * Render with key={project id} so every opening starts with fresh state.
 */
export default function ProjectDetailsModal({ project, onClose }) {
  const titleId = useId()
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const openerRef = useRef(null)
  // A click closes the dialog only if the press also started on the backdrop
  // (so selecting text inside and releasing outside does not close it).
  const pressStartedOnBackdrop = useRef(false)
  const [closing, setClosing] = useState(false)

  const requestClose = useCallback(() => {
    if (closing) return
    if (prefersReducedMotion()) {
      onClose()
      return
    }
    setClosing(true)
    window.setTimeout(onClose, EXIT_MS)
  }, [closing, onClose])

  // Open: remember the opener, lock page scroll, focus the dialog.
  useEffect(() => {
    if (!project) return undefined

    openerRef.current = document.activeElement

    const { body, documentElement } = document
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }
    // Keep the page from shifting when the scrollbar disappears.
    const scrollbar = window.innerWidth - documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`

    closeButtonRef.current?.focus()

    return () => {
      body.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight

      const opener = openerRef.current
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [project])

  // Escape closes; Tab stays within the dialog.
  useEffect(() => {
    if (!project) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        requestClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !panelRef.current.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [project, requestClose])

  if (!project || typeof document === 'undefined') return null

  const technologies = [...new Set(parseTechStack(project.stack))]
  // Same parsing as the cards: rich-text HTML, or legacy lines as bullets.
  const descriptionBlocks = parseRichText(project.description, {
    legacy: 'list',
  })
  const href = String(project.github || '').trim()

  return createPortal(
    <div
      className={`project-modal${closing ? ' project-modal--closing' : ''}`}
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (
          pressStartedOnBackdrop.current &&
          event.target === event.currentTarget
        ) {
          requestClose()
        }
      }}
    >
      <div
        ref={panelRef}
        className="project-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="project-modal__header">
          <div className="project-modal__heading">
            <span className="project-modal__eyebrow">PROJECT</span>
            <h2 id={titleId} className="project-modal__title">
              {project.title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="project-modal__close"
            onClick={requestClose}
            aria-label="Close project details"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div
          className="project-modal__body"
          tabIndex={0}
          role="region"
          aria-label="Project details"
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
        </div>

        <footer className="project-modal__footer">
          <button
            type="button"
            className="ui-button ui-button--secondary project-modal__dismiss"
            onClick={requestClose}
          >
            Close
          </button>

          {href ? (
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
          )}
        </footer>
      </div>
    </div>,
    document.body
  )
}
