// backend/routes/admin/about.js
import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../../middleware/verifyToken.js'
import { sanitizeRichText } from '../../utils/richText.js'
import {
  applyDisplayOrder,
  getOrderedSkills,
  nextDisplayOrder,
  parseOrderedIds,
  parseOrderedNames,
  sameMembers,
} from '../../utils/ordering.js'

const router = express.Router()
const prisma = new PrismaClient()

// UPDATE summary
router.put('/summary/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { content } = req.body

  try {
    const updated = await prisma.aboutSummary.update({
      where: { id: parseInt(id) },
      data: {
        content: content === undefined ? undefined : sanitizeRichText(content),
      },
    })

    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update summary:', err)
    res.status(500).json({ error: 'Failed to update summary' })
  }
})

// UPDATE education
router.put('/education/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { university, degree, major, fromYear, toYear, courses } = req.body

  try {
    const updated = await prisma.education.update({
      where: { id: parseInt(id) },
      data: { university, degree, major, fromYear, toYear, courses },
    })
    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update education:', err)
    res.status(500).json({ error: 'Failed to update education' })
  }
})

// DELETE education
router.delete('/education/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.education.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Education deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete education:', err)
    res.status(500).json({ error: 'Failed to delete education' })
  }
})

// CREATE education
router.post('/education', verifyToken, async (req, res) => {
  const { university, degree, major, fromYear, toYear, courses } = req.body

  try {
    const created = await prisma.education.create({
      data: {
        university,
        degree,
        major,
        fromYear: parseInt(fromYear),
        toYear: parseInt(toYear),
        courses,
      },
    })

    res.status(201).json(created)
  } catch (err) {
    console.error('❌ Failed to create education:', err)
    res.status(500).json({ error: err.message })
  }
})

// REORDER skill categories: { orderedTypes: [type, ...] }
// Must list every category currently used by a skill exactly once.
router.put('/skill-types/order', verifyToken, async (req, res) => {
  const orderedTypes = parseOrderedNames(req.body?.orderedTypes)
  if (!orderedTypes) {
    return res
      .status(400)
      .json({ error: 'orderedTypes must be an array of unique category names' })
  }

  try {
    const used = await prisma.skill.findMany({
      distinct: ['type'],
      select: { type: true },
    })
    if (!sameMembers(used.map((s) => s.type), orderedTypes)) {
      return res.status(400).json({
        error: 'orderedTypes must include every skill category exactly once',
      })
    }

    await prisma.$transaction(
      orderedTypes.map((name, index) =>
        prisma.skillType.upsert({
          where: { name },
          create: { name, displayOrder: index },
          update: { displayOrder: index },
        })
      )
    )

    res.json(await getOrderedSkills(prisma))
  } catch (err) {
    console.error('Failed to reorder skill categories:', err)
    res.status(500).json({ error: 'Failed to save category order' })
  }
})

// REORDER skills within one category: { type, orderedIds: [id, ...] }
// Must list every skill of that category exactly once.
router.put('/skills/order', verifyToken, async (req, res) => {
  const type = req.body?.type
  const orderedIds = parseOrderedIds(req.body?.orderedIds)

  if (typeof type !== 'string' || !type || !orderedIds) {
    return res.status(400).json({
      error: 'type and orderedIds (unique skill ids) are required',
    })
  }

  try {
    const inType = await prisma.skill.findMany({
      where: { type },
      select: { id: true },
    })
    if (!sameMembers(inType.map((s) => s.id), orderedIds)) {
      return res.status(400).json({
        error: 'orderedIds must include every skill in this category exactly once',
      })
    }

    await applyDisplayOrder(prisma, prisma.skill, orderedIds)

    res.json(await getOrderedSkills(prisma))
  } catch (err) {
    console.error('Failed to reorder skills:', err)
    res.status(500).json({ error: 'Failed to save skill order' })
  }
})

// UPDATE skill (moving it to another category appends it there)
router.put('/skills/:id', verifyToken, async (req, res) => {
  const { id } = req.params
  const { name, type } = req.body

  try {
    const current = await prisma.skill.findUnique({
      where: { id: parseInt(id) },
    })
    const typeChanged = current && type !== undefined && type !== current.type

    const updated = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        ...(typeChanged
          ? { displayOrder: await nextDisplayOrder(prisma.skill, { type }) }
          : {}),
      },
    })

    res.json(updated)
  } catch (err) {
    console.error('❌ Failed to update skill:', err)
    res.status(500).json({ error: 'Failed to update skill' })
  }
})

// DELETE skill
router.delete('/skills/:id', verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    await prisma.skill.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Skill deleted successfully' })
  } catch (err) {
    console.error('❌ Failed to delete skill:', err)
    res.status(500).json({ error: 'Failed to delete skill' })
  }
})

// CREATE skill
router.post('/skills', verifyToken, async (req, res) => {
  const { name, type } = req.body

  try {
    const displayOrder = await nextDisplayOrder(prisma.skill, { type })
    const created = await prisma.skill.create({
      data: { name, type, displayOrder },
    })

    res.status(201).json(created)
  } catch (err) {
    console.error('❌ Failed to create skill:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
