import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// GET summary
router.get('/summary', async (req, res) => {
  try {
    const summaries = await prisma.aboutSummary.findMany()
    res.json(summaries)
  } catch (err) {
    console.error('❌ Failed to fetch summary:', err)
    res.status(500).json({ error: 'Could not fetch about summary' })
  }
})

// GET education
router.get('/education', async (req, res) => {
  try {
    const education = await prisma.education.findMany()
    res.json(education)
  } catch (err) {
    console.error('❌ Failed to fetch education:', err)
    res.status(500).json({ error: 'Could not fetch education info' })
  }
})

// GET skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany()
    res.json(skills)
  } catch (err) {
    console.error('❌ Failed to fetch skills:', err)
    res.status(500).json({ error: 'Could not fetch skills' })
  }
})

// Combined GET /api/about
router.get('/', async (req, res) => {
  try {
    const summary = await prisma.aboutSummary.findFirst()
    const education = await prisma.education.findMany()
    const skills = await prisma.skill.findMany()

    res.json({ summary, education, skills })
  } catch (err) {
    console.error('❌ Failed to fetch about section:', err)
    res.status(500).json({ error: 'Failed to fetch about section' })
  }
})

export default router
