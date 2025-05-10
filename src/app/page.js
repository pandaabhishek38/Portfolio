// src/app/page.js
import Image from 'next/image'
import './home.css'

export default function HomePage() {
  return (
    <main className="homepage">
      <section className="hero">
        <div className="hero__image-wrapper">
          <Image
            src="https://i.imgur.com/yeghRA8.jpeg"
            alt="Abhishek Panda"
            width={220}
            height={220}
            className="hero__image"
          />
        </div>
        <div className="hero__content">
          <h1 className="hero__title">Hey, I&apos;m Abhishek 👋</h1>
          <p className="hero__subtitle">
            Software Engineer | Full Stack Developer | ML in Production
          </p>
          <a href="/projects" className="hero__cta">
            View My Work →
          </a>
        </div>
      </section>
    </main>
  )
}
