import { parseDocument } from 'htmlparser2'
import { parseDescription } from './parseDescription'

/*
 * Rich-text content model shared by the public pages and the admin.
 *
 * Stored values are either:
 *   - sanitized HTML produced by the admin editor, or
 *   - legacy plain text (newline separated).
 *
 * A value is HTML only when it starts with a block-level tag (same rule
 * as backend/utils/richText.js). Plain text is never interpreted as HTML.
 *
 * HTML is parsed into a small allowlisted tree, rendered by
 * components/RichText.js without dangerouslySetInnerHTML:
 *
 *   Block:  { type: 'p' | 'h3' | 'h4', children: Inline[] }
 *           { type: 'ul' | 'ol', items: ListItem[] }
 *   ListItem: { children: Inline[], lists: Block[] (nested ul/ol) }
 *   Inline: { type: 'text', text } | { type: 'br' }
 *           { type: 'strong' | 'em' | 'u', children: Inline[] }
 *           { type: 'a', href, children: Inline[] }
 */

const RICH_HTML_PATTERN = /^\s*<(p|h[1-6]|ul|ol|div|blockquote)[\s>]/i

export function isRichHtml(value) {
  return typeof value === 'string' && RICH_HTML_PATTERN.test(value)
}

// Removed together with their content.
const DROPPED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'svg',
  'math',
  'textarea',
  'select',
  'option',
  'button',
  'head',
  'title',
  'meta',
  'link',
])

const INLINE_MARKS = { strong: 'strong', b: 'strong', em: 'em', i: 'em', u: 'u' }
const HEADINGS = { h1: 'h3', h2: 'h3', h3: 'h3', h4: 'h4', h5: 'h4', h6: 'h4' }
const CONTAINERS = new Set(['div', 'blockquote', 'section', 'article', 'body'])
const SAFE_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel'])

/**
 * Returns a safe href, or null when the URL must not be linked.
 * Allows http(s), mailto, tel and site-relative paths only.
 */
export function safeHref(raw) {
  // Control characters and whitespace can hide a "javascript:" scheme.
  const cleaned = String(raw || '').replace(/[\u0000-\u001F\u007F\s]+/g, '')
  if (!cleaned) return null

  const scheme = cleaned.match(/^([a-z][a-z0-9+.-]*):/i)
  if (scheme) {
    return SAFE_PROTOCOLS.has(scheme[1].toLowerCase()) ? cleaned : null
  }

  if (cleaned.startsWith('//')) return null
  if (cleaned.startsWith('/') || cleaned.startsWith('#')) return cleaned

  // Bare domain such as "github.com/user"
  return `https://${cleaned}`
}

export function isExternalHref(href) {
  return /^https?:\/\//i.test(href)
}

function isTag(node) {
  return node.type === 'tag' || node.type === 'script' || node.type === 'style'
}

function hasVisibleText(inline) {
  return inline.some((node) =>
    node.type === 'text'
      ? node.text.trim() !== ''
      : Array.isArray(node.children) && hasVisibleText(node.children)
  )
}

function parseInline(nodes) {
  const result = []

  for (const node of nodes) {
    if (node.type === 'text') {
      if (node.data) result.push({ type: 'text', text: node.data })
      continue
    }

    if (!isTag(node)) continue

    const name = node.name.toLowerCase()

    if (DROPPED_TAGS.has(name)) continue
    if (name === 'ul' || name === 'ol') continue

    if (name === 'br') {
      result.push({ type: 'br' })
      continue
    }

    const children = parseInline(node.children || [])

    if (INLINE_MARKS[name]) {
      if (children.length) result.push({ type: INLINE_MARKS[name], children })
      continue
    }

    if (name === 'a') {
      const href = safeHref(node.attribs?.href)
      if (href && children.length) {
        result.push({ type: 'a', href, children })
      } else {
        result.push(...children)
      }
      continue
    }

    // Unknown / block tags inside inline content: keep the text only.
    result.push(...children)
  }

  return result
}

function parseList(node) {
  const items = []

  for (const child of node.children || []) {
    if (!isTag(child) || child.name.toLowerCase() !== 'li') continue

    const children = []
    const lists = []

    for (const part of child.children || []) {
      const partName = isTag(part) ? part.name.toLowerCase() : ''

      if (partName === 'ul' || partName === 'ol') {
        const nested = parseList(part)
        if (nested) lists.push(nested)
      } else if (partName === 'p' || partName === 'div') {
        const inline = parseInline(part.children || [])
        if (!hasVisibleText(inline)) continue
        if (hasVisibleText(children)) children.push({ type: 'br' })
        children.push(...inline)
      } else {
        children.push(...parseInline([part]))
      }
    }

    if (hasVisibleText(children) || lists.length) {
      items.push({ children, lists })
    }
  }

  return items.length
    ? { type: node.name.toLowerCase() === 'ol' ? 'ol' : 'ul', items }
    : null
}

function parseBlocks(nodes) {
  const blocks = []
  let pending = []

  const flush = () => {
    if (hasVisibleText(pending)) blocks.push({ type: 'p', children: pending })
    pending = []
  }

  for (const node of nodes) {
    if (node.type === 'text') {
      pending.push({ type: 'text', text: node.data })
      continue
    }

    if (!isTag(node)) continue

    const name = node.name.toLowerCase()

    if (DROPPED_TAGS.has(name)) continue

    if (name === 'p') {
      flush()
      const children = parseInline(node.children || [])
      if (hasVisibleText(children)) blocks.push({ type: 'p', children })
    } else if (HEADINGS[name]) {
      flush()
      const children = parseInline(node.children || [])
      if (hasVisibleText(children)) {
        blocks.push({ type: HEADINGS[name], children })
      }
    } else if (name === 'ul' || name === 'ol') {
      flush()
      const list = parseList(node)
      if (list) blocks.push(list)
    } else if (name === 'li') {
      flush()
      const list = parseList({ name: 'ul', children: [node] })
      if (list) blocks.push(list)
    } else if (CONTAINERS.has(name)) {
      flush()
      blocks.push(...parseBlocks(node.children || []))
    } else {
      pending.push(...parseInline([node]))
    }
  }

  flush()
  return blocks
}

function textItem(text) {
  return { children: [{ type: 'text', text }], lists: [] }
}

/**
 * Parse a stored rich-text value into blocks.
 *
 * legacy: how legacy plain text is interpreted
 *   'list'       - one bullet per line (Project / Experience descriptions)
 *   'paragraphs' - blank-line separated paragraphs, single newlines
 *                  kept as line breaks (About summary)
 */
export function parseRichText(value, { legacy = 'paragraphs' } = {}) {
  if (typeof value !== 'string' || !value.trim()) return []

  if (isRichHtml(value)) {
    return parseBlocks(parseDocument(value).children)
  }

  if (legacy === 'list') {
    const lines = parseDescription(value)
    return lines.length ? [{ type: 'ul', items: lines.map(textItem) }] : []
  }

  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'p',
      children: paragraph.split(/\r?\n/).flatMap((line, index) =>
        index === 0
          ? [{ type: 'text', text: line }]
          : [{ type: 'br' }, { type: 'text', text: line }]
      ),
    }))
}

/**
 * Number of "units" for View More / Less: each paragraph or heading
 * counts once, each top-level list item counts once.
 */
export function countUnits(blocks) {
  return blocks.reduce(
    (total, block) => total + (block.items ? block.items.length : 1),
    0
  )
}

/** The first `limit` units, splitting a list if needed. */
export function truncateBlocks(blocks, limit) {
  const result = []
  let remaining = limit

  for (const block of blocks) {
    if (remaining <= 0) break

    if (block.items) {
      const items = block.items.slice(0, remaining)
      result.push({ ...block, items })
      remaining -= items.length
    } else {
      result.push(block)
      remaining -= 1
    }
  }

  return result
}

function inlineToText(inline) {
  return inline
    .map((node) => {
      if (node.type === 'text') return node.text
      if (node.type === 'br') return ' '
      return inlineToText(node.children || [])
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Plain text of the first unit (e.g. for a compact preview). */
export function firstUnitText(blocks) {
  const [first] = blocks
  if (!first) return ''

  return inlineToText(first.items ? first.items[0].children : first.children)
}

/* ---------------------------------------------------------------
   Serialization (admin editor input)
---------------------------------------------------------------- */

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineToHtml(inline) {
  return inline
    .map((node) => {
      if (node.type === 'text') return escapeHtml(node.text)
      if (node.type === 'br') return '<br>'
      if (node.type === 'a') {
        return `<a href="${escapeHtml(node.href)}">${inlineToHtml(node.children)}</a>`
      }
      return `<${node.type}>${inlineToHtml(node.children)}</${node.type}>`
    })
    .join('')
}

function blocksToHtml(blocks) {
  return blocks
    .map((block) => {
      if (block.items) {
        const items = block.items
          .map(
            (item) =>
              `<li><p>${inlineToHtml(item.children)}</p>${blocksToHtml(item.lists)}</li>`
          )
          .join('')
        return `<${block.type}>${items}</${block.type}>`
      }
      return `<${block.type}>${inlineToHtml(block.children)}</${block.type}>`
    })
    .join('')
}

/**
 * HTML to load into the admin editor. Legacy plain text is converted
 * (lines -> bullet list, or paragraphs) so nothing is lost when an
 * existing record is edited for the first time.
 */
export function toEditorHtml(value, options) {
  return blocksToHtml(parseRichText(value, options))
}
