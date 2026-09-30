// src/app/about/page.js

import CtaPanel from '../../components/CtaPanel'
import RichText from '../../components/RichText'
import TechBadge from '../../components/TechBadge'
import { fetchJson, sortSkills } from '../../utils/fetchJson'
import { parseRichText } from '../../utils/richText'
import './AboutPage.css'

// Always render with fresh admin-edited data (as before, via no-store).
export const dynamic = 'force-dynamic'

/**
 * Loads summary, education and skills from the combined /api/about
 * endpoint. Never throws: a failed request yields `failed: true`
 * so the page still renders.
 */
async function getAboutData() {
  try {
    const data = await fetchJson('/api/about', { cache: 'no-store' })

    return {
      failed: false,
      summary:
        typeof data?.summary?.content === 'string' ? data.summary.content : '',
      education: Array.isArray(data?.education) ? data.education : [],
      skills: Array.isArray(data?.skills) ? data.skills : [],
    }
  } catch (err) {
    console.error('About fetch error:', err)

    return { failed: true, summary: '', education: [], skills: [] }
  }
}

/* Courses are stored as a comma-separated (or JSON array) string. */
function parseCourses(courses) {
  const text = String(courses || '').trim()
  if (!text) return []

  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return parsed.map((course) => String(course).trim()).filter(Boolean)
      }
    } catch {
      // Fall through to comma-separated parsing.
    }
  }

  return [
    ...new Set(
      text
        .split(',')
        .map((course) => course.trim())
        .filter(Boolean)
    ),
  ]
}

function sortEducation(rows) {
  return [...rows].sort(
    (a, b) =>
      (Number(b.toYear) || 0) - (Number(a.toYear) || 0) ||
      (Number(b.fromYear) || 0) - (Number(a.fromYear) || 0) ||
      a.id - b.id
  )
}

/* Group by type in the saved category order, then skill order. */
function groupSkills(rows) {
  const groups = new Map()

  for (const skill of sortSkills(rows)) {
    const name = String(skill?.name || '').trim()
    if (!name) continue

    const type = String(skill?.type || '').trim() || 'Other'

    if (!groups.has(type)) groups.set(type, [])
    groups.get(type).push({ id: skill.id, name })
  }

  return [...groups.entries()].map(([type, skills]) => ({ type, skills }))
}

export default async function AboutPage() {
  const { failed, summary, education, skills } = await getAboutData()

  // Rich-text HTML, or legacy plain text (blank lines = paragraphs)
  const summaryBlocks = parseRichText(summary, { legacy: 'paragraphs' })
  const educationItems = sortEducation(education)
  const skillGroups = groupSkills(skills)

  const hasContent =
    summaryBlocks.length > 0 ||
    educationItems.length > 0 ||
    skillGroups.length > 0

  return (
    <main className="about-page">
      <header className="about-page__header">
        <span className="about-page__eyebrow">ABOUT</span>

        <h1 className="about-page__title">About Me</h1>

        <p className="about-page__subtitle">
          Background, education, and the technologies I work with.
        </p>
      </header>

      {!hasContent && (
        <section className="about-state">
          <h2>
            {failed ? 'Unable to load profile details' : 'Nothing here yet'}
          </h2>

          <p>
            {failed
              ? 'Something went wrong while loading this page. Please try again later.'
              : 'Profile details will appear here once they have been added.'}
          </p>
        </section>
      )}

      {summaryBlocks.length > 0 && (
        <section className="about-summary rich-text" aria-label="Summary">
          <RichText blocks={summaryBlocks} />
        </section>
      )}

      {educationItems.length > 0 && (
        <section
          className="about-section"
          aria-labelledby="about-education-title"
        >
          <h2 id="about-education-title" className="about-section__title">
            Education
          </h2>

          <div className="about-education">
            {educationItems.map((edu) => {
              const courses = parseCourses(edu.courses)
              const details = [edu.major, edu.university]
                .filter(Boolean)
                .join(' · ')

              return (
                <article key={edu.id} className="education-card">
                  <span className="education-card__years">
                    {edu.fromYear} – {edu.toYear}
                  </span>

                  <h3 className="education-card__degree">{edu.degree}</h3>

                  {details && (
                    <p className="education-card__details">{details}</p>
                  )}

                  {courses.length > 0 && (
                    <div className="education-card__courses">
                      <h4 className="education-card__courses-title">
                        Relevant courses
                      </h4>

                      <ul className="education-card__course-list">
                        {courses.map((course) => (
                          <li key={course} className="education-card__course">
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {skillGroups.length > 0 && (
        <section className="about-section" aria-labelledby="about-skills-title">
          <h2 id="about-skills-title" className="about-section__title">
            Skills
          </h2>

          <div className="about-skills">
            {skillGroups.map((group) => (
              <div key={group.type} className="skill-group">
                <h3 className="skill-group__title">{group.type}</h3>

                <ul className="skill-group__list">
                  {group.skills.map((skill) => (
                    <li key={skill.id}>
                      <TechBadge
                        technology={skill.name}
                        showFallbackMark={false}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="about-section">
        <CtaPanel
          id="about-cta"
          title="Want to work together?"
          text="I'm open to software engineering roles and collaborations. Get in touch and I'll get back to you."
          href="/contact"
          label="Get in Touch"
        />
      </div>
    </main>
  )
}
