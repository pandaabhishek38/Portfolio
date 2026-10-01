'use client'

import ExperienceLogo from './ExperienceLogo'
import RichText from './RichText'
import { countUnits, parseRichText, truncateBlocks } from '../utils/richText'
import { isCurrentPeriod } from '../utils/period'
import './ExperienceCard.css'

const INITIAL_BULLETS = 3

export default function ExperienceCard({
  role,
  company,
  location,
  period,
  description,
  logoUrl,
  logoShape,
  logoZoom,
  onViewMore,
}) {
  // Rich-text HTML, or legacy newline-separated text shown as bullets
  const descriptionBlocks = parseRichText(description, { legacy: 'list' })
  const descriptionUnits = countUnits(descriptionBlocks)

  // Cards always show a short preview; the full entry opens in a modal.
  const visibleDescription = truncateBlocks(descriptionBlocks, INITIAL_BULLETS)

  const hasMoreDescription = descriptionUnits > INITIAL_BULLETS
  const isCurrent = isCurrentPeriod(period)

  return (
    <article className="experience-card">
      <div className="experience-card__content">
        {/* Header: logo (or monogram) beside period, role and company */}
        <div className="experience-card__header">
          <ExperienceLogo
            size="lg"
            logoUrl={logoUrl}
            company={company}
            shape={logoShape}
            zoom={logoZoom}
          />

          <div className="experience-card__heading">
            {(period || isCurrent) && (
              <div className="experience-card__meta">
                {period && (
                  <span className="experience-card__eyebrow">{period}</span>
                )}

                {isCurrent && <span className="ui-pill">Current</span>}
              </div>
            )}

            <h2 className="experience-card__title">{role}</h2>

            {(company || location) && (
              <p className="experience-card__org">
                {company && (
                  <span className="experience-card__company">{company}</span>
                )}

                {location && (
                  <span className="experience-card__location">
                    {company ? ' · ' : ''}
                    {location}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="experience-card__body">
          {/* Description */}
          <div className="experience-card__description rich-text">
            {visibleDescription.length > 0 ? (
              <RichText blocks={visibleDescription} />
            ) : (
              <p className="experience-card__no-description">
                No description available.
              </p>
            )}
          </div>

          {/* View More: opens the full entry in the details modal */}
          {hasMoreDescription && onViewMore && (
            <div className="experience-card__toggle-row">
              <button
                type="button"
                className="experience-card__toggle"
                onClick={onViewMore}
                aria-haspopup="dialog"
                aria-label={`View more about ${role}${company ? ` at ${company}` : ''}`}
              >
                View More
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
