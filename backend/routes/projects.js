import express from 'express'
import { PrismaClient } from '@prisma/client'
import { DISPLAY_ORDER } from '../utils/ordering.js'
import { HOME_ORDER, wantsHomeFeatured } from '../utils/homeFeature.js'

const prisma = new PrismaClient()
const router = express.Router()

// GET all projects (admin-controlled order).
// ?featured=home -> only projects featured on Home, in Home order.
router.get('/', async (req, res) => {
  try {
    const projects = wantsHomeFeatured(req.query)
      ? await prisma.project.findMany({
          where: { featuredOnHome: true },
          orderBy: HOME_ORDER,
        })
      : await prisma.project.findMany({ orderBy: DISPLAY_ORDER })
    res.json(projects)
  } catch (err) {
    console.error('❌ Error fetching projects:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
})

export default router
