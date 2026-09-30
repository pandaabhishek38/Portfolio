'use client'

import { useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  MdFormatBold,
  MdFormatClear,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatUnderlined,
  MdLink,
  MdLinkOff,
  MdRedo,
  MdUndo,
} from 'react-icons/md'
import { safeHref, toEditorHtml } from '../../utils/richText'
import './RichTextEditor.css'

/*
 * Admin rich-text editor (Tiptap).
 *
 * Emits HTML limited to what the backend sanitizer and the public
 * renderer support: paragraphs, h3/h4, bold, italic, underline,
 * bullet/numbered lists, links and line breaks.
 *
 * `value` is only read on mount; remount (via `key`) to load another
 * record. Legacy plain text is converted for editing using `legacy`
 * ('list' or 'paragraphs'), but is only saved once the admin edits it.
 */

const extensions = [
  StarterKit.configure({
    heading: { levels: [3, 4] },
    blockquote: false,
    code: false,
    codeBlock: false,
    strike: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: 'https',
      protocols: ['mailto', 'tel'],
      isAllowedUri: (url) => Boolean(safeHref(url)),
      HTMLAttributes: { target: null, rel: null },
    },
  }),
]

function ToolbarButton({ label, icon: Icon, onClick, active, disabled }) {
  return (
    <button
      type="button"
      className={`rte__button${active ? ' rte__button--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      {...(active === undefined ? {} : { 'aria-pressed': active })}
    >
      <Icon aria-hidden="true" />
    </button>
  )
}

export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  legacy = 'paragraphs',
}) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [linkError, setLinkError] = useState('')

  const editor = useEditor({
    extensions,
    content: toEditorHtml(value, { legacy }),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rte__content',
        id,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.isEmpty ? '' : current.getHTML())
    },
  })

  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => {
      if (!current) return null

      return {
        bold: current.isActive('bold'),
        italic: current.isActive('italic'),
        underline: current.isActive('underline'),
        bulletList: current.isActive('bulletList'),
        orderedList: current.isActive('orderedList'),
        link: current.isActive('link'),
        blockType: current.isActive('heading', { level: 3 })
          ? 'h3'
          : current.isActive('heading', { level: 4 })
            ? 'h4'
            : 'p',
        canUndo: current.can().undo(),
        canRedo: current.can().redo(),
      }
    },
  })

  if (!editor || !state) {
    return <div className="rte rte--loading" aria-hidden="true" />
  }

  const chain = () => editor.chain().focus()

  const setBlockType = (type) => {
    if (type === 'p') chain().setParagraph().run()
    else chain().setHeading({ level: type === 'h3' ? 3 : 4 }).run()
  }

  const openLink = () => {
    setLinkValue(editor.getAttributes('link').href || '')
    setLinkError('')
    setLinkOpen(true)
  }

  const closeLink = () => {
    setLinkOpen(false)
    setLinkError('')
    editor.commands.focus()
  }

  const applyLink = () => {
    const href = safeHref(linkValue)

    if (!href) {
      setLinkError('Enter a valid http(s), mailto: or tel: link.')
      return
    }

    if (editor.state.selection.empty && !editor.isActive('link')) {
      // No selected text: insert the URL itself as the link text.
      chain()
        .insertContent({
          type: 'text',
          text: linkValue.trim(),
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run()
    } else {
      chain().extendMarkRange('link').setLink({ href }).run()
    }

    setLinkOpen(false)
    setLinkError('')
  }

  const removeLink = () => {
    chain().extendMarkRange('link').unsetLink().run()
    setLinkOpen(false)
  }

  return (
    <div className="rte">
      <div
        className="rte__toolbar"
        role="toolbar"
        aria-label={`${label} formatting`}
      >
        <ToolbarButton
          label="Undo"
          icon={MdUndo}
          onClick={() => chain().undo().run()}
          disabled={!state.canUndo}
        />
        <ToolbarButton
          label="Redo"
          icon={MdRedo}
          onClick={() => chain().redo().run()}
          disabled={!state.canRedo}
        />

        <span className="rte__divider" aria-hidden="true" />

        <select
          className="rte__select"
          aria-label="Text style"
          value={state.blockType}
          onChange={(e) => setBlockType(e.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h3">Heading</option>
          <option value="h4">Subheading</option>
        </select>

        <span className="rte__divider" aria-hidden="true" />

        <ToolbarButton
          label="Bold"
          icon={MdFormatBold}
          onClick={() => chain().toggleBold().run()}
          active={state.bold}
        />
        <ToolbarButton
          label="Italic"
          icon={MdFormatItalic}
          onClick={() => chain().toggleItalic().run()}
          active={state.italic}
        />
        <ToolbarButton
          label="Underline"
          icon={MdFormatUnderlined}
          onClick={() => chain().toggleUnderline().run()}
          active={state.underline}
        />

        <span className="rte__divider" aria-hidden="true" />

        <ToolbarButton
          label="Bulleted list"
          icon={MdFormatListBulleted}
          onClick={() => chain().toggleBulletList().run()}
          active={state.bulletList}
        />
        <ToolbarButton
          label="Numbered list"
          icon={MdFormatListNumbered}
          onClick={() => chain().toggleOrderedList().run()}
          active={state.orderedList}
        />

        <span className="rte__divider" aria-hidden="true" />

        <ToolbarButton
          label={state.link ? 'Edit link' : 'Add link'}
          icon={MdLink}
          onClick={openLink}
          active={state.link}
        />
        <ToolbarButton
          label="Remove link"
          icon={MdLinkOff}
          onClick={removeLink}
          disabled={!state.link}
        />

        <span className="rte__divider" aria-hidden="true" />

        <ToolbarButton
          label="Clear formatting"
          icon={MdFormatClear}
          onClick={() => chain().unsetAllMarks().clearNodes().run()}
        />
      </div>

      {linkOpen && (
        <div className="rte__link-bar">
          <label className="rte__link-label" htmlFor={`${id}-link`}>
            Link URL
          </label>
          <input
            id={`${id}-link`}
            type="text"
            className="rte__link-input"
            value={linkValue}
            placeholder="https://"
            autoFocus
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyLink()
              }
              if (e.key === 'Escape') {
                e.preventDefault()
                closeLink()
              }
            }}
            aria-invalid={Boolean(linkError)}
            aria-describedby={linkError ? `${id}-link-error` : undefined}
          />
          <button type="button" className="rte__link-apply" onClick={applyLink}>
            Apply
          </button>
          <button type="button" className="rte__link-cancel" onClick={closeLink}>
            Cancel
          </button>
          {linkError && (
            <p id={`${id}-link-error`} className="rte__link-error" role="alert">
              {linkError}
            </p>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
