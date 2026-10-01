'use client'

import { useState } from 'react'
import Image from 'next/image'
import './ExperienceLogo.css'

/**
 * Two-letter monogram used when no logo is configured (or it fails to load):
 * "HDFC Bank" -> HB, "ChessWorld AI" -> CW, "Model Earth" -> ME, "Axitemus" -> AX.
 */
export function companyInitials(company) {
  const words = String(company || '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    // Split camelCase words ("ChessWorld" -> "Chess", "World")
    .flatMap((word) => word.split(/(?<=\p{Ll})(?=\p{Lu})/u))

  if (words.length === 0) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[1][0]).toUpperCase()
}

/** Same rule as the backend: https/http URLs or site-relative paths only. */
export function safeLogoSrc(url) {
  const value = String(url || '').trim()
  if (!value) return null

  if (/^https?:\/\/[^\s]+$/i.test(value) || /^\/(?!\/)\S*$/.test(value)) {
    return value
  }

  return null
}

/**
 * Compact company logo tile. Renders the configured logo when it loads,
 * otherwise a subtle monogram. Fixed size, so no layout shift either way.
 */
export default function ExperienceLogo({ logoUrl, company, size = 'md' }) {
  const src = safeLogoSrc(logoUrl)
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div
      className={`experience-logo experience-logo--${size} ${
        showImage ? 'experience-logo--image' : 'experience-logo--monogram'
      }`}
    >
      {showImage ? (
        <Image
          src={src}
          alt={company ? `${company} logo` : 'Company logo'}
          width={96}
          height={96}
          className="experience-logo__image"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="experience-logo__monogram" aria-hidden="true">
          {companyInitials(company)}
        </span>
      )}
    </div>
  )
}
