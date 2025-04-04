import express from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany()
    res.json(experiences)
  } catch (err) {
    console.error('❌ Error fetching experiences:', err)
    res.status(500).json({ error: 'Failed to fetch experiences' })
  }
})

export default router
