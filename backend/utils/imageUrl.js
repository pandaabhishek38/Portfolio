/*
 * Validation for admin-provided image URLs (e.g. Experience.logoUrl).
 * Only absolute http(s) URLs or site-relative paths ("/logos/x.png")
 * are accepted, so nothing like javascript: or data: can be stored.
 */

const MAX_URL_LENGTH = 2048

/**
 * Returns { value } on success or { error } when invalid.
 * - undefined -> { value: undefined } (field not sent: leave unchanged)
 * - null / blank string -> { value: null } (clear the logo)
 */
export function parseOptionalImageUrl(input) {
  if (input === undefined) return { value: undefined }
  if (input === null) return { value: null }
  if (typeof input !== 'string') return { error: 'Logo URL must be a string' }

  const url = input.trim()
  if (!url) return { value: null }

  if (url.length > MAX_URL_LENGTH) {
    return { error: 'Logo URL is too long' }
  }

  if (/^\/(?!\/)/.test(url)) return { value: url }

  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return { value: url }
    }
  } catch {
    // fall through
  }

  return { error: 'Logo URL must start with https:// (or be a site path like /logos/company.png)' }
}
