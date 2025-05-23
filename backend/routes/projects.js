import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany()
    res.json(projects)
  } catch (err) {
    console.error('❌ Error fetching projects:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

export default router
