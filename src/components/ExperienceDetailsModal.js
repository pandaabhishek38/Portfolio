'use client'

import { useId } from 'react'
import DetailsDialog from './DetailsDialog'
import ExperienceLogo from './ExperienceLogo'
import RichText from './RichText'
import { parseRichText } from '../utils/richText'
import { isCurrentPeriod } from '../utils/period'
import './ExperienceDetailsModal.css'

/**
 * Full experience entry: logo (saved shape/zoom), period, Current status,
 * role, company, location and the complete description. Behaviour (focus,
 * Escape, backdrop, scroll lock) comes from the shared DetailsDialog.
 *
 * experience: { role, company, location, period, description,
 *               logoUrl, logoShape, logoZoom } | null
 * Render with key={experience id} so every opening starts with fresh state.
 */
export default function ExperienceDetailsModal({ experience, onClose }) {
  const titleId = useId()

  if (!experience) return null

  const { role, company, location, period, description } = experience
  // Same parsing as the cards: rich-text HTML, or legacy lines as bullets.
  const descriptionBlocks = parseRichText(description, { legacy: 'list' })
  const isCurrent = isCurrentPeriod(period)

  return (
    <DetailsDialog
      variant="experience-modal"
      labelledBy={titleId}
      closeLabel="Close experience details"
      bodyLabel="Experience details"
      onClose={onClose}
      header={
        <div className="experience-modal__identity">
          <ExperienceLogo
            size="lg"
            logoUrl={experience.logoUrl}
            company={company}
            shape={experience.logoShape}
            zoom={experience.logoZoom}
          />

          <div className="experience-modal__heading-text">
            {(period || isCurrent) && (
              <div className="experience-modal__meta">
                {period && (
                  <span className="experience-modal__period">{period}</span>
                )}
                {isCurrent && <span className="ui-pill">Current</span>}
              </div>
            )}

            <h2 id={titleId} className="experience-modal__title">
              {role}
            </h2>

            {(company || location) && (
              <p className="experience-modal__org">
                {company && (
                  <span className="experience-modal__company">{company}</span>
                )}
                {location && (
                  <span className="experience-modal__location">
                    {company ? ' · ' : ''}
                    {location}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      }
    >
      <div className="experience-modal__description rich-text">
        {descriptionBlocks.length > 0 ? (
          <RichText blocks={descriptionBlocks} />
        ) : (
          <p className="experience-modal__empty">No description available.</p>
        )}
      </div>
    </DetailsDialog>
  )
}
