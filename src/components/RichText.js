import { isExternalHref, parseRichText } from '../utils/richText'
import './RichText.css'

/*
 * Renders the allowlisted rich-text tree from utils/richText.js as React
 * elements. No HTML string is ever injected into the page.
 *
 * Pass either pre-parsed `blocks` (e.g. after View More truncation) or a
 * raw `value` plus the `legacy` plain-text mode.
 */

function renderInline(nodes, keyPrefix) {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`

    switch (node.type) {
      case 'text':
        return node.text
      case 'br':
        return <br key={key} />
      case 'strong':
        return <strong key={key}>{renderInline(node.children, key)}</strong>
      case 'em':
        return <em key={key}>{renderInline(node.children, key)}</em>
      case 'u':
        return <u key={key}>{renderInline(node.children, key)}</u>
      case 'a': {
        const external = isExternalHref(node.href)

        return (
          <a
            key={key}
            href={node.href}
            className="rich-text__link"
            {...(external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            {renderInline(node.children, key)}
            {external && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        )
      }
      default:
        return null
    }
  })
}

function renderList(block, key) {
  const Tag = block.type === 'ol' ? 'ol' : 'ul'

  return (
    <Tag key={key}>
      {block.items.map((item, index) => {
        const itemKey = `${key}-${index}`

        return (
          <li key={itemKey}>
            {renderInline(item.children, itemKey)}
            {item.lists.map((list, listIndex) =>
              renderList(list, `${itemKey}-list-${listIndex}`)
            )}
          </li>
        )
      })}
    </Tag>
  )
}

export function renderBlocks(blocks) {
  return blocks.map((block, index) => {
    const key = `block-${index}`

    if (block.items) return renderList(block, key)

    if (block.type === 'h3' || block.type === 'h4') {
      const Heading = block.type

      return (
        <Heading key={key} className="rich-text__heading">
          {renderInline(block.children, key)}
        </Heading>
      )
    }

    return <p key={key}>{renderInline(block.children, key)}</p>
  })
}

export default function RichText({ blocks, value, legacy = 'paragraphs' }) {
  const content = blocks || parseRichText(value, { legacy })

  return <>{renderBlocks(content)}</>
}
