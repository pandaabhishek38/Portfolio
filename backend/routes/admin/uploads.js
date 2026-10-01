// backend/routes/admin/uploads.js
import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../../middleware/verifyToken.js'
import { MAX_LOGO_BYTES, detectImageType } from '../../utils/imageFile.js'
import {
  StorageNotConfiguredError,
  deleteManagedObject,
  managedObjectPath,
  uploadPublicImage,
} from '../../utils/storage.js'

const prisma = new PrismaClient()
const router = express.Router()

export const EXPERIENCE_LOGO_FOLDER = 'experience-logos'

/*
 * PUT /api/admin/uploads/experience-logo
 * Body: the raw image bytes (PNG, JPEG or WebP, max 1 MB).
 * Returns { url } to be saved as Experience.logoUrl.
 */
router.put(
  '/experience-logo',
  verifyToken,
  express.raw({ type: () => true, limit: MAX_LOGO_BYTES }),
  async (req, res) => {
    const buffer = req.body

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return res.status(400).json({ error: 'No image file was received.' })
    }

    const type = detectImageType(buffer)
    if (!type) {
      return res
        .status(415)
        .json({ error: 'Unsupported image format. Use PNG, JPEG or WebP.' })
    }

    try {
      const { url } = await uploadPublicImage({
        folder: EXPERIENCE_LOGO_FOLDER,
        buffer,
        contentType: type.mime,
        extension: type.extension,
      })

      res.status(201).json({ url })
    } catch (err) {
      if (err instanceof StorageNotConfiguredError) {
        return res.status(503).json({ error: err.message })
      }
      console.error('Experience logo upload failed:', err)
      res.status(502).json({ error: 'Could not upload the logo. Please try again.' })
    }
  }
)

/*
 * DELETE /api/admin/uploads/experience-logo  { url }
 * Discards an uploaded logo that was never saved (e.g. the admin cancelled
 * or picked another file). Only deletes files in our bucket's logo folder
 * that no Experience entry references.
 */
router.delete('/experience-logo', verifyToken, async (req, res) => {
  const url = req.body?.url

  if (!managedObjectPath(url, EXPERIENCE_LOGO_FOLDER)) {
    return res.status(400).json({ error: 'Not a managed experience logo URL.' })
  }

  try {
    const references = await prisma.experience.count({ where: { logoUrl: url } })
    if (references > 0) {
      return res.json({ deleted: false, reason: 'in-use' })
    }

    await deleteManagedObject(url, EXPERIENCE_LOGO_FOLDER)
    res.json({ deleted: true })
  } catch (err) {
    if (err instanceof StorageNotConfiguredError) {
      return res.status(503).json({ error: err.message })
    }
    console.error('Experience logo delete failed:', err)
    res.status(502).json({ error: 'Could not delete the logo file.' })
  }
})

export default router
