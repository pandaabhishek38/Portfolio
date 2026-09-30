import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../middleware/verifyToken.js'
import { sanitizeRichText } from '../utils/richText.js'
import {
  DISPLAY_ORDER,
  applyDisplayOrder,
  nextDisplayOrder,
  parseOrderedIds,
  sameMembers,
} from '../utils/ordering.js'

const prisma = new PrismaClient()
const router = express.Router()

// Protect all routes with verifyToken
router.use(verifyToken)

// GET all projects (admin-only)
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: DISPLAY_ORDER })
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// POST new project (appended at the end of the current order)
router.post('/', async (req, res) => {
  const { title, stack, github, description } = req.body
  try {
    const displayOrder = await nextDisplayOrder(prisma.project)
    const newProject = await prisma.project.create({
      data: {
        title,
        stack,
        github,
        description: sanitizeRichText(description),
        displayOrder,
      },
    })
    res.status(201).json(newProject)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// PUT reorder: { orderedIds: [id, ...] } must list every project once
router.put('/order', async (req, res) => {
  const orderedIds = parseOrderedIds(req.body?.orderedIds)
  if (!orderedIds) {
    return res
      .status(400)
      .json({ error: 'orderedIds must be an array of unique project ids' })
  }

  try {
    const existing = await prisma.project.findMany({ select: { id: true } })
    if (!sameMembers(existing.map((p) => p.id), orderedIds)) {
      return res
        .status(400)
        .json({ error: 'orderedIds must include every project exactly once' })
    }

    await applyDisplayOrder(prisma, prisma.project, orderedIds)

    const projects = await prisma.project.findMany({ orderBy: DISPLAY_ORDER })
    res.json(projects)
  } catch (err) {
    console.error('Failed to reorder projects:', err)
    res.status(500).json({ error: 'Failed to save project order' })
  }
})

// PUT update project
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, stack, github, description } = req.body
  try {
    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        title,
        stack,
        github,
        description:
          description === undefined ? undefined : sanitizeRichText(description),
      },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update project' })
  }
})

// DELETE project
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await prisma.project.delete({ where: { id: parseInt(id) } })
    res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' })
  }
})

export default router
