'use client'

import { FiMapPin } from 'react-icons/fi'
import ExperienceLogo from '../ExperienceLogo'
import TechBadge from '../TechBadge'
import { sortByDisplayOrder } from '../../utils/fetchJson'
import { isCurrentPeriod } from '../../utils/period'
import { mentionedTechnologies } from '../../utils/techMentions'
import HomeSectionHeader from './HomeSectionHeader'
import useOptionalList from './useOptionalList'

const SNAPSHOT_COUNT = 2
const MAX_BADGES = 3

// Same order as the Experience page (admin display order), first two.
const selectExperience = (rows) =>
  sortByDisplayOrder(rows).slice(0, SNAPSHOT_COUNT)

/*
 * Right side of a Recent Roles row: company logo (saved shape/zoom),
 * location, and up to 3 technologies the role description mentions.
 * Built only from existing Experience data.
 */
function RoleSummary({ experience }) {
  const technologies = mentionedTechnologies(experience.description, MAX_BADGES)

  return (
    <div className="home-timeline__aside">
      <ExperienceLogo
        size="lg"
        logoUrl={experience.logoUrl}
        company={experience.company}
        shape={experience.logoShape}
        zoom={experience.logoZoom}
      />

      {(experience.location || technologies.length > 0) && (
        <div className="home-timeline__facts">
          {experience.location && (
            <p className="home-timeline__location">
              <FiMapPin aria-hidden="true" />
              <span>{experience.location}</span>
            </p>
          )}

          {technologies.length > 0 && (
            <ul
              className="home-timeline__tech"
              aria-label={`Technologies used at ${experience.company}`}
            >
              {technologies.map((technology) => (
                <li key={technology}>
                  <TechBadge technology={technology} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function ExperienceSnapshot() {
  const { status, items } = useOptionalList('/api/experience', selectExperience)

  if (status === 'hidden') return null

  const loading = status === 'loading'

  return (
    <section
      className="home-section"
      aria-labelledby="home-experience-title"
      aria-busy={loading}
    >
      <HomeSectionHeader
        id="home-experience-title"
        eyebrow="EXPERIENCE"
        title="Recent roles"
        linkHref="/experience"
        linkLabel="View full experience"
      />

      <ol className="home-timeline">
        {loading
          ? Array.from({ length: SNAPSHOT_COUNT }).map((_, index) => (
              <li
                key={`experience-skeleton-${index}`}
                className="home-timeline__item"
                aria-hidden="true"
              >
                <span className="home-timeline__dot home-timeline__dot--muted" />

                <div className="home-timeline__row">
                  <span className="home-skeleton home-skeleton--eyebrow" />
                  <span className="home-skeleton home-skeleton--title" />
                  <span className="home-skeleton home-skeleton--line-short" />
                </div>
              </li>
            ))
          : items.map((exp) => (
              <li key={exp.id} className="home-timeline__item">
                <span className="home-timeline__dot" aria-hidden="true" />

                <div className="home-timeline__row home-timeline__row--split">
                  <div className="home-timeline__main">
                    <div className="home-timeline__meta">
                      {exp.period && (
                        <span className="home-timeline__period">
                          {exp.period}
                        </span>
                      )}

                      {isCurrentPeriod(exp.period) && (
                        <span className="ui-pill">Current</span>
                      )}
                    </div>

                    <h3 className="home-timeline__role">{exp.role}</h3>

                    {exp.company && (
                      <p className="home-timeline__company">{exp.company}</p>
                    )}
                  </div>

                  <RoleSummary experience={exp} />
                </div>
              </li>
            ))}
      </ol>
    </section>
  )
}
