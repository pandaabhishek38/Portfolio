'use client'

import { useRef, useState } from 'react'
import { MdZoomIn, MdZoomOut } from 'react-icons/md'
import ExperienceLogo from '../ExperienceLogo'
import {
  LOGO_SHAPES,
  LOGO_ZOOM_DEFAULT,
  LOGO_ZOOM_MAX,
  LOGO_ZOOM_MIN,
  LOGO_ZOOM_STEP,
  normalizeLogoShape,
  normalizeLogoZoom,
} from '../../utils/logoDisplay'

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_BYTES = 1024 * 1024 // 1 MB, same as the backend and bucket
const MIN_SIDE = 128

const STORAGE_PATH = '/storage/v1/object/public/'

async function readDimensions(file) {
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close?.()
    return size
  } catch {
    return null
  }
}

/**
 * Company logo control for Admin -> Experience.
 *
 * Uploading stores the file in Supabase Storage (via the backend) and puts
 * its public URL into the form; nothing changes on the public site until
 * the form is saved.
 *
 * - onChange(url)        new logo URL for the form ('' = no logo)
 * - onUploaded(url)      a new, not-yet-saved upload exists
 * - onDiscard(url)       a URL is no longer used by this form
 * - onSessionExpired()   the admin token was rejected
 * - shape / onShapeChange(shape)  'square' | 'circle' (tile shape)
 * - zoom / onZoomChange(zoom)     50-200 (%), scales the logo in the tile
 *
 * Shape and zoom are independent of the file: uploading or replacing a
 * logo keeps them, and the preview reflects them immediately.
 */
export default function LogoUploadField({
  id,
  value,
  company,
  onChange,
  onUploaded,
  onDiscard,
  onSessionExpired,
  shape,
  zoom,
  onShapeChange,
  onZoomChange,
}) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const uploading = status.type === 'uploading'

  const isLegacyValue = Boolean(value) && !value.includes(STORAGE_PATH)
  const tileShape = normalizeLogoShape(shape)
  const zoomValue = normalizeLogoZoom(zoom)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow choosing the same file again
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus({
        type: 'error',
        message: 'Unsupported format. Use a PNG, JPEG or WebP image.',
      })
      return
    }

    if (file.size > MAX_BYTES) {
      setStatus({
        type: 'error',
        message: 'File is too large. The maximum size is 1 MB.',
      })
      return
    }

    setStatus({ type: 'uploading', message: 'Uploading...' })

    try {
      const token = localStorage.getItem('token')
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(`${baseURL}/api/admin/uploads/experience-logo`, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          Authorization: `Bearer ${token}`,
        },
        body: file,
      })

      if (res.status === 401 || res.status === 403) {
        setStatus({ type: 'idle', message: '' })
        onSessionExpired?.()
        return
      }

      let data = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!res.ok || typeof data?.url !== 'string') {
        throw new Error(
          typeof data?.error === 'string'
            ? data.error
            : 'Upload failed. Please try again.'
        )
      }

      const previous = value
      onUploaded?.(data.url)
      onChange(data.url)
      if (previous) onDiscard?.(previous)

      const size = await readDimensions(file)
      setStatus(
        size && (size.width < MIN_SIDE || size.height < MIN_SIDE)
          ? {
              type: 'warning',
              message: `Logo uploaded, but it is only ${size.width} x ${size.height} px. At least ${MIN_SIDE} x ${MIN_SIDE} px looks sharper. Save to apply it.`,
            }
          : { type: 'success', message: 'Logo uploaded. Save to apply it.' }
      )
    } catch (err) {
      console.error('Logo upload failed:', err)
      setStatus({
        type: 'error',
        message: err.message || 'Upload failed. Please try again.',
      })
    }
  }

  const handleRemove = () => {
    const previous = value
    onChange('')
    if (previous) onDiscard?.(previous)
    setStatus({
      type: 'success',
      message:
        'Logo removed. Save to apply it; the company initials will be shown.',
    })
  }

  return (
    <div
      className="admin-logo-field"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <span id={`${id}-label`} className="admin-field-label">
        Company logo{' '}
        <span className="admin-logo-field__optional">(optional)</span>
      </span>

      <div className="admin-logo-field__row">
        <ExperienceLogo
          size="lg"
          logoUrl={value}
          company={company}
          shape={tileShape}
          zoom={zoomValue}
        />

        <div className="admin-logo-field__controls">
          <div className="admin-logo-field__actions">
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFile}
              hidden
            />

            <button
              type="button"
              className="admin-logo-field__button admin-logo-field__button--primary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-describedby={`${id}-hint`}
            >
              {uploading
                ? 'Uploading...'
                : value
                  ? 'Replace logo'
                  : 'Upload logo'}
            </button>

            {value && (
              <button
                type="button"
                className="admin-logo-field__button"
                onClick={handleRemove}
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>

          <div className="admin-logo-settings">
            <fieldset className="admin-logo-settings__group">
              <legend className="admin-logo-settings__label">Logo Shape</legend>
              <div className="admin-segmented">
                {LOGO_SHAPES.map((option) => (
                  <label
                    key={option.value}
                    className={`admin-segmented__option${
                      tileShape === option.value ? ' is-selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      name={`${id}-shape`}
                      value={option.value}
                      checked={tileShape === option.value}
                      onChange={() => onShapeChange?.(option.value)}
                    />
                    <span
                      className={`admin-segmented__swatch admin-segmented__swatch--${option.value}`}
                      aria-hidden="true"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="admin-logo-settings__group">
              <label
                className="admin-logo-settings__label"
                htmlFor={`${id}-zoom`}
              >
                Logo Zoom
              </label>
              <div className="admin-logo-zoom">
                <MdZoomOut
                  className="admin-logo-zoom__icon"
                  aria-hidden="true"
                />
                <input
                  id={`${id}-zoom`}
                  type="range"
                  className="admin-logo-zoom__slider"
                  min={LOGO_ZOOM_MIN}
                  max={LOGO_ZOOM_MAX}
                  step={LOGO_ZOOM_STEP}
                  value={zoomValue}
                  onChange={(e) => onZoomChange?.(Number(e.target.value))}
                  disabled={!value}
                  aria-valuetext={`${zoomValue}%`}
                  aria-describedby={`${id}-zoom-hint`}
                />
                <MdZoomIn
                  className="admin-logo-zoom__icon"
                  aria-hidden="true"
                />
                <output
                  className="admin-logo-zoom__value"
                  htmlFor={`${id}-zoom`}
                >
                  {zoomValue}%
                </output>
                <button
                  type="button"
                  className="admin-logo-zoom__reset"
                  onClick={() => onZoomChange?.(LOGO_ZOOM_DEFAULT)}
                  disabled={!value || zoomValue === LOGO_ZOOM_DEFAULT}
                >
                  Reset
                </button>
              </div>
              <span id={`${id}-zoom-hint`} className="admin-logo-zoom__hint">
                {value
                  ? 'Left zooms out, right zooms in.'
                  : 'Upload a logo to adjust its zoom.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p id={`${id}-hint`} className="admin-logo-field__hint">
        PNG, JPEG or WebP, up to 1 MB. A square image of at least 128 x 128 px
        on a transparent or white background works best. Without a logo, the
        company initials are shown.
      </p>

      {isLegacyValue && (
        <p className="admin-logo-field__hint">
          Current logo is a link ({value}). Upload a file to replace it.
        </p>
      )}

      <p
        className={`admin-logo-field__status admin-logo-field__status--${status.type}`}
        role="status"
        aria-live="polite"
      >
        {status.message}
      </p>
    </div>
  )
}
