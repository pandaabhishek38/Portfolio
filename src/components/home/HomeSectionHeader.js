import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

export default function HomeSectionHeader({
  id,
  eyebrow,
  title,
  linkHref,
  linkLabel,
}) {
  return (
    <div className="home-section__header">
      <div>
        <span className="home-section__eyebrow">{eyebrow}</span>

        <h2 id={id} className="home-section__title">
          {title}
        </h2>
      </div>

      {linkHref && (
        <Link href={linkHref} className="home-section__link">
          {linkLabel}
          <FiArrowRight className="home-section__link-arrow" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
