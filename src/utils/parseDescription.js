/**
 * Convert an admin-entered description into bullet items.
 *
 * One bullet per line; leading "-", "•" or "*" markers are stripped.
 * Shared by ProjectCard and ExperienceCard.
 */
export function parseDescription(description) {
  if (!description) return []

  if (Array.isArray(description)) {
    return description.filter(Boolean)
  }

  return String(description)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•*-]+/, '').trim())
    .filter(Boolean)
}
