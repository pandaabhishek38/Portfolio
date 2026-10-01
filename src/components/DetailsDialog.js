'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import './DetailsDialog.css'

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
 * Shared shell for the public "details" modals (Projects, Experience).
 *
 * Owns all behaviour and structure: renders into document.body, locks page
 * scroll (without layout shift), moves focus to the X button, keeps Tab
 * inside the dialog, returns focus to the opener, and closes via X, Close,
 * Escape or a backdrop click. Header and footer stay fixed; only the body
 * scrolls.
 *
 * Each modal supplies its content and its own look via `variant`, a class
 * prefix applied alongside the generic `details-dialog` classes
 * (e.g. variant="project-modal" -> "project-modal__panel").
 *
 * Mounting = open. Render it only while an item is selected, keyed by the
 * item, so every opening starts fresh.
 */
export default function DetailsDialog({
  variant,
  labelledBy,
  closeLabel = 'Close details',
  bodyLabel = 'Details',
  header,
  footer,
  children,
  onClose,
}) {
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)
  const openerRef = useRef(null)
  // A click closes the dialog only if the press also started on the backdrop
  // (so selecting text inside and releasing outside does not close it).
  const pressStartedOnBackdrop = useRef(false)
  const [closing, setClosing] = useState(false)

  const cls = (part = '') => `details-dialog${part} ${variant}${part}`

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
  }, [])

  // Escape closes; Tab stays within the dialog.
  useEffect(() => {
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
  }, [requestClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`${cls()}${
        closing ? ` details-dialog--closing ${variant}--closing` : ''
      }`}
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
        className={cls('__panel')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <header className={cls('__header')}>
          <div className={cls('__heading')}>{header}</div>

          <button
            ref={closeButtonRef}
            type="button"
            className={cls('__close')}
            onClick={requestClose}
            aria-label={closeLabel}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div
          className={cls('__body')}
          tabIndex={0}
          role="region"
          aria-label={bodyLabel}
        >
          {children}
        </div>

        <footer className={cls('__footer')}>
          <button
            type="button"
            className={`ui-button ui-button--secondary ${cls('__dismiss')}`}
            onClick={requestClose}
          >
            Close
          </button>

          {footer}
        </footer>
      </div>
    </div>,
    document.body
  )
}
