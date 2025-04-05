import express from 'express'
import { PrismaClient } from '@prisma/client'
import verifyToken from '../middleware/verifyToken.js'

const prisma = new PrismaClient()
const router = express.Router()

// Protect all routes with verifyToken
router.use(verifyToken)

// GET all projects (admin-only)
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany()
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

// POST new project
router.post('/', async (req, res) => {
  const { title, stack, github, description } = req.body
  try {
    const newProject = await prisma.project.create({
      data: { title, stack, github, description },
    })
    res.status(201).json(newProject)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// PUT update project
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, stack, github, description } = req.body
  try {
    const updated = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { title, stack, github, description },
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
