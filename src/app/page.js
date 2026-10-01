// src/app/page.js
import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import CtaPanel from '../components/CtaPanel'
import FeaturedProjects from '../components/home/FeaturedProjects'
import ExperienceSnapshot from '../components/home/ExperienceSnapshot'
import ToolkitStrip from '../components/home/ToolkitStrip'
import './home.css'

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/pandaabhishek38',
    Icon: FaGithub,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/abhishek-rabindra-panda/',
    Icon: FaLinkedin,
  },
]

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__content">
          <h1 id="home-hero-title" className="home-hero__title">
            Abhishek Panda
          </h1>

          <p className="home-hero__role">Software Engineer</p>

          <div className="home-hero__actions">
            <Link href="/projects" className="ui-button ui-button--primary">
              View Projects
            </Link>

            <Link href="/contact" className="ui-button ui-button--secondary">
              Get in Touch
            </Link>
          </div>

          <ul className="home-hero__social" aria-label="Social profiles">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="home-hero__social-link"
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="home-hero__media">
          <div className="home-hero__photo-frame">
            <Image
              src="https://i.imgur.com/yeghRA8.jpeg"
              alt="Portrait of Abhishek Panda"
              width={280}
              height={280}
              priority
              className="home-hero__photo"
            />
          </div>
        </div>
      </section>

      <ExperienceSnapshot />

      <FeaturedProjects />

      <ToolkitStrip />

      <div className="home-section">
        <CtaPanel
          id="home-cta"
          title="Have a role or project in mind?"
          text="I'm open to software engineering roles and collaborations. Send a message and I'll get back to you."
          href="/contact"
          label="Get in Touch"
        />
      </div>
    </main>
  )
}
