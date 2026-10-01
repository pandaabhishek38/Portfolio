/*
 * Validation for per-experience logo presentation settings.
 * Same rules as the frontend (src/utils/logoDisplay.js).
 */

export const LOGO_SHAPES = ['square', 'circle']
export const LOGO_ZOOM_MIN = 50
export const LOGO_ZOOM_MAX = 200

/** undefined -> { value: undefined } (leave unchanged); invalid -> { error }. */
export function parseLogoShape(input) {
  if (input === undefined) return { value: undefined }
  if (LOGO_SHAPES.includes(input)) return { value: input }

  return { error: 'Logo shape must be "square" or "circle"' }
}

/** undefined -> { value: undefined }; whole number 50-200 -> { value }. */
export function parseLogoZoom(input) {
  if (input === undefined) return { value: undefined }

  const zoom = typeof input === 'string' && input.trim() !== '' ? Number(input) : input

  if (
    !Number.isInteger(zoom) ||
    zoom < LOGO_ZOOM_MIN ||
    zoom > LOGO_ZOOM_MAX
  ) {
    return {
      error: `Logo zoom must be a whole number between ${LOGO_ZOOM_MIN} and ${LOGO_ZOOM_MAX}`,
    }
  }

  return { value: zoom }
}
