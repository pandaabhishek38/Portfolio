import { TECH_META } from '../components/TechBadge'
import { blocksToText, parseRichText } from './richText'

// Too ambiguous to detect reliably in free text ("C", "Go").
const SKIP = new Set(['C', 'Go'])

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const MATCHERS = Object.keys(TECH_META)
  .filter((name) => !SKIP.has(name))
  .map((name) => ({
    name,
    // Case-sensitive, not part of a longer word / name (Node.js, C++, C#)
    pattern: new RegExp(`(?<![\\w.+#-])${escapeRegExp(name)}(?![\\w+#-])`),
  }))

/**
 * Technologies (known badge names) that a description actually mentions,
 * in order of first mention. Used for compact summaries; never invents data.
 */
export function mentionedTechnologies(description, limit = 3) {
  const text = blocksToText(parseRichText(description, { legacy: 'list' }))
  if (!text) return []

  const found = []
  const seenClasses = new Set()

  for (const { name, pattern } of MATCHERS) {
    const match = pattern.exec(text)
    if (!match) continue

    // HTML / HTML5 etc. share a badge style: keep one of each.
    const className = TECH_META[name].className
    if (seenClasses.has(className)) continue
    seenClasses.add(className)

    found.push({ name, index: match.index })
  }

  return found
    .sort((a, b) => a.index - b.index)
    .slice(0, limit)
    .map((item) => item.name)
}
