'use client'

import { FiArrowUpRight } from 'react-icons/fi'
import TechBadge, { parseTechStack } from '../TechBadge'
import { firstUnitText, parseRichText } from '../../utils/richText'
import { onlyHomeFeatured, sortByHomeOrder } from '../../utils/fetchJson'
import HomeSectionHeader from './HomeSectionHeader'
import useOptionalList from './useOptionalList'

const FEATURED_COUNT = 3
const MAX_BADGES = 4

// Projects featured on Home (Admin -> Projects), in Home order, first three.
// Independent of the Projects page order.
const selectProjects = (rows) =>
  sortByHomeOrder(onlyHomeFeatured(rows)).slice(0, FEATURED_COUNT)

function toExternalHref(link) {
  const trimmed = String(link || '').trim()
  if (!trimmed) return ''

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function ProjectPreview({ project }) {
  const technologies = [...new Set(parseTechStack(project.stack))]
  const visibleTechnologies = technologies.slice(0, MAX_BADGES)
  const remaining = technologies.length - visibleTechnologies.length

  // First bullet / paragraph as plain text (compact preview)
  const summary = firstUnitText(
    parseRichText(project.description, { legacy: 'list' })
  )
  const href = toExternalHref(project.github)

  return (
    <article className="home-project">
      <h3 className="home-project__title">{project.title}</h3>

      {visibleTechnologies.length > 0 && (
        <div
          className="home-project__tech"
          aria-label={`Technologies used in ${project.title}`}
        >
          {visibleTechnologies.map((technology) => (
            <TechBadge key={technology} technology={technology} />
          ))}

          {remaining > 0 && (
            <span
              className="project-tech-badge project-tech-badge--more"
              title={`${remaining} more technologies`}
            >
              +{remaining}
            </span>
          )}
        </div>
      )}

      {summary && <p className="home-project__summary">{summary}</p>}

      {href && (
        <a
          className="home-project__link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          View project
          <span className="sr-only">
            : {project.title} (opens in a new tab)
          </span>
          <FiArrowUpRight
            className="home-project__link-arrow"
            aria-hidden="true"
          />
        </a>
      )}
    </article>
  )
}

export default function FeaturedProjects() {
  const { status, items } = useOptionalList(
    '/api/projects?featured=home',
    selectProjects
  )

  if (status === 'hidden') return null

  const loading = status === 'loading'

  return (
    <section
      className="home-section"
      aria-labelledby="home-projects-title"
      aria-busy={loading}
    >
      <HomeSectionHeader
        id="home-projects-title"
        eyebrow="SELECTED WORK"
        title="Featured projects"
        linkHref="/projects"
        linkLabel="See all projects"
      />

      <div className="home-projects">
        {loading
          ? Array.from({ length: FEATURED_COUNT }).map((_, index) => (
              <div
                key={`project-skeleton-${index}`}
                className="home-project home-project--skeleton"
                aria-hidden="true"
              >
                <span className="home-skeleton home-skeleton--title" />
                <span className="home-skeleton home-skeleton--badges" />
                <span className="home-skeleton home-skeleton--line" />
                <span className="home-skeleton home-skeleton--line-short" />
              </div>
            ))
          : items.map((project) => (
              <ProjectPreview key={project.id} project={project} />
            ))}
      </div>
    </section>
  )
}
