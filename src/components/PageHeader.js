import './PageHeader.css'

/**
 * Shared page header for About, Projects, Experience and Contact:
 * one dominant heading, an optional supporting line, and a hairline
 * divider with a short green-to-blue accent.
 */
export default function PageHeader({ title, subtitle }) {
  return (
    <header className="page-header">
      <h1 className="page-header__title">{title}</h1>

      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </header>
  )
}
