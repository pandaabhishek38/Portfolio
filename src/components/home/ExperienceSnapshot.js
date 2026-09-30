'use client'

import { sortByDisplayOrder } from '../../utils/fetchJson'
import { isCurrentPeriod } from '../../utils/period'
import HomeSectionHeader from './HomeSectionHeader'
import useOptionalList from './useOptionalList'

const SNAPSHOT_COUNT = 2

// Same order as the Experience page (admin display order), first two.
const selectExperience = (rows) =>
  sortByDisplayOrder(rows).slice(0, SNAPSHOT_COUNT)

export default function ExperienceSnapshot() {
  const { status, items } = useOptionalList(
    '/api/experience',
    selectExperience
  )

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

                <div className="home-timeline__row">
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
              </li>
            ))}
      </ol>
    </section>
  )
}
