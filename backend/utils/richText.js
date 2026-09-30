import sanitizeHtml from 'sanitize-html'

/*
 * Rich-text content (AboutSummary.content, Project.description,
 * Experience.description) is stored as sanitized HTML.
 *
 * Legacy content is plain text (newline separated). A value is treated
 * as HTML only when it starts with a block-level tag, which is what the
 * admin editor always produces. The frontend uses the same rule
 * (src/utils/richText.js) and always renders plain text escaped.
 */
const RICH_HTML_PATTERN = /^\s*<(p|h[1-6]|ul|ol|div|blockquote)[\s>]/i

export function isRichHtml(value) {
  return typeof value === 'string' && RICH_HTML_PATTERN.test(value)
}

// Only the formatting the editor supports. Everything else is removed.
const RICH_TEXT_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h3', 'h4', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href'] },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // Dropped together with their content
  nonTextTags: [
    'script',
    'style',
    'textarea',
    'option',
    'noscript',
    'iframe',
    'object',
    'embed',
    'template',
    'svg',
    'math',
    'select',
    'button',
  ],
  transformTags: {
    b: 'strong',
    i: 'em',
    h1: 'h3',
    h2: 'h3',
    h5: 'h4',
    h6: 'h4',
    div: 'p',
  },
}

const TEXT_ONLY_OPTIONS = { allowedTags: [], allowedAttributes: {} }

/**
 * Sanitize a rich-text field before it is persisted.
 * - HTML: reduced to the supported tag/attribute/protocol allowlist.
 *   Content with no visible text (e.g. "<p></p>") becomes ''.
 * - Legacy plain text: stored unchanged (it is never rendered as HTML).
 * - Anything else: ''.
 */
export function sanitizeRichText(value) {
  if (typeof value !== 'string') return ''
  if (!isRichHtml(value)) return value

  const clean = sanitizeHtml(value, RICH_TEXT_OPTIONS).trim()
  const visibleText = sanitizeHtml(clean, TEXT_ONLY_OPTIONS).trim()

  return visibleText ? clean : ''
}
