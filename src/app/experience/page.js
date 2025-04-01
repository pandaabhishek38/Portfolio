import './experience.css'

export default function ExperiencePage() {
  return (
    <main className="experience-page">
      <h1 className="experience-heading">Experience</h1>

      <section className="experience-entry">
        <h2>Model Earth</h2>
        <p>
          <strong>Software Development Engineer</strong> | Sep 2024 – Present |
          Remote, USA
        </p>
        <ul>
          <li>
            Designed and developed scalable web applications with secure backend
            architectures for AI-driven platforms.
          </li>
          <li>
            Integrated Large Language Models (LLMs) and AI APIs for intelligent
            automation and real-time decision-making.
          </li>
          <li>
            Engineered high-performance APIs and cloud microservices to ensure
            seamless data exchange and model deployment.
          </li>
        </ul>
      </section>

      <section className="experience-entry">
        <h2>HDFC Bank</h2>
        <p>
          <strong>Risk Analytics Intern</strong> | May 2019 – Aug 2019 | Mumbai,
          India
        </p>
        <ul>
          <li>
            Enhanced TALEND workflows for customer credit data, streamlining
            transformation and utilization.
          </li>
          <li>
            Built a JAR-based solution that integrated with H2O.ai ML models to
            automate creditworthiness analysis.
          </li>
          <li>
            Applied ML insights to revolutionize personal loan qualification and
            improve risk management.
          </li>
        </ul>
      </section>
    </main>
  )
}
