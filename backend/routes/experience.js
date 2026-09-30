import express from 'express'
import { PrismaClient } from '@prisma/client'
import { DISPLAY_ORDER } from '../utils/ordering.js'

const prisma = new PrismaClient()
const router = express.Router()

// GET all experience entries (admin-controlled order)
router.get('/', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: DISPLAY_ORDER,
    })
    res.json(experiences)
  } catch (err) {
    console.error('❌ Error fetching experiences:', err)
    res.status(500).json({ error: 'Failed to fetch experiences' })
  }
})

export default router
