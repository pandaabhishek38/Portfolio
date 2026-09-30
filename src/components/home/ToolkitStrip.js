'use client'

import TechBadge, { hasTechMeta } from '../TechBadge'
import { sortSkills } from '../../utils/fetchJson'
import HomeSectionHeader from './HomeSectionHeader'
import useOptionalList from './useOptionalList'

const TOOLKIT_COUNT = 12

/*
 * Representative skills: de-duplicated by name, keeping the admin order,
 * with technologies that have a dedicated badge mark listed first.
 */
const selectSkills = (rows) => {
  const seen = new Set()
  const unique = []

  for (const skill of sortSkills(rows)) {
    const name = String(skill?.name || '').trim()
    const key = name.toLowerCase()

    if (!name || seen.has(key)) continue

    seen.add(key)
    unique.push({ id: skill.id, name })
  }

  const mapped = unique.filter((skill) => hasTechMeta(skill.name))
  const unmapped = unique.filter((skill) => !hasTechMeta(skill.name))

  return [...mapped, ...unmapped].slice(0, TOOLKIT_COUNT)
}

const SKELETON_WIDTHS = [88, 72, 104, 64, 96, 80, 70, 92]

export default function ToolkitStrip() {
  const { status, items } = useOptionalList('/api/about/skills', selectSkills)

  if (status === 'hidden') return null

  const loading = status === 'loading'

  return (
    <section
      className="home-section"
      aria-labelledby="home-toolkit-title"
      aria-busy={loading}
    >
      <HomeSectionHeader
        id="home-toolkit-title"
        eyebrow="TOOLKIT"
        title="Technologies I work with"
        linkHref="/about"
        linkLabel="View all skills"
      />

      {loading ? (
        <div className="home-toolkit" aria-hidden="true">
          {SKELETON_WIDTHS.map((width) => (
            <span
              key={`toolkit-skeleton-${width}`}
              className="home-skeleton home-skeleton--badge"
              style={{ width }}
            />
          ))}
        </div>
      ) : (
        <ul className="home-toolkit">
          {items.map((skill) => (
            <li key={skill.id}>
              <TechBadge technology={skill.name} showFallbackMark={false} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
