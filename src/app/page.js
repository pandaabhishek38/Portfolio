import './home.css'

export default function HomePage() {
  return (
    <main className="homepage">
      <section className="hero">
        <h1 className="hero__title">Hey, I'm Abhishek 👋</h1>
        <p className="hero__subtitle">
          Software Engineer | Backend Enthusiast | ML Explorer
        </p>
        <a href="/projects" className="hero__cta">
          View My Work →
        </a>
      </section>
    </main>
  )
}
