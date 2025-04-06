// src/app/about/page.js

import './AboutPage.css'

export default async function AboutPage() {
  const summaryRes = await fetch('http://localhost:5001/api/about/summary', {
    cache: 'no-store',
  })
  const educationRes = await fetch(
    'http://localhost:5001/api/about/education',
    {
      cache: 'no-store',
    }
  )
  const skillsRes = await fetch('http://localhost:5001/api/about/skills', {
    cache: 'no-store',
  })

  const summaryData = await summaryRes.json()
  const educationData = await educationRes.json()
  const skillsData = await skillsRes.json()

  // Group skills by type
  const skillsByType = {}
  for (const skill of skillsData) {
    if (!skillsByType[skill.type]) {
      skillsByType[skill.type] = []
    }
    skillsByType[skill.type].push(skill.name)
  }

  return (
    <main className="about-container">
      <h1>About Me</h1>

      <div className="summary">
        {summaryData.map((item) => (
          <p key={item.id}>{item.content}</p>
        ))}
      </div>

      <div className="about-section">
        <h2>Education</h2>
        <div className="education-grid">
          {educationData.map((edu) => (
            <div key={edu.id} className="education-card">
              <p>
                <span>{edu.degree}</span> in <span>{edu.major}</span>
              </p>
              <p>
                {edu.university} ({edu.fromYear} - {edu.toYear})
              </p>
              {edu.courses && (
                <p>
                  <span>Relevant Courses:</span> {edu.courses}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>Skills</h2>
        {Object.keys(skillsByType).map((type) => (
          <div key={type}>
            <h3 style={{ marginTop: '1rem', color: '#ccc' }}>{type}</h3>
            <div className="skills-grid">
              {skillsByType[type].map((skill, index) => (
                <div key={index} className="skill-card">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
