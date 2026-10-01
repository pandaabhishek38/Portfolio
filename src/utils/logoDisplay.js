/*
 * Per-experience logo presentation (shape + zoom).
 * Same rules as backend/utils/logoDisplay.js. Anything missing or invalid
 * falls back to the original look: rounded square at 100%.
 */

export const LOGO_SHAPES = [
  { value: 'square', label: 'Rounded square' },
  { value: 'circle', label: 'Circle' },
]

export const LOGO_ZOOM_MIN = 50
export const LOGO_ZOOM_MAX = 200
export const LOGO_ZOOM_STEP = 5
export const LOGO_ZOOM_DEFAULT = 100

export function normalizeLogoShape(shape) {
  return shape === 'circle' ? 'circle' : 'square'
}

export function normalizeLogoZoom(zoom) {
  const value = Number(zoom)
  if (zoom === null || zoom === undefined || !Number.isFinite(value)) {
    return LOGO_ZOOM_DEFAULT
  }

  return Math.min(LOGO_ZOOM_MAX, Math.max(LOGO_ZOOM_MIN, Math.round(value)))
}
