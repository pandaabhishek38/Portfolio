import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../middleware/verifyToken.js'
import { sanitizeRichText } from '../utils/richText.js'
import { parseOptionalImageUrl } from '../utils/imageUrl.js'
import { deleteManagedObject, managedObjectPath } from '../utils/storage.js'
import { EXPERIENCE_LOGO_FOLDER } from './admin/uploads.js'
import {
  DISPLAY_ORDER,
  applyDisplayOrder,
  nextDisplayOrder,
  parseOrderedIds,
  sameMembers,
} from '../utils/ordering.js'

const prisma = new PrismaClient()
const router = express.Router()

/*
 * Best-effort removal of a previous logo file from Supabase Storage after
 * the database no longer references it. Never fails the request: an
 * orphaned file is harmless, a failed save is not.
 */
async function removeUnusedLogo(url) {
  if (!managedObjectPath(url, EXPERIENCE_LOGO_FOLDER)) return

  try {
    const references = await prisma.experience.count({ where: { logoUrl: url } })
    if (references === 0) await deleteManagedObject(url, EXPERIENCE_LOGO_FOLDER)
  } catch (err) {
    console.error('Could not remove previous experience logo:', err)
  }
}

router.use(verifyToken)

// CREATE Experience (appended at the end of the current order)
router.post('/', async (req, res) => {
  const { company, role, period, location, description } = req.body
  const logo = parseOptionalImageUrl(req.body.logoUrl)
  if (logo.error) return res.status(400).json({ error: logo.error })

  try {
    const displayOrder = await nextDisplayOrder(prisma.experience)
    const created = await prisma.experience.create({
      data: {
        company,
        role,
        period,
        location,
        description: sanitizeRichText(description),
        logoUrl: logo.value ?? null,
        displayOrder,
      },
    })
    res.status(201).json(created)
  } catch (err) {
    console.error('Failed to add experience:', err)
    res.status(500).json({ error: 'Failed to add experience' })
  }
})

// REORDER Experience: { orderedIds: [id, ...] } must list every entry once
router.put('/order', async (req, res) => {
  const orderedIds = parseOrderedIds(req.body?.orderedIds)
  if (!orderedIds) {
    return res
      .status(400)
      .json({ error: 'orderedIds must be an array of unique experience ids' })
  }

  try {
    const existing = await prisma.experience.findMany({ select: { id: true } })
    if (!sameMembers(existing.map((e) => e.id), orderedIds)) {
      return res.status(400).json({
        error: 'orderedIds must include every experience entry exactly once',
      })
    }

    await applyDisplayOrder(prisma, prisma.experience, orderedIds)

    const experiences = await prisma.experience.findMany({
      orderBy: DISPLAY_ORDER,
    })
    res.json(experiences)
  } catch (err) {
    console.error('Failed to reorder experience:', err)
    res.status(500).json({ error: 'Failed to save experience order' })
  }
})

// UPDATE Experience
router.put('/:id', async (req, res) => {
  const { company, role, period, location, description } = req.body
  const { id } = req.params
  const logo = parseOptionalImageUrl(req.body.logoUrl)
  if (logo.error) return res.status(400).json({ error: logo.error })

  try {
    const previous =
      logo.value === undefined
        ? null
        : await prisma.experience.findUnique({
            where: { id: parseInt(id) },
            select: { logoUrl: true },
          })

    const updated = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        company,
        role,
        period,
        location,
        description:
          description === undefined ? undefined : sanitizeRichText(description),
        logoUrl: logo.value,
      },
    })

    // Logo replaced or removed: delete the old file if it was ours
    if (previous?.logoUrl && previous.logoUrl !== updated.logoUrl) {
      await removeUnusedLogo(previous.logoUrl)
    }

    res.json(updated)
  } catch (err) {
    console.error('Failed to update experience:', err)
    res.status(500).json({ error: 'Failed to update experience' })
  }
})

// DELETE Experience
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const deleted = await prisma.experience.delete({
      where: { id: parseInt(id) },
    })

    if (deleted.logoUrl) await removeUnusedLogo(deleted.logoUrl)

    res.json({ message: 'Experience deleted successfully' })
  } catch (err) {
    console.error('Failed to delete experience:', err)
    res.status(500).json({ error: 'Failed to delete experience' })
  }
})

export default router
