/*
 * Image upload validation. The type is detected from the file's own bytes
 * (magic numbers), never from the browser-supplied Content-Type.
 * SVG and other formats are deliberately not accepted.
 */

export const MAX_LOGO_BYTES = 1024 * 1024 // 1 MB

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function startsWith(buffer, bytes, offset = 0) {
  return bytes.every((byte, i) => buffer[offset + i] === byte)
}

/** { mime, extension } for PNG / JPEG / WebP, otherwise null. */
export function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null

  if (startsWith(buffer, PNG_SIGNATURE)) {
    return { mime: 'image/png', extension: 'png' }
  }

  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return { mime: 'image/jpeg', extension: 'jpg' }
  }

  // "RIFF" <size> "WEBP"
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: 'webp' }
  }

  return null
}
