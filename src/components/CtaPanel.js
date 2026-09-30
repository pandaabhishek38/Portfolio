import Link from 'next/link'
import './CtaPanel.css'

/**
 * Restrained closing call-to-action used at the bottom of Home and About.
 */
export default function CtaPanel({ id, title, text, href, label }) {
  const headingId = `${id}-title`

  return (
    <section className="cta-panel" aria-labelledby={headingId}>
      <div className="cta-panel__text">
        <h2 id={headingId} className="cta-panel__title">
          {title}
        </h2>

        {text && <p className="cta-panel__body">{text}</p>}
      </div>

      <Link href={href} className="ui-button ui-button--primary">
        {label}
      </Link>
    </section>
  )
}
