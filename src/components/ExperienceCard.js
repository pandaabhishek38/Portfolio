'use client'

import { useState } from 'react'
import RichText from './RichText'
import {
  countUnits,
  parseRichText,
  truncateBlocks,
} from '../utils/richText'
import { isCurrentPeriod } from '../utils/period'
import './ExperienceCard.css'

const INITIAL_BULLETS = 3

export default function ExperienceCard({
  role,
  company,
  location,
  period,
  description,
}) {
  const [expanded, setExpanded] = useState(false)

  // Rich-text HTML, or legacy newline-separated text shown as bullets
  const descriptionBlocks = parseRichText(description, { legacy: 'list' })
  const descriptionUnits = countUnits(descriptionBlocks)

  const visibleDescription = expanded
    ? descriptionBlocks
    : truncateBlocks(descriptionBlocks, INITIAL_BULLETS)

  const hasMoreDescription = descriptionUnits > INITIAL_BULLETS
  const isCurrent = isCurrentPeriod(period)

  return (
    <article
      className={`experience-card${expanded ? ' experience-card--expanded' : ''}`}
    >
      <div className="experience-card__content">
        {/* Header */}
        <div className="experience-card__header">
          {(period || isCurrent) && (
            <div className="experience-card__meta">
              {period && (
                <span className="experience-card__eyebrow">{period}</span>
              )}

              {isCurrent && (
                <span className="ui-pill">Current</span>
              )}
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

        {/* View More / View Less */}
        {hasMoreDescription && (
          <div className="experience-card__toggle-row">
            <button
              type="button"
              className="experience-card__toggle"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
            >
              {expanded ? 'View Less' : 'View More'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
